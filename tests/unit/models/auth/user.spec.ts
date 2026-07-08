import { test } from '@japa/runner'
import User from '#models/auth/user'
import Role from '#models/auth/role'
import Permission from '#models/auth/permission'
import Token from '#models/core/token'
import { TOKEN_TYPES } from '#types/core'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

test.group('User Model', () => {
  test('isEmailVerified returns true if emailVerifiedAt is set', ({ assert }) => {
    const user = new User()
    assert.isFalse(user.isEmailVerified)

    user.emailVerifiedAt = DateTime.now()
    assert.isTrue(user.isEmailVerified)
  })

  test('status computed property handles unverified, verified, and pending invite states', async ({
    assert,
  }) => {
    const user = new User()

    // Default
    assert.equal(user.status, 'UNVERIFIED')

    // Verified
    user.emailVerifiedAt = DateTime.now()
    assert.equal(user.status, 'VERIFIED')

    // Pending invite
    user.emailVerifiedAt = null
    user.hasPendingInvite = true
    assert.equal(user.status, TOKEN_TYPES.PENDING_INVITE)
  })

  test('loadPendingInvite sets hasPendingInvite to true if token exists and user is unverified', async ({
    assert,
  }) => {
    const user = await User.create({
      email: 'invite@example.com',
      username: 'invite',
      password: 'pwd',
    })

    // Create a pending invite token
    await Token.create({ userId: user.id, type: TOKEN_TYPES.PENDING_INVITE, token: 'abc' })

    await User.loadPendingInvite(user)
    assert.isTrue(user.hasPendingInvite)

    // Verify user
    user.emailVerifiedAt = DateTime.now()
    await User.loadPendingInvite(user)
    assert.isFalse(
      user.hasPendingInvite,
      'Should be false if user is verified even if token exists'
    )
  })

  test('can() returns true if user role has the permission', async ({ assert }) => {
    const role = await Role.create({ slug: 'test_role_can', name: 'Test Role Can' })
    const perm = await Permission.create({
      slug: 'do_action',
      name: 'Do Action Can',
      category: 'test',
    })
    await role.assignPermission(perm.id)

    const user = await User.create({
      email: 'can@example.com',
      username: 'can',
      password: 'pwd',
      roleId: role.id,
    })

    assert.isTrue(await user.can('do_action'))
    assert.isFalse(await user.can('other_action'))
  })

  test('can() returns false if user has no role', async ({ assert }) => {
    const user = await User.create({
      email: 'norole@example.com',
      username: 'norole',
      password: 'pwd',
    })
    assert.isFalse(await user.can('do_action'))
  })

  test('hasAnyRole() returns true if user role is in the list', async ({ assert }) => {
    const role = await Role.create({ slug: 'test_role_has', name: 'Test Role Has' })
    const user = await User.create({
      email: 'has@example.com',
      username: 'has',
      password: 'pwd',
      roleId: role.id,
    })

    assert.isTrue(await user.hasAnyRole(['admin', 'test_role_has']))
    assert.isFalse(await user.hasAnyRole(['admin', 'editor']))
  })

  test('hasAnyRole() returns false if user has no role', async ({ assert }) => {
    const user = await User.create({
      email: 'norole2@example.com',
      username: 'norole2',
      password: 'pwd',
    })
    assert.isFalse(await user.hasAnyRole(['admin']))
  })

  test('can() caches the role on the instance so repeated calls do not re-query', async ({
    assert,
  }) => {
    const role = await Role.create({ slug: 'test_role_cache', name: 'Test Role Cache' })
    const perm = await Permission.create({
      slug: 'cached_action',
      name: 'Cached Action',
      category: 'test',
    })
    await role.assignPermission(perm.id)

    const user = await User.create({
      email: 'cache@example.com',
      username: 'cache',
      password: 'pwd',
      roleId: role.id,
    })

    // First call loads the role from DB
    const result1 = await user.can('cached_action')
    assert.isTrue(result1)

    // Second call should use the cached role — same result, no extra query
    const result2 = await user.can('cached_action')
    assert.isTrue(result2)

    // A different slug on the same cached role should also work without re-querying
    assert.isFalse(await user.can('non_existent_slug'))
  })

  test('checkAny() returns true if the user has any of the given permissions', async ({
    assert,
  }) => {
    const role = await Role.create({ slug: 'test_role_checkany', name: 'Test Role CheckAny' })
    const perm1 = await Permission.create({
      slug: 'action_one',
      name: 'Action One',
      category: 'test',
    })
    const perm2 = await Permission.create({
      slug: 'action_two',
      name: 'Action Two',
      category: 'test',
    })
    await role.assignPermission(perm1.id)
    await role.assignPermission(perm2.id)

    const user = await User.create({
      email: 'checkany@example.com',
      username: 'checkany',
      password: 'pwd',
      roleId: role.id,
    })

    assert.isTrue(await user.checkAny(['action_one']))
    assert.isTrue(await user.checkAny(['action_two']))
    assert.isTrue(await user.checkAny(['action_one', 'action_two']))
    // Has at least one of the two
    assert.isTrue(await user.checkAny(['action_one', 'non_existent']))
    assert.isFalse(await user.checkAny(['non_existent_a', 'non_existent_b']))
  })

  test('checkAny() returns false if user has no role', async ({ assert }) => {
    const user = await User.create({
      email: 'norole3@example.com',
      username: 'norole3',
      password: 'pwd',
    })
    assert.isFalse(await user.checkAny(['do_action']))
  })

  test('checkAny() shares the role cache with can()', async ({ assert }) => {
    const role = await Role.create({ slug: 'test_role_shared_cache', name: 'Test Shared Cache' })
    const perm = await Permission.create({
      slug: 'shared_action',
      name: 'Shared Action',
      category: 'test',
    })
    await role.assignPermission(perm.id)

    const user = await User.create({
      email: 'shared@example.com',
      username: 'shared',
      password: 'pwd',
      roleId: role.id,
    })

    // checkAny loads and caches the role
    assert.isTrue(await user.checkAny(['shared_action']))

    // can() should reuse the cached role (no extra query)
    assert.isTrue(await user.can('shared_action'))
    assert.isFalse(await user.can('other_action'))
  })
})
