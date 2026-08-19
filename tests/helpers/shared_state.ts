import app from '@adonisjs/core/services/app'
import redis from '@adonisjs/redis/services/main'
import { MaintenanceService } from '#services/maintenance/maintenance_service'

/**
 * Maintenance state lives in Redis and persists across runs: an interrupted
 * suite (or a dev session sharing the Redis instance) can leave maintenance
 * ON and 503 every request.
 *
 * Flushes the Redis database and forces maintenance OFF so a test group starts
 * from a clean, non-degraded state.
 *
 * The allowlist is cleared too: the service is a process-wide singleton with an
 * in-memory CIDR cache that survives `flushdb`, so a leftover entry (e.g.
 * '127.0.0.1' set by an earlier spec) keeps the middleware bypassing
 * maintenance for the local test client.
 */
export async function resetSharedState() {
  await redis.flushdb()
  const service = await app.container.make(MaintenanceService)
  await service.setConfig({ enabled: false, allowedIps: [] })
}
