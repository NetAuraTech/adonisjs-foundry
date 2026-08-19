/**
 * Shared typing helpers for the system permission catalog.
 *
 * Each domain owns a permission catalog const — a `category → actions`
 * matrix (`as const`) living in `{domain}_permissions.ts` next to its nav
 * module. The {@link PermissionSlugs} helper derives the `category.action`
 * slug union from such a const, so the slug values and the slug union always
 * come from the same declaration. The composed catalog of a flavor lives in
 * `start/permissions.ts` (a flavor-rewritable composition file).
 */

/**
 * The `category.action` slug union of a permission catalog const.
 *
 * @example
 * type UsersView = PermissionSlugs<{ readonly users: readonly ['view'] }>
 * // => 'users.view'
 */
export type PermissionSlugs<T> = {
  [Category in keyof T & string]: `${Category}.${T[Category] extends readonly string[]
    ? T[Category][number]
    : never}`
}[keyof T & string]

/** The Pascal-Case form of a snake_case slug part (`manage_roles` → `ManageRoles`). */
type SlugPart<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Capitalize<Head>}${SlugPart<Tail>}`
  : Capitalize<S>

/**
 * The camelCase key of a single `category.action` slug: the category verbatim
 * followed by the Pascal-Case action.
 *
 * @example
 * type K1 = SlugKey<'users.view'> // => 'usersView'
 * type K2 = SlugKey<'users.manage_roles'> // => 'usersManageRoles'
 */
export type SlugKey<S extends string> = S extends `${infer Category}.${infer Action}`
  ? `${Category & string}${SlugPart<Action & string>}`
  : never

/**
 * The camelCase key union of every slug of a permission catalog const —
 * the key set of the composed `permissions` identity map.
 *
 * @example
 * type Keys = SlugKeys<{ readonly users: readonly ['view', 'manage_roles'] }>
 * // => 'usersView' | 'usersManageRoles'
 */
export type SlugKeys<T> = SlugKey<PermissionSlugs<T>>
