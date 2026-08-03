import User from '#models/auth/user'
import Role from '#models/auth/role'
import Permission from '#models/auth/permission'
import { DateTime } from 'luxon'
import { extractNameFromEmail } from '#helpers/auth/username'

/**
 * Creates an administrator user with a role granted `admin.access` and
 * `settings.maintenance`, and a verified email address.
 *
 * Used by browser tests that need to reach the admin maintenance settings
 * page (`/admin/settings/maintenance`).
 *
 * @param overrides - User attributes. `email` is required; `password` is
 *   optional and defaults to a strong test password.
 * @returns The newly created admin user instance.
 */
export async function createAdminUser(overrides: { email: string; password?: string }) {
  const password = overrides.password ?? 'TestPassword123!'

  // Idempotent create: test DBs are truncated after each test, so a previous
  // test may have already inserted the fixed-name role and permissions.
  const role = await Role.updateOrCreate(
    { slug: 'admin' },
    {
      name: 'roles:admin.value',
      slug: 'admin',
      description: 'roles:admin.description',
      isSystem: true,
    }
  )

  const permissionSlugs = ['admin.access', 'settings.maintenance']
  const permissions = await Promise.all(
    permissionSlugs.map((slug) => {
      const category = slug.split('.')[0]
      return Permission.updateOrCreate(
        { slug },
        {
          name: `permissions:${slug}.value`,
          slug,
          category: `permissions:category.${category}`,
          description: `permissions:${slug}.description`,
          isSystem: true,
        }
      )
    })
  )

  await role.syncPermissions(permissions.map((permission) => permission.id))

  return User.create({
    username: extractNameFromEmail(overrides.email),
    email: overrides.email,
    password,
    roleId: role.id,
    emailVerifiedAt: DateTime.now(),
  })
}
