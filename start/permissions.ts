/*
|--------------------------------------------------------------------------
| System Permission Catalog
|--------------------------------------------------------------------------
|
| The composed list of system permission slugs for this flavor. Every
| domain owns its own catalog const in `{domain}_permissions.ts` (see
| `app/domain/services/*` and `app/cms/domain/services/*`); this file
| composes those per-domain catalogs into the single matrix the permission
| seeder persists. Adding or renaming a permission only touches that
| domain's catalog file.
|
| The `permissionCatalog` object also drives the `PermissionSlug` union of
| this flavor: the catalog is the single source of both the persisted slug
| values and the slug type.
|
| The composed catalog finally yields the `permissions` identity map — one
| camelCase key per slug, mapped to the raw slug string — which route
| guards, nav entries and ability checks reference instead of raw literals.
|
*/

import { corePermissionCatalog, coreRoleSlugs } from '#services/core/core_permissions'
import { authPermissionCatalog } from '#services/auth/auth_permissions'
import { pagePermissionCatalog } from '#cms/domain/services/page/page_permissions'
import { templatePermissionCatalog } from '#cms/domain/services/template/template_permissions'
import { filePermissionCatalog } from '#services/file/file_permissions'
import { maintenancePermissionCatalog } from '#services/maintenance/maintenance_permissions'
import { loggingPermissionCatalog } from '#services/logging/logging_permissions'
import type { PermissionSlugs, SlugKeys } from '#types/permissions'

/**
 * The composed system permission catalog of this flavor: `category →
 * actions` matrix ordered by domain (core, auth, page, template, file,
 * maintenance, logging). The permission seeder persists exactly this
 * matrix, so it is the single source of the persisted slugs.
 */
export const permissionCatalog = {
  ...corePermissionCatalog,
  ...authPermissionCatalog,
  ...pagePermissionCatalog,
  ...templatePermissionCatalog,
  ...filePermissionCatalog,
  ...maintenancePermissionCatalog,
  ...loggingPermissionCatalog,
}

/** Union of every system permission slug in this flavor. */
export type PermissionSlug = PermissionSlugs<typeof permissionCatalog>

/**
 * The Pascal-Case form of a snake_case permission action (`manage_roles` →
 * `ManageRoles`); the runtime counterpart of the `SlugKey` type.
 */
const slugPart = (part: string): string =>
  part
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

/**
 * The identity map of this flavor's permission slugs: one camelCase key per
 * slug (`usersView`, `usersManageRoles`, ...) whose value is the raw slug
 * string. Derived at runtime from the {@link permissionCatalog}, so renaming
 * a slug in a domain catalog file renames its key here, and every former
 * `permissions.*` use site fails to compile until it is updated.
 */
export const permissions = Object.fromEntries(
  (Object.keys(permissionCatalog) as Array<keyof typeof permissionCatalog>).flatMap(
    (category): Array<[string, string]> =>
      (permissionCatalog[category] as readonly string[]).map((action): [string, string] => [
        `${category}${slugPart(action)}`,
        `${category}.${action}`,
      ])
  )
) as Record<SlugKeys<typeof permissionCatalog>, PermissionSlug>

/**
 * The system role slugs of this flavor; the role seeder persists exactly
 * this list, so it is the single source of the persisted role slugs.
 */
export const systemRoleSlugs = coreRoleSlugs

/** Union of every system role slug in this flavor. */
export type SystemRoleSlug = (typeof systemRoleSlugs)[number]
