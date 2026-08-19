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
