import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import redis from '@adonisjs/redis/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
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
 * Creates a `selector.validator` email-verification token for a user. The
 * `expiresIn` (luxon duration) controls whether the token is live or expired.
 */
async function createEmailVerificationToken(user: User, expiresIn = { hours: 1 }) {
  const tokenRepo = await app.container.make(TokenRepository)
  const { selector, validator, token } = generateSplitToken()
  await tokenRepo.create({
    userId: user.id,
    type: TOKEN_TYPES.EMAIL_VERIFICATION,
    selector,
    token: await hash.make(validator),
    expiresAt: DateTime.now().plus(expiresIn),
  })
  return token
}

/**
 * Functional seam for email verification (`GET /verify/:token`).
 *
 * Replaces the Playwright browser E2E: we assert the HTTP contract a client
 * observes — the 302 to the profile page for a live token (and the verified
 * user row), and the coded 400 for an invalid or expired token — instead of
 * driving a real browser.
 */
test.group('Email verification endpoint', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(resetSharedState)

  test('verify: a live token verifies the email and redirects to the profile', async ({
    client,
    assert,
  }) => {
    const user = await User.create({
      email: 'verify-success@example.com',
      username: 'verify-success',
    })
    const token = await createEmailVerificationToken(user)

    const res = await client.get(`/verify/${token}`).redirects(0)

    res.assertStatus(302)
    res.assertHeader('location', '/settings/profile')

    await user.refresh()
    assert.isNotNull(user.emailVerifiedAt)
  })

  test('verify: an invalid token returns a coded 400', async ({ client, assert }) => {
    const res = await client.get('/verify/invalid-token').redirects(0).accept('json')

    res.assertStatus(400)
    assert.equal(res.body().error.code, 'E_INVALID_TOKEN')
  })

  test('verify: an expired token returns a coded 400', async ({ client, assert }) => {
    const user = await User.create({
      email: 'verify-expired@example.com',
      username: 'verify-expired',
    })
    const token = await createEmailVerificationToken(user, { hours: -1 })

    const res = await client.get(`/verify/${token}`).redirects(0).accept('json')

    res.assertStatus(400)
    assert.equal(res.body().error.code, 'E_INVALID_TOKEN')
  })
})
