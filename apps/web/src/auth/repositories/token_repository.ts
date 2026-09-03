import { inject } from '@adonisjs/core';
import hash from '@adonisjs/core/services/hash';
import { DateTime } from 'luxon';
import { Token } from '#auth/domain/token';
import { TOKEN_TYPES, type FullToken, type TokenType } from '#auth/enums/token_type';
import InvalidTokenException from '#auth/exceptions/invalid_token_exception';
import MaxAttemptsExceededException from '#auth/exceptions/max_attempts_exceeded_exception';
import TokenModel from '#auth/models/token';
import { BaseRepository } from '#core/repositories/base_repository';
import { transactionContext } from '#core/services/transaction_context';
import User from '#identity/models/user';
import { LogService } from '#log/services/log_service';

/**
 * Handles all database operations for the {@link TokenModel} model.
 *
 * Tokens follow the **selector/validator pattern**: the selector is stored
 * in plain text for fast database lookup, while the validator is hashed so
 * that a database leak does not expose usable tokens.
 *
 * This repository is the single source of truth for all token lifecycle
 * operations: creation, verification, attempt tracking, and expiration —
 * across every token type (`EMAIL_VERIFICATION`, `PASSWORD_RESET`,
 * `EMAIL_CHANGE`, `PENDING_INVITE`).
 *
 * **Conventions:**
 * - Low-level methods (`getUserFromToken`, `findBySelector`, `verify`) return
 *   `null` or `boolean` for ordinary failures — they are internal utilities.
 *   A locked token is the one exception: {@link MaxAttemptsExceededException}
 *   propagates from every verification path, so a brute-forced client always
 *   sees the lockout (HTTP 429), never a plain "invalid token".
 * - High-level public methods (`getEmailVerificationUser`, `getPasswordResetUser`,
 *   `getEmailChangeUser`, `getUserInvitationToken`) throw {@link InvalidTokenException}
 *   so that callers never need to handle a `null` return.
 * - Attempt accounting goes through {@link checkAttempts} — the single
 *   increment path — exactly once per token presentation, so one request
 *   consumes exactly one attempt (see the method's documented semantics).
 */
@inject()
export class TokenRepository extends BaseRepository {
	/**
	 * Maximum verification attempts allowed for any token type.
	 */
	readonly MAX_ATTEMPTS = 3;

	constructor(protected logService: LogService) {
		super();
	}

	/**
	 * Finds a token by its primary key.
	 *
	 * @param id - The token's primary key.
	 * @returns The matching token model, or `null` if not found.
	 *
	 * @example
	 * const token = await tokenRepository.findById(1)
	 */
	async findById(id: number): Promise<TokenModel | null> {
		return await TokenModel.query(this.client()).where('id', id).first();
	}

	/**
	 * Creates and persists a new token.
	 *
	 * The `token` field should contain the **hashed** validator — plain-text
	 * validators must be hashed by the caller before being passed here.
	 *
	 * @param data - The token data to persist.
	 * @returns The newly created token record.
	 *
	 * @example
	 * const token = await tokenRepository.create({ userId, type, selector, token: hashedValidator })
	 */
	async create(data: Partial<TokenModel>): Promise<TokenModel> {
		return TokenModel.create(data as any, this.client());
	}

	/**
	 * Finds a token record by its plain-text selector and expected type.
	 *
	 * Does not verify the validator hash — use {@link verify} for that.
	 * Returns `null` if no matching record exists or if the token has expired.
	 *
	 * @param selector - The plain-text selector portion of the token.
	 * @param type - The expected token type to filter by.
	 * @returns The matching token record, or `null`.
	 */
	async findBySelector(selector: string, type: TokenType): Promise<TokenModel | null> {
		return await TokenModel.query(this.client())
			.where('selector', selector)
			.where('type', type)
			.where('expires_at', '>', DateTime.now().toSQL())
			.first();
	}

	/**
	 * Verifies the validator portion of a token against its stored hash.
	 *
	 * Checks attempt count before verifying the token so that a brute-forced
	 * token returns {@link MaxAttemptsExceededException} rather than
	 * {@link InvalidTokenException}. Every call consumes exactly one attempt
	 * (see {@link checkAttempts}).
	 *
	 * @param token - The raw `selector.validator` token to verify.
	 * @param type - The expected token type.
	 * @returns `true` if the validator matches, `false` otherwise.
	 * @throws {MaxAttemptsExceededException} If the attempt counter has reached
	 *   or exceeded the maximum allowed attempts.
	 */
	async verify(token: FullToken, type: TokenType): Promise<boolean> {
		const parts = Token.split(token);

		if (!parts) return false;

		await this.checkAttempts(token);

		const record = await this.findBySelector(parts.selector, type);
		if (!record) return false;

		return hash.verify(record.token, parts.validator);
	}

	/**
	 * The single code path for attempt accounting: records one verification
	 * attempt for a token and enforces the lockout.
	 *
	 * Every token presentation — through {@link verify} or any of the
	 * `getUser*` / `verify*` helpers — flows through here exactly once, so a
	 * single request consumes exactly one attempt, regardless of outcome:
	 *
	 * - the counter is checked before incrementing: once it reaches
	 *   `MAX_ATTEMPTS`, further presentations throw
	 *   {@link MaxAttemptsExceededException} without incrementing;
	 * - a failed verification (bad validator, wrong type, or expired token)
	 *   still consumes one attempt against an existing record;
	 * - an unknown selector or a malformed token consumes nothing — there is
	 *   no record to increment;
	 * - a successful password reset expires the token via
	 *   {@link expirePasswordResetTokens}, after which the counter is
	 *   irrelevant.
	 *
	 * @param token - The raw `selector.validator` token.
	 * @throws {MaxAttemptsExceededException} If the attempt counter has reached
	 *   or exceeded the maximum allowed attempts.
	 */
	async checkAttempts(token: FullToken): Promise<void> {
		const parts = Token.split(token);

		if (!parts) return;

		const record = await TokenModel.query(this.client()).where('selector', parts.selector).first();

		if (!record) return;

		if (record.toDomain().hasExceededAttempts(this.MAX_ATTEMPTS)) {
			throw new MaxAttemptsExceededException();
		}

		record.attempts += 1;
		await transactionContext.merge(record);
		await record.save();
	}

	/**
	 * Expires all tokens of a given type for a user.
	 *
	 * Generic implementation used by the token mail flows and the
	 * convenience helpers below. Sets `expiresAt` to now so that an audit
	 * trail is preserved — records are not deleted.
	 *
	 * @param user - The user whose tokens should be expired.
	 * @param type - The token type to filter by.
	 */
	async expireTokensByType(user: User, type: TokenType): Promise<void> {
		const tokens = await TokenModel.query(this.client()).where('user_id', user.id).where('type', type);

		for (const token of tokens) {
			token.expiresAt = DateTime.now();
			await transactionContext.merge(token);
			await token.save();
		}
	}

	/**
	 * @param user - The user whose email verification tokens should be expired.
	 *
	 * Called after the user's email has been successfully verified, to
	 * invalidate any remaining unverified tokens.
	 */
	async expireEmailVerificationTokens(user: User): Promise<void> {
		await this.expireTokensByType(user, TOKEN_TYPES.EMAIL_VERIFICATION);
	}

	/**
	 * Expires all password reset tokens for a given user.
	 * @param user - The user whose password reset tokens should be expired.
	 * Called after the user's password has been successfully changed, to
	 * invalidate any remaining unverified tokens.
	 */
	async expirePasswordResetTokens(user: User): Promise<void> {
		await this.expireTokensByType(user, TOKEN_TYPES.PASSWORD_RESET);
	}

	/**
	 * Resolves a token to its associated {@link User}.
	 *
	 * Delegates verification to {@link verify} so that attempt tracking is
	 * always applied before hash comparison. Loads the associated user with
	 * role and permissions preloaded. Returns `null` on ordinary failure
	 * (invalid validator, wrong type, expired token, unknown record) — but a
	 * locked token propagates {@link MaxAttemptsExceededException}, matching
	 * {@link getUserInvitationToken}.
	 *
	 * @param token - The raw `selector.validator` token.
	 * @param type - The expected token type to filter by.
	 * @returns The associated {@link User}, or `null`.
	 * @throws {MaxAttemptsExceededException} If the attempt counter has reached
	 *   or exceeded the maximum allowed attempts.
	 */
	async getUserFromToken(token: FullToken, type: TokenType): Promise<User | null> {
		const parts = Token.split(token);

		if (!parts) return null;

		// Delegate to verify() so attempt tracking is always applied.
		// MaxAttemptsExceededException propagates — a locked token is a
		// distinct, client-relevant state (429), not a plain invalid token.
		const isValid = await this.verify(token, type);
		if (!isValid) return null;

		const data = await TokenModel.query(this.client())
			.where('selector', parts.selector)
			.where('type', type)
			.where('expires_at', '>', DateTime.now().toSQL())
			.first();

		if (!data || !data.userId) return null;

		const user = await User.query(this.client()).where('id', data.userId).first();
		if (!user) return null;

		await user.load('role', (query) => {
			query.preload('permissions');
		});

		return user;
	}

	/**
	 * Re-acquires a token row with an exclusive lock and re-asserts that it is
	 * still usable, making the read and the act atomic.
	 *
	 * Must be the **first query** inside the transaction that acts on the
	 * token (see /docs/agents/toctou-protection.md): the exclusive
	 * `SELECT ... FOR UPDATE` serializes concurrent presentations of the same
	 * token, so by the time a second transaction reaches this query the first
	 * has already committed — and a consumed token is expired, so the re-check
	 * below rejects it.
	 *
	 * Attempt accounting stays outside the transaction: the presentation that
	 * consumed the increment ({@link verify} → {@link checkAttempts}) already
	 * happened, so a rolled-back act does not lose the attempt.
	 *
	 * A rejected presentation is audited with `logSecurity` before the
	 * exception is thrown — a token consumed concurrently is a security
	 * signal, not an ordinary invalid-token case.
	 *
	 * @param token - The raw `selector.validator` token.
	 * @param type - The expected token type.
	 * @returns The locked token record, still valid and not expired.
	 * @throws {InvalidTokenException} If the token is malformed, missing, or
	 *   no longer valid (e.g. consumed by a concurrent presentation).
	 *
	 * @example
	 * await withTransaction(async () => {
	 *   await tokenRepository.lockUsableToken(token, TOKEN_TYPES.PASSWORD_RESET)
	 *   // safe to act on the token — no concurrent transaction can modify this row
	 * })
	 */
	async lockUsableToken(token: FullToken, type: TokenType): Promise<TokenModel> {
		const parts = Token.split(token);

		if (!parts) {
			throw new InvalidTokenException();
		}

		const record = await TokenModel.query(this.client())
			.where('selector', parts.selector)
			.where('type', type)
			.forUpdate()
			.first();

		if (!record || record.isExpired) {
			this.logService.logSecurity('core.token.double_use_rejected', {
				userId: record?.userId ?? undefined,
				type,
				token: Token.mask(token),
			});

			throw new InvalidTokenException();
		}

		return record;
	}

	/**
	 * Resolves an email verification token to its associated {@link User}.
	 *
	 * Convenience wrapper around {@link getUserFromToken} scoped to the
	 * `EMAIL_VERIFICATION` token type.
	 *
	 * @param token - The raw `selector.validator` token from the verification link.
	 * @returns The associated {@link User}.
	 * @throws {InvalidTokenException} If the token is invalid, expired, or not found.
	 * @throws {MaxAttemptsExceededException} If the attempt counter has reached
	 *   or exceeded the maximum allowed attempts.
	 *
	 * @example
	 * const user = await tokenRepository.getEmailVerificationUser(token)
	 */
	async getEmailVerificationUser(token: FullToken): Promise<User> {
		const user = await this.getUserFromToken(token, TOKEN_TYPES.EMAIL_VERIFICATION);

		if (!user) {
			this.logService.logAuth('core.token.invalid', {});
			throw new InvalidTokenException();
		}

		return user;
	}

	/**
	 * Resolves a password reset token to its associated {@link User}.
	 *
	 * Convenience wrapper around {@link getUserFromToken} scoped to the
	 * `PASSWORD_RESET` token type.
	 *
	 * @param token - The raw `selector.validator` token from the reset link.
	 * @returns The associated {@link User}.
	 * @throws {InvalidTokenException} If the token is invalid, expired, or not found.
	 * @throws {MaxAttemptsExceededException} If the attempt counter has reached
	 *   or exceeded the maximum allowed attempts.
	 *
	 * @example
	 * const user = await tokenRepository.getPasswordResetUser(token)
	 */
	async getPasswordResetUser(token: FullToken): Promise<User> {
		const user = await this.getUserFromToken(token, TOKEN_TYPES.PASSWORD_RESET);

		if (!user) {
			this.logService.logAuth('password.reset.token.invalid', {
				token: Token.mask(token),
			});

			throw new InvalidTokenException();
		}

		return user;
	}

	/**
	 * Resolves an email change token to its associated {@link User}.
	 *
	 * Convenience wrapper around {@link getUserFromToken} scoped to the
	 * `EMAIL_CHANGE` token type.
	 *
	 * @param token - The raw `selector.validator` token from the confirmation link.
	 * @returns The associated {@link User}.
	 * @throws {InvalidTokenException} If the token is invalid, expired, or not found.
	 * @throws {MaxAttemptsExceededException} If the attempt counter has reached
	 *   or exceeded the maximum allowed attempts.
	 *
	 * @example
	 * const user = await tokenRepository.getEmailChangeUser(token)
	 */
	async getEmailChangeUser(token: FullToken): Promise<User> {
		const user = await this.getUserFromToken(token, TOKEN_TYPES.EMAIL_CHANGE);

		if (!user || !user.pendingEmail) {
			this.logService.logAuth('core.token.invalid', {});

			throw new InvalidTokenException();
		}

		return user;
	}

	/**
	 * Retrieves a valid invitation token record by its raw `selector.validator` string.
	 *
	 * Delegates verification to {@link verify} so that attempt tracking is always
	 * applied before hash comparison. Unlike the `getUser*` helpers, this method
	 * returns the token record itself rather than the associated user, allowing
	 * the caller to inspect token metadata (e.g. invited email, expiration).
	 *
	 * @param token - The raw `selector.validator` invitation token.
	 * @returns The matching token record if valid and not expired.
	 * @throws {InvalidTokenException} If the token is invalid, expired, or not found.
	 *
	 * @example
	 * const token = await tokenRepository.getUserInvitationToken(token)
	 */
	async getUserInvitationToken(token: FullToken): Promise<TokenModel> {
		const parts = Token.split(token);

		if (!parts) {
			throw new InvalidTokenException();
		}

		// Delegate to verify() so attempt tracking is always applied.
		try {
			const isValid = await this.verify(token, TOKEN_TYPES.PENDING_INVITE);
			if (!isValid) {
				throw new InvalidTokenException();
			}
		} catch (e) {
			if (e instanceof MaxAttemptsExceededException) throw e;
			throw new InvalidTokenException();
		}

		const data = await TokenModel.query(this.client())
			.where('selector', parts.selector)
			.where('type', TOKEN_TYPES.PENDING_INVITE)
			.where('expires_at', '>', DateTime.now().toSQL())
			.first();

		if (!data) {
			throw new InvalidTokenException();
		}

		await data.load('user', (query) => {
			query.preload('role', (q) => {
				q.preload('permissions');
			});
		});

		return data;
	}

	/**
	 * Permanently deletes all invitation tokens for a given user.
	 *
	 * Unlike the `expire*` helpers which set `expiresAt` to now, this method
	 * removes the records entirely. Typically called after the invitation has
	 * been accepted or revoked.
	 *
	 * @param userId - The primary key of the user whose invitation tokens should
	 *   be deleted.
	 *
	 * @example
	 * await tokenRepository.deleteInvitationTokens(user.id)
	 */
	async deleteInvitationTokens(userId: number): Promise<void> {
		await TokenModel.query(this.client()).where('type', TOKEN_TYPES.PENDING_INVITE).where('user_id', userId).delete();
	}

	/**
	 * Verifies a password reset token against its stored hash.
	 *
	 * Checks attempt count before verifying the token so that a brute-forced
	 * token returns {@link MaxAttemptsExceededException} rather than
	 * {@link InvalidTokenException}.
	 *
	 * Convenience wrapper around {@link verify} scoped to the
	 * `PASSWORD_RESET` token type. A single call consumes exactly one attempt
	 * (see {@link checkAttempts}).
	 *
	 * @param token - The raw `selector.validator` token to verify.
	 * @throws {MaxAttemptsExceededException} If the attempt counter has reached
	 *   or exceeded the maximum allowed attempts.
	 * @throws {InvalidTokenException} If the token is invalid, expired, or not found.
	 *
	 * @example
	 * await tokenRepository.verifyPasswordResetToken(token)
	 */
	async verifyPasswordResetToken(token: FullToken): Promise<void> {
		const isValid = await this.verify(token, TOKEN_TYPES.PASSWORD_RESET);

		if (!isValid) {
			this.logService.logAuth('password.reset.token.invalid', {
				token: Token.mask(token),
			});

			throw new InvalidTokenException();
		}
	}

	/**
	 * Deletes a token by its primary key.
	 *
	 * @param id - The primary key of the token to delete.
	 * @returns `true` if deleted, `false` if not found.
	 */
	async delete(id: number): Promise<boolean> {
		const token = await this.findById(id);

		if (!token) return false;

		await token.delete();
		return true;
	}

	/**
	 * Updates a token by its primary key.
	 *
	 * @param id - The primary key of the token to update.
	 * @param data - Partial token fields to merge into the record.
	 * @returns The updated token record, or `null` if not found.
	 */
	async update(id: number, data: Partial<TokenModel>): Promise<TokenModel | null> {
		const token = await this.findById(id);

		if (!token) return null;

		token.merge(data as any);
		await transactionContext.merge(token);
		await token.save();
		return token;
	}

	/**
	 * Expires all email change tokens for a user.
	 *
	 * @param user - The user whose email change tokens should be expired.
	 */
	async expireEmailChangeTokens(user: User): Promise<void> {
		await this.expireTokensByType(user, TOKEN_TYPES.EMAIL_CHANGE);
	}

	/**
	 * Expires all invitation tokens for a user.
	 *
	 * @param user - The user whose invitation tokens should be expired.
	 */
	async expireInviteTokens(user: User): Promise<void> {
		await this.expireTokensByType(user, TOKEN_TYPES.PENDING_INVITE);
	}
}
