import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import redis from '@adonisjs/redis/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/auth/user'
import { MaintenanceService } from '#services/maintenance/maintenance_service'
import { createVerifiedUser } from '#tests/helpers/browser/create_verified_user'

/**
 * Maintenance state lives in Redis and persists across runs: an interrupted
 * suite (or a dev session sharing the Redis instance) can leave maintenance
 * ON and 503 every request.
 */
async function resetSharedState() {
  await redis.flushdb()
  const service = await app.container.make(MaintenanceService)
  await service.setConfig({ enabled: false })
}

/**
 * API token authentication — guard-separation coverage that depends on the
 * CMS API. Split out of `tests/functional/auth/api_token_auth.spec.ts` so the
 * `inertia` flavor (which prunes the CMS API routes) can drop it alongside
 * them.
 */
test.group('API token authentication (CMS routes)', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(resetSharedState)
  group.each.setup(() => limiter.clear())
  group.each.teardown(() => limiter.clear())

  test('a bearer token does not authenticate session-guarded CMS routes', async ({ client }) => {
    const user = await createVerifiedUser({ email: 'api-matrix-token@example.com' })
    const token = await User.accessTokens.create(user)

    // The CMS API keeps the session guard exclusively.
    const res = await client
      .get('/api/admin/templates')
      .accept('json')
      .bearerToken(token.value!.release())

    res.assertStatus(401)
  })
})
