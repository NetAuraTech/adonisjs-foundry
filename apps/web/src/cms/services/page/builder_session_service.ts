import { inject } from '@adonisjs/core';
import { CacheService } from '#shared/services/cache_service';
import type { Lock, UserSession } from '#cms/types/builder';

const LOCK_TTL_S = 5;
const SESSION_TTL_S = 3600;

const PRESENCE_COLORS = [
	'#6366f1',
	'#ec4899',
	'#f59e0b',
	'#10b981',
	'#3b82f6',
	'#ef4444',
	'#8b5cf6',
	'#06b6d4',
	'#f97316',
	'#84cc16',
] as const;

/**
 * Manages builder presence and optimistic field locks using Redis via
 * `CacheService`. State is fully serialised — no in-memory Maps.
 *
 * **Key layout** (relative to each namespaced CacheService):
 * ```
 * session  → "{translationId}:{userId}"            UserSession, TTL 1h
 * lock     → "{translationId}:{blockId}:{fieldKey}" Lock, TTL 5s (auto-expires)
 * color    → "{translationId}:{userId}"            hex string, TTL 1h
 * ```
 *
 * Absolute Redis keys (with full prefix):
 * ```
 * builder:session:42:7
 * builder:lock:42:block-hero:title
 * builder:color:42:7
 * ```
 *
 * **Lock expiry**
 * TTL is managed by Redis natively — no `setTimeout` required. The server can
 * listen for keyspace expiry events and invoke `onLockExpired` to broadcast
 * `LOCK_EXPIRED` to channel subscribers.
 */
@inject()
export class BuilderSessionService {
	private readonly sessions: CacheService;
	private readonly locks: CacheService;
	private readonly colors: CacheService;
	private readonly drafts: CacheService;
	private readonly meta: CacheService;

	/**
	 * Called when a lock expires via Redis keyspace notification.
	 * Wire this up in `start/transmit.ts` to broadcast `LOCK_EXPIRED`.
	 */
	onLockExpired?: (translationId: number, lock: Lock) => void;

	constructor(cache: CacheService) {
		const ns = cache.namespace('builder');
		this.sessions = ns.namespace('session');
		this.locks = ns.namespace('lock');
		this.colors = ns.namespace('color');
		this.drafts = ns.namespace('draft');
		this.meta = ns.namespace('meta');
	}

	/**
	 * Registers a user as an active editor. Idempotent — returns the existing
	 * session unchanged if already present.
	 */
	async join(
		translationId: number,
		user: { userId: number; userName: string; userEmail: string },
	): Promise<UserSession> {
		const key = `${translationId}:${user.userId}`;
		const existing = await this.sessions.get<UserSession>(key);
		if (existing) return existing;

		const color = await this.assignColor(translationId, user.userId);
		// joinedAt has millisecond resolution: two joins within the same
		// millisecond compare equal and getPresence() then returns them in
		// unspecified (Redis keys) order. Nothing depends on that ordering.
		const session: UserSession = { ...user, color, joinedAt: new Date() };

		await this.sessions.set(key, session, SESSION_TTL_S);
		return session;
	}

	/**
	 * Associates a `pageId` with a `translationId` so the keyspace subscriber
	 * can reconstruct the SSE channel name on lock expiry.
	 * TTL matches sessions — cleaned up automatically.
	 */
	async saveMeta(translationId: number, pageId: number): Promise<void> {
		await this.meta.set(`${translationId}`, { pageId }, SESSION_TTL_S);
	}

	/**
	 * Returns `{ pageId }` for a translation, or `null` if not found.
	 */
	async getMeta(translationId: number): Promise<{ pageId: number } | null> {
		return this.meta.get<{ pageId: number }>(`${translationId}`);
	}

	/**
	 * Removes a user's session and releases all their locks.
	 * Returns the released locks so the caller can broadcast them.
	 */
	async leave(translationId: number, userId: number): Promise<Lock[]> {
		const released = await this.releaseAllLocks(translationId, userId);
		await this.sessions.delete(`${translationId}:${userId}`);
		await this.colors.delete(`${translationId}:${userId}`);
		return released;
	}

	/**
	 * Returns the active session for a user, or `null`.
	 */
	async getSession(translationId: number, userId: number): Promise<UserSession | null> {
		return this.sessions.get<UserSession>(`${translationId}:${userId}`);
	}

	/**
	 * Returns all active sessions for a translation, sorted by `joinedAt`.
	 */
	async getPresence(translationId: number): Promise<UserSession[]> {
		const entries = await this.sessions.list<UserSession>(`${translationId}:*`);

		return Object.values(entries).sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
	}

	/**
	 * Attempts to acquire an optimistic lock on `(translationId, blockId, fieldKey)`.
	 *
	 * - Free field → lock granted via an atomic set-if-absent, so two
	 *   concurrent claims of the same free field yield exactly one winner.
	 * - Same user re-acquires → TTL renewed (heartbeat) via an atomic
	 *   compare-and-set, so only the owning user can renew.
	 * - Another user holds it → denied, returns existing lock info.
	 */
	async acquireLock(
		translationId: number,
		blockId: string,
		fieldKey: string,
		userId: number,
	): Promise<{ acquired: boolean; lock: Lock }> {
		const key = `${translationId}:${blockId}:${fieldKey}`;
		const existing = await this.locks.get<Lock>(key);

		if (existing && existing.userId !== userId) {
			return { acquired: false, lock: existing as Lock };
		}

		const session = await this.getSession(translationId, userId);
		const lock: Omit<Lock, 'timer'> = {
			blockId,
			fieldKey,
			userId,
			userName: session?.userName ?? 'Unknown',
			userColor: session?.color ?? PRESENCE_COLORS[0],
			expiresAt: new Date(Date.now() + LOCK_TTL_S * 1000),
		};

		if (existing) {
			// Heartbeat: renew only if the lock is still the one we observed.
			if (await this.locks.compareAndSet(key, existing, lock, LOCK_TTL_S)) {
				return { acquired: true, lock: lock as Lock };
			}
			return this.resolveContendedClaim(key, userId, lock);
		}

		if (await this.locks.setIfAbsent(key, lock, LOCK_TTL_S)) {
			return { acquired: true, lock: lock as Lock };
		}
		return this.resolveContendedClaim(key, userId, lock);
	}

	/**
	 * Resolves a claim that lost its atomic race: re-reads the current holder
	 * and either renews it (when we ourselves now hold it, e.g. two parallel
	 * heartbeats), claims it (when it expired in the gap) or denies with the
	 * holder's lock info. Bounded retries cover fan-out of parallel claims
	 * from the same user.
	 */
	private async resolveContendedClaim(
		key: string,
		userId: number,
		claim: Omit<Lock, 'timer'>,
	): Promise<{ acquired: boolean; lock: Lock }> {
		for (let attempt = 0; attempt < 3; attempt++) {
			const current = await this.locks.get<Lock>(key);

			if (current === null) {
				// Free again — the competing lock expired in the gap.
				if (await this.locks.setIfAbsent(key, claim, LOCK_TTL_S)) {
					return { acquired: true, lock: claim as Lock };
				}
				continue;
			}

			if (current.userId !== userId) {
				return { acquired: false, lock: current as Lock };
			}

			if (await this.locks.compareAndSet(key, current, claim, LOCK_TTL_S)) {
				return { acquired: true, lock: claim as Lock };
			}
			// Lost the renewal race to a concurrent heartbeat — retry with a fresh read.
		}

		const current = await this.locks.get<Lock>(key);
		return { acquired: false, lock: (current ?? claim) as Lock };
	}

	/**
	 * Explicitly releases a lock before its TTL expires.
	 * No-op if the lock doesn't exist or belongs to a different user. The
	 * delete is compare-and-checked against the observed lock, so a lock that
	 * expired and was re-acquired in the gap is never released.
	 */
	async releaseLock(translationId: number, blockId: string, fieldKey: string, userId: number): Promise<Lock | null> {
		const key = `${translationId}:${blockId}:${fieldKey}`;
		const existing = await this.locks.get<Lock>(key);

		if (!existing || existing.userId !== userId) return null;

		const released = await this.locks.compareAndDelete(key, existing);
		return released ? (existing as Lock) : null;
	}

	/**
	 * Releases all locks held by a user on a translation.
	 * Called from `start/transmit.ts` when an SSE connection drops.
	 */
	async releaseAllLocks(translationId: number, userId: number): Promise<Lock[]> {
		const entries = await this.locks.list<Lock>(`${translationId}:*`);
		const released: Lock[] = [];

		await Promise.all(
			Object.entries(entries).map(async ([key, existing]) => {
				if (existing.userId !== userId) return;
				if (await this.locks.compareAndDelete(key, existing)) {
					released.push(existing as Lock);
				}
			}),
		);

		return released;
	}

	/**
	 * Returns all active locks for a translation.
	 */
	async getLocks(translationId: number): Promise<Lock[]> {
		const entries = await this.locks.list<Lock>(`${translationId}:*`);
		return Object.values(entries) as Lock[];
	}

	/**
	 * Returns the lock for a specific field, or `null`.
	 */
	async getLock(translationId: number, blockId: string, fieldKey: string): Promise<Lock | null> {
		return this.locks.get<Lock>(`${translationId}:${blockId}:${fieldKey}`);
	}

	/**
	 * Persists the current in-progress content snapshot for a translation.
	 * Called by the client (debounced, ~1s) on every content change so that
	 * late-joining editors see the live state instead of the stale DB version.
	 *
	 * TTL: 24h — long enough to survive a browser refresh but auto-cleanup after
	 * a day of inactivity.
	 */
	async saveDraft(translationId: number, content: unknown): Promise<void> {
		await this.drafts.set(`${translationId}`, content, 86_400);
	}

	/**
	 * Returns the in-progress draft content for a translation, or `null` if
	 * no draft has been pushed yet (e.g. page was never opened by anyone).
	 */
	async getDraft<T = unknown>(translationId: number): Promise<T | null> {
		return this.drafts.get<T>(`${translationId}`);
	}

	/**
	 * Removes the draft when all editors leave (called from `leave()` when the
	 * last active session disappears).
	 */
	async clearDraft(translationId: number): Promise<void> {
		await this.drafts.delete(`${translationId}`);
	}

	/**
	 * Assigns a stable colour to a user for this translation session.
	 * Colour index is based on how many users are already present.
	 */
	private async assignColor(translationId: number, userId: number): Promise<string> {
		const existing = await this.colors.get<string>(`${translationId}:${userId}`);
		if (existing) return existing;

		const presence = await this.getPresence(translationId);
		const color = PRESENCE_COLORS[presence.length % PRESENCE_COLORS.length];

		await this.colors.set(`${translationId}:${userId}`, color, SESSION_TTL_S);
		return color;
	}
}
