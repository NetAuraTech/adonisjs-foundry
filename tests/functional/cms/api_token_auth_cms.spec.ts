import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/auth/user'
import { createVerifiedUser } from '#tests/helpers/create_verified_user'
import { createAdminUser } from '#tests/helpers/create_admin_user'
import { resetSharedState } from '#tests/helpers/shared_state'

/**
 * API token authentication — guard-separation coverage that depends on the
 * admin REST surface that used to live in the CMS API. Split out of
 * `tests/functional/auth/api_token_auth.spec.ts` so the `inertia` flavor
 * (which prunes the CMS routes) can drop it alongside them.
 */
test.group('API token authentication (admin REST CMS routes)', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(resetSharedState)
  group.each.setup(() => limiter.clear())
  group.each.teardown(() => limiter.clear())

  test('admin CMS routes require a valid token', async ({ client }) => {
    const admin = await createAdminUser({
      email: 'api-cms-admin@example.com',
      permissionSlugs: ['templates.view'],
    })
    const token = await User.accessTokens.create(admin)

    // Unauthenticated requests are rejected regardless of guard context.
    const anon = await client.get('/api/v1/admin/templates').accept('json')
    anon.assertStatus(401)

    // A valid bearer token authenticates the migrated surface.
    const authed = await client
      .get('/api/v1/admin/templates')
      .accept('json')
      .bearerToken(token.value!.release())
    authed.assertStatus(200)
  })

  test('admin CMS routes reject tokens without the permission', async ({ client }) => {
    const user = await createVerifiedUser({ email: 'api-cms-noperm@example.com' })
    const token = await User.accessTokens.create(user)

    const res = await client
      .get('/api/v1/admin/templates')
      .accept('json')
      .bearerToken(token.value!.release())

    res.assertStatus(403)
  })
})
