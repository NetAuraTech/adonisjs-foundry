import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import redis from '@adonisjs/redis/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import hash from '@adonisjs/core/services/hash'
import User from '#models/auth/user'
import { TokenRepository } from '#repositories/core/token_repository'
import { generateSplitToken } from '#helpers/core/crypto'
import { TOKEN_TYPES } from '#types/core'
import { DateTime } from 'luxon'
import { MaintenanceService } from '#services/maintenance/maintenance_service'

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
 * Creates a `selector.validator` pending-invitation token for a user.
 */
async function createInviteToken(user: User, expiresIn = { hours: 1 }) {
  const tokenRepo = await app.container.make(TokenRepository)
  const { selector, validator, token } = generateSplitToken()
  await tokenRepo.create({
    userId: user.id,
    type: TOKEN_TYPES.PENDING_INVITE,
    selector,
    token: await hash.make(validator),
    expiresAt: DateTime.now().plus(expiresIn),
  })
  return token
}

/**
 * Functional seam for the accept-invitation flow
 * (`GET /accept-invitation/:token` render, `POST /accept-invitation` execute).
 *
 * Replaces the Playwright browser E2E: we assert the HTTP contract a client
 * observes — the 200 render for a live token, the coded 400 for an invalid
 * token, the 302 to the settings index plus the email-verified user row on a
 * valid submission, and the 422 field errors on a weak or mismatched password.
 */
test.group('Accept invitation endpoint', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(resetSharedState)
  group.each.setup(() => limiter.clear())
  group.each.teardown(() => limiter.clear())

  test('accept (render): a live token renders the invitation form', async ({ client }) => {
    const user = await User.create({
      email: 'invite-render@example.com',
      username: 'invite-render',
    })
    const token = await createInviteToken(user)

    const res = await client.get(`/accept-invitation/${token}`)

    res.assertStatus(200)
  })

  test('accept (render): an invalid token returns a coded 400', async ({ client, assert }) => {
    const res = await client.get('/accept-invitation/invalid-token').redirects(0).accept('json')

    res.assertStatus(400)
    assert.equal(res.body().error.code, 'E_INVALID_TOKEN')
  })

  test('accept (execute): a valid token activates the user and redirects to settings', async ({
    client,
    assert,
  }) => {
    const user = await User.create({
      email: 'invite-success@example.com',
      username: 'invite-success',
      password: null,
    })
    const token = await createInviteToken(user)

    const res = await client
      .post('/accept-invitation')
      .redirects(0)
      .withCsrfToken()
      .form({
        token,
        email: user.email,
        username: user.username,
        password: 'NewPassword123!',
        password_confirmation: 'NewPassword123!',
      })
      .send()

    res.assertStatus(302)
    res.assertHeader('location', '/settings')

    await user.refresh()
    assert.isNotNull(user.emailVerifiedAt)
  })

  test('accept (execute): a weak password returns a 422 with a password field error', async ({
    client,
    assert,
  }) => {
    const user = await User.create({
      email: 'invite-weak@example.com',
      username: 'invite-weak',
      password: null,
    })
    const token = await createInviteToken(user)

    const res = await client
      .post('/accept-invitation')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .form({
        token,
        email: user.email,
        username: user.username,
        password: 'weak',
        password_confirmation: 'weak',
      })
      .send()

    res.assertStatus(422)
    assert.exists(res.body().errors.find((e: { field: string }) => e.field === 'password'))
  })

  test('accept (execute): a confirmation mismatch returns a 422 with a password field error', async ({
    client,
    assert,
  }) => {
    const user = await User.create({
      email: 'invite-mismatch@example.com',
      username: 'invite-mismatch',
      password: null,
    })
    const token = await createInviteToken(user)

    const res = await client
      .post('/accept-invitation')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .form({
        token,
        email: user.email,
        username: user.username,
        password: 'NewPassword123!',
        password_confirmation: 'Different123!',
      })
      .send()

    res.assertStatus(422)
    assert.exists(
      res.body().errors.find((e: { field: string }) => e.field === 'password_confirmation')
    )
  })
})
