import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import redis from '@adonisjs/redis/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import hash from '@adonisjs/core/services/hash'
import type User from '#models/auth/user'
import { TokenRepository } from '#repositories/core/token_repository'
import { generateSplitToken } from '#helpers/core/crypto'
import { TOKEN_TYPES } from '#types/core'
import { DateTime } from 'luxon'
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
 * Creates a `selector.validator` password-reset token for a user.
 */
async function createPasswordResetToken(user: User, expiresIn = { hours: 1 }) {
  const tokenRepo = await app.container.make(TokenRepository)
  const { selector, validator, token } = generateSplitToken()
  await tokenRepo.create({
    userId: user.id,
    type: TOKEN_TYPES.PASSWORD_RESET,
    selector,
    token: await hash.make(validator),
    expiresAt: DateTime.now().plus(expiresIn),
  })
  return token
}

/**
 * Functional seam for the reset-password flow
 * (`GET /reset-password/:token` render, `POST /reset-password` execute).
 *
 * Replaces the Playwright browser E2E: we assert the HTTP contract a client
 * observes — the 200 render for a live token, the coded 400 for an invalid or
 * expired token, the 302 to the profile page on a valid submission, and the 422
 * field errors on a weak or mismatched password.
 */
test.group('Reset password endpoint', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(resetSharedState)
  group.each.setup(() => limiter.clear())
  group.each.teardown(() => limiter.clear())

  test('reset (render): a live token renders the reset form', async ({ client }) => {
    const user = await createVerifiedUser({
      email: 'reset-render@example.com',
      password: 'OldPassword123!',
    })
    const token = await createPasswordResetToken(user)

    const res = await client.get(`/reset-password/${token}`)

    res.assertStatus(200)
  })

  test('reset (render): an invalid token returns a coded 400', async ({ client, assert }) => {
    const res = await client.get('/reset-password/invalid-token').redirects(0).accept('json')

    res.assertStatus(400)
    assert.equal(res.body().error.code, 'E_INVALID_TOKEN')
  })

  test('reset (render): an expired token returns a coded 400', async ({ client, assert }) => {
    const user = await createVerifiedUser({
      email: 'reset-expired@example.com',
      password: 'OldPassword123!',
    })
    const token = await createPasswordResetToken(user, { hours: -1 })

    const res = await client.get(`/reset-password/${token}`).redirects(0).accept('json')

    res.assertStatus(400)
    assert.equal(res.body().error.code, 'E_INVALID_TOKEN')
  })

  test('reset (execute): a valid token changes the password and redirects to the profile', async ({
    client,
  }) => {
    const user = await createVerifiedUser({
      email: 'reset-execute@example.com',
      password: 'OldPassword123!',
    })
    const token = await createPasswordResetToken(user)

    const res = await client
      .post('/reset-password')
      .redirects(0)
      .withCsrfToken()
      .form({ token, password: 'NewPassword123!', password_confirmation: 'NewPassword123!' })
      .send()

    res.assertStatus(302)
    res.assertHeader('location', '/settings/profile')
  })

  test('reset (execute): a weak password returns a 422 with a password field error', async ({
    client,
    assert,
  }) => {
    const user = await createVerifiedUser({
      email: 'reset-weak@example.com',
      password: 'OldPassword123!',
    })
    const token = await createPasswordResetToken(user)

    const res = await client
      .post('/reset-password')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .form({ token, password: 'weak', password_confirmation: 'weak' })
      .send()

    res.assertStatus(422)
    assert.exists(res.body().errors.find((e: { field: string }) => e.field === 'password'))
  })

  test('reset (execute): a confirmation mismatch returns a 422 with a password field error', async ({
    client,
    assert,
  }) => {
    const user = await createVerifiedUser({
      email: 'reset-mismatch@example.com',
      password: 'OldPassword123!',
    })
    const token = await createPasswordResetToken(user)

    const res = await client
      .post('/reset-password')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .form({ token, password: 'NewPassword123!', password_confirmation: 'Different123!' })
      .send()

    res.assertStatus(422)
    assert.exists(
      res.body().errors.find((e: { field: string }) => e.field === 'password_confirmation')
    )
  })
})
