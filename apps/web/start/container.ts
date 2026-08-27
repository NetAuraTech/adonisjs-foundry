import app from '@adonisjs/core/services/app';
import mail from '@adonisjs/mail/services/main';
import { BackupEngine } from '#backup/services/backup_engine';
import { BuilderSessionService } from '#cms/domain/services/page/builder_session_service';
import { MailClientContract, type MailClientMessage } from '#core/contracts/mail_client';
import { LogService } from '#log/services/log_service';
import { MaintenanceService } from '#services/maintenance/maintenance_service';
import { RedisCacheDriver } from '#shared/services/cache/drivers/redis_cache_driver';
import { CacheService } from '#shared/services/cache_service';

/**
 * Application-side mail client: a thin wrapper around the AdonisJS mail driver
 * so the kernel {@link MailClientContract} is satisfied without the kernel
 * importing the mail package.
 */
class AdonisMailClient extends MailClientContract {
	async send({ to, subject, template, data }: MailClientMessage): Promise<void> {
		await mail.send((message) => {
			message
				.to(to)
				.subject(subject)
				.htmlView(template, data ?? {});
		});
	}
}

/**
 * IoC container bindings.
 *
 * Singleton services are instantiated exactly once per process and reused
 * across every request — which is what makes in-flight state (locks, sessions)
 * work correctly without serialising to a database on every call.
 * Factory bindings are re-created on each resolution with runtime arguments
 * supplied via {@link app.container.make}.
 *
 * Add this file to `adonisrc.ts` preloads if it isn't already:
 *
 * @example
 * // adonisrc.ts
 * preloads: [
 *   () => import('#start/container'),
 * ]
 */

// ─── BackupEngine (factory) ──────────────────────────────────────────────────

/**
 * Factory binding for {@link BackupEngine} so that callers can resolve it
 * through the container instead of using `new`.  Runtime arguments
 * (`strategyType`, `tempDir`) are supplied at resolution time which keeps
 * the strategy dynamic while still being mockable in tests via
 * {@link app.container.swap}.
 *
 * @example
 * const engine = await app.container.make(BackupEngine, ['full', 'storage/temp/backups'])
 */
app.container.bind(BackupEngine, async (resolver, runtimeValues) => {
	const [strategyType, tempDir] = runtimeValues ?? [];
	const logService = await resolver.make(LogService);
	return new BackupEngine(strategyType, tempDir, logService);
});

// ─── CacheService (singleton) ─────────────────────────────────────────────────

/**
 * The root `CacheService` backed by Redis.
 * Inject or resolve via the container anywhere in the app:
 *
 * @example
 * // In a service or controller
 * const cache = await app.container.make(CacheService)
 * const builderCache = cache.namespace('builder')
 */
app.container.singleton(CacheService, () => {
	const driver = new RedisCacheDriver();
	return new CacheService(driver);
});

// ─── BuilderSessionService (singleton) ───────────────────────────────────────

/**
 * Wires `BuilderSessionService` with the root `CacheService`.
 * Resolved as a singleton so the same instance (and same Redis connection)
 * is reused across all requests.
 */
app.container.singleton(BuilderSessionService, async () => {
	const cache = await app.container.make(CacheService);
	return new BuilderSessionService(cache);
});

// ─── MaintenanceService (singleton) ──────────────────────────────────────────

/**
 * Maintenance service singleton.
 * Handles Redis + memory fallback for maintenance mode configuration.
 * Initializes memory fallback on first resolution.
 */
app.container.singleton(MaintenanceService, async () => {
	const service = MaintenanceService.getInstance();
	await service.initializeMemoryFallback();
	return service;
});

// ─── MailClientContract (singleton) ──────────────────────────────────────────

/**
 * Binds the kernel {@link MailClientContract} to the AdonisJS mail driver.
 * The kernel generic {@link MailService} resolves this through the container,
 * keeping it decoupled from the mail package.
 */
app.container.bind(MailClientContract, () => new AdonisMailClient());
