import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import redis from '@adonisjs/redis/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import type { ApiResponse } from '@japa/api-client'
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
 * VineJS 422 bodies are a flat array of `{ field, message, rule }` entries.
 * Returns the entry for a given field (or undefined when the field is absent).
 */
const fieldError = (res: ApiResponse, field: string) =>
  res.body().errors.find((entry: { field: string }) => entry.field === field)

/**
 * Functional seam for the session (login/logout) endpoints.
 *
 * Replaces the Playwright browser E2E: we assert the HTTP contract a client
 * observes — the 302 redirect target on success, the 401 JSON body with a
 * coded error on bad credentials, the 422 field validation on missing fields,
 * and the 429 after exceeding the login throttle — instead of driving a real
 * browser. State-changing POSTs carry a CSRF token via `withCsrfToken()`
 * (see `tests/bootstrap.ts`).
 */
test.group('Session endpoints (login / logout)', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(resetSharedState)
  group.each.setup(() => limiter.clear())
  group.each.teardown(() => limiter.clear())

  test('login: valid credentials redirect to the profile page and open a session', async ({
    client,
  }) => {
    const user = await createVerifiedUser({
      email: 'login-success@example.com',
      password: 'TestPassword123!',
    })

    const res = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .form({ email: user.email, password: 'TestPassword123!' })
      .send()

    res.assertStatus(302)
    res.assertHeader('location', '/settings/profile')

    // The session cookie now authenticates the user: an auth-guarded page
    // resolves (200) for the same api-client that holds the session.
    const guarded = await client.get('/settings/profile')
    guarded.assertStatus(200)
  })

  test('login: non-existent email returns a coded 401', async ({ client, assert }) => {
    const res = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .form({ email: 'nonexistent@example.com', password: 'wrongpassword' })
      .send()

    res.assertStatus(401)
    assert.equal(res.body().error.code, 'E_INVALID_CREDENTIALS')
  })

  test('login: wrong password returns a coded 401', async ({ client, assert }) => {
    await createVerifiedUser({
      email: 'wrong-password@example.com',
      password: 'CorrectPassword123!',
    })

    const res = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .form({ email: 'wrong-password@example.com', password: 'WrongPassword123!' })
      .send()

    res.assertStatus(401)
    assert.equal(res.body().error.code, 'E_INVALID_CREDENTIALS')
  })

  test('login: missing email returns a 422 with an email field error', async ({
    client,
    assert,
  }) => {
    const res = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .form({ password: 'anypassword' })
      .send()

    res.assertStatus(422)
    assert.exists(fieldError(res, 'email'))
  })

  test('login: missing password returns a 422 with a password field error', async ({
    client,
    assert,
  }) => {
    const res = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .form({ email: 'test@example.com' })
      .send()

    res.assertStatus(422)
    assert.exists(fieldError(res, 'password'))
  })

  test('login: the endpoint is throttled after exceeding the attempt limit', async ({ client }) => {
    // The route is limited to 5 attempts per 15 minutes: the first five are
    // rejected (401, bad credentials) and the sixth is rejected with 429.
    for (let i = 0; i < 5; i++) {
      const res = await client
        .post('/login')
        .redirects(0)
        .withCsrfToken()
        .accept('json')
        .form({ email: 'throttle@example.com', password: 'wrongpassword' })
        .send()
      res.assertStatus(401)
    }

    const denied = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .form({ email: 'throttle@example.com', password: 'wrongpassword' })
      .send()

    denied.assertStatus(429)
  })

  test('login: an authenticated visitor is redirected away from the login page', async ({
    client,
  }) => {
    const user = await createVerifiedUser({
      email: 'already-auth@example.com',
      password: 'TestPassword123!',
    })

    const res = await client.get('/login').loginAs(user).redirects(0)

    res.assertStatus(302)
    res.assertHeader('location', '/')
  })

  test('login: remembering a user establishes a session cookie', async ({ client, assert }) => {
    const user = await createVerifiedUser({
      email: 'remember-me@example.com',
      password: 'TestPassword123!',
    })

    const res = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .form({ email: user.email, password: 'TestPassword123!', remember_me: true })
      .send()

    res.assertStatus(302)
    res.assertHeader('location', '/settings/profile')
    assert.exists(res.cookie('adonis-session'))
  })

  test('logout: an authenticated user is redirected to the login page and the session is cleared', async ({
    client,
  }) => {
    const user = await createVerifiedUser({
      email: 'logout-test@example.com',
      password: 'TestPassword123!',
    })

    const res = await client.post('/logout').redirects(0).withCsrfToken().loginAs(user).send()

    res.assertStatus(302)
    res.assertHeader('location', '/login')

    // The same api-client is no longer authenticated after the logout.
    const guarded = await client.get('/settings/profile').redirects(0)
    guarded.assertStatus(302)
  })
})
