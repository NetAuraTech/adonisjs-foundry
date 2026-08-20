import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import emitter from '@adonisjs/core/services/emitter'
import redis from '@adonisjs/redis/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import { MaintenanceService } from '#services/maintenance/maintenance_service'
import { createVerifiedUser } from '#tests/helpers/create_verified_user'

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
 * Functional seam for the forgot-password endpoint (`POST /forgot-password`).
 *
 * Replaces the Playwright browser E2E: we assert the HTTP contract a client
 * observes — the 302 to the login page for BOTH a known and an unknown email
 * (no user enumeration), the 422 field error on an invalid email format, and
 * the 429 after the throttle — instead of driving a real browser. The
 * `ForgotPassword` mail event is faked so the suite never touches a transport.
 */
test.group('Forgot password endpoint', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(resetSharedState)
  group.each.setup(() => limiter.clear())
  group.each.setup(() => {
    emitter.fake()
    return () => emitter.restore()
  })
  group.each.teardown(() => limiter.clear())

  test('forgot: a known email redirects to the login page', async ({ client }) => {
    await createVerifiedUser({ email: 'forgot@example.com', password: 'TestPassword123!' })

    const res = await client
      .post('/forgot-password')
      .redirects(0)
      .withCsrfToken()
      .form({ email: 'forgot@example.com' })
      .send()

    res.assertStatus(302)
    res.assertHeader('location', '/login')
  })

  test('forgot: an unknown email redirects to the login page (no enumeration)', async ({
    client,
  }) => {
    const res = await client
      .post('/forgot-password')
      .redirects(0)
      .withCsrfToken()
      .form({ email: 'nonexistent@example.com' })
      .send()

    res.assertStatus(302)
    res.assertHeader('location', '/login')
  })

  test('forgot: an invalid email format returns a 422 with an email field error', async ({
    client,
    assert,
  }) => {
    const res = await client
      .post('/forgot-password')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .form({ email: 'invalid-email' })
      .send()

    res.assertStatus(422)
    assert.exists(res.body().errors.find((e: { field: string }) => e.field === 'email'))
  })

  test('forgot: the endpoint is throttled after exceeding the attempt limit', async ({
    client,
    assert,
  }) => {
    // The route is limited to 3 attempts per hour: the first three are
    // processed (302) and the fourth is 429.
    const statuses: number[] = []
    for (let i = 0; i < 4; i++) {
      const res = await client
        .post('/forgot-password')
        .redirects(0)
        .withCsrfToken()
        .accept('json')
        .form({ email: `forgot-throttle-${i}-${Date.now()}@example.com` })
        .send()
      statuses.push(res.status())
    }

    assert.deepEqual(statuses, [302, 302, 302, 429])
  })
})
