import type { AuthUser } from '~/types/auth'

/**
 * Checks if the user has a specific role.
 *
 * @param user - The authenticated user object, or undefined if unauthenticated
 * @param roleSlug - The role slug to check (e.g. `'admin'`)
 * @returns `true` if the user's role matches the given slug, `false` otherwise
 *
 * @example
 * hasRole(user, 'admin') // true
 */
export function hasRole(user: AuthUser | undefined, roleSlug: string): boolean {
  return user?.role === roleSlug
}

/**
 * Checks if the user has at least one of the specified roles.
 *
 * @param user - The authenticated user object, or undefined if unauthenticated
 * @param roleSlugs - Array of role slugs to check against (e.g. `['admin', 'moderator']`)
 * @returns `true` if the user's role is included in the given slugs, `false` otherwise
 *
 * @example
 * hasAnyRole(user, ['admin', 'moderator']) // true
 */
export function hasAnyRole(user: AuthUser | undefined, roleSlugs: string[]): boolean {
  return !!user?.role && roleSlugs.includes(user.role)
}

/**
 * Checks if the user has all of the specified roles.
 * Since a user can only have one role, this effectively checks
 * whether that single role is present in every entry of the provided list.
 *
 * @param user - The authenticated user object, or undefined if unauthenticated
 * @param roleSlugs - Array of role slugs that must all match the user's role
 * @returns `true` if every slug in the array matches the user's role, `false` otherwise
 *
 * @example
 * hasAllRoles(user, ['admin', 'admin']) // true (same slug repeated)
 * hasAllRoles(user, ['admin', 'moderator']) // false (user can only have one role)
 */
export function hasAllRoles(user: AuthUser | undefined, roleSlugs: string[]): boolean {
  return !!user?.role && roleSlugs.every((slug) => slug === user.role)
}

/**
 * Checks if the user has a specific permission.
 *
 * @param user - The authenticated user object, or undefined if unauthenticated
 * @param permissionSlug - The permission slug to check (e.g. `'users.create'`)
 * @returns `true` if the user holds the given permission, `false` otherwise
 *
 * @example
 * can(user, 'users.create') // true
 */
export function can(user: AuthUser | undefined, permissionSlug: string): boolean {
  return user?.permissions.includes(permissionSlug) ?? false
}

/**
 * Checks if the user has at least one of the specified permissions.
 *
 * @param user - The authenticated user object, or undefined if unauthenticated
 * @param permissionSlugs - Array of permission slugs to check against (e.g. `['users.create', 'users.update']`)
 * @returns `true` if the user holds at least one of the given permissions, `false` otherwise
 *
 * @example
 * canAny(user, ['users.create', 'users.delete']) // true
 */
export function canAny(user: AuthUser | undefined, permissionSlugs: string[]): boolean {
  return user?.permissions.some((p) => permissionSlugs.includes(p)) ?? false
}

/**
 * Checks if the user has all of the specified permissions.
 *
 * @param user - The authenticated user object, or undefined if unauthenticated
 * @param permissionSlugs - Array of permission slugs that the user must all hold
 * @returns `true` if the user holds every given permission, `false` otherwise
 *
 * @example
 * canAll(user, ['users.view', 'users.create']) // true
 */
export function canAll(user: AuthUser | undefined, permissionSlugs: string[]): boolean {
  return permissionSlugs.every((slug) => user?.permissions.includes(slug) ?? false)
}

/**
 * Returns all permission slugs held by the user.
 *
 * @param user - The authenticated user object, or undefined if unauthenticated
 * @returns Array of permission slugs, or an empty array if the user is undefined or has no permissions
 *
 * @example
 * getPermissions(user) // ['users.view', 'users.create', 'roles.view']
 */
export function getPermissions(user: AuthUser | undefined): string[] {
  return user?.permissions ?? []
}

/**
 * Returns the role slug of the user.
 *
 * @param user - The authenticated user object, or undefined if unauthenticated
 * @returns The user's role slug, or `undefined` if the user is undefined or has no role
 *
 * @example
 * getRole(user) // 'admin'
 */
export function getRole(user: AuthUser | undefined): string | undefined {
  return user?.role ?? undefined
}
