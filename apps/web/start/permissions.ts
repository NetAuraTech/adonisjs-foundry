/*
|--------------------------------------------------------------------------
| System Permission Catalog
|--------------------------------------------------------------------------
|
| The composed list of system permission slugs for this flavor. Every
| domain owns its own catalog const in its business layer (e.g.
| `src/identity/permissions.ts`, `app/domain/services/{domain}/{domain}_permissions.ts`
| until the domain migrates); this file composes those per-domain catalogs
| into the single matrix the permission seeder persists. Adding or renaming
| a permission only touches that domain's catalog file.
|
| The `permissionCatalog` object also drives the `PermissionSlug` union of
| this flavor: the catalog is the single source of both the persisted slug
| values and the slug type.
|
| The composed catalog finally yields the `permissions` identity map — one
| group per category, one camelCase key per action, mapped to the raw slug
| string — which route guards, nav entries and ability checks reference
| instead of raw literals.
|
*/

import { pagePermissionCatalog } from '#cms/domain/services/page/page_permissions';
import { templatePermissionCatalog } from '#cms/domain/services/template/template_permissions';
import { identityPermissionCatalog } from '#identity/permissions';
import { corePermissionCatalog, coreRoleSlugs } from '#services/core/core_permissions';
import { filePermissionCatalog } from '#services/file/file_permissions';
import { loggingPermissionCatalog } from '#services/logging/logging_permissions';
import { maintenancePermissionCatalog } from '#services/maintenance/maintenance_permissions';
import type { PermissionSlugs, PermissionMap } from '#types/permissions';

/**
 * The composed system permission catalog of this flavor: `category →
 * actions` matrix ordered by domain (core, auth, page, template, file,
 * maintenance, logging). The permission seeder persists exactly this
 * matrix, so it is the single source of the persisted slugs.
 */
export const permissionCatalog = {
	...corePermissionCatalog,
	...identityPermissionCatalog,
	...pagePermissionCatalog,
	...templatePermissionCatalog,
	...filePermissionCatalog,
	...maintenancePermissionCatalog,
	...loggingPermissionCatalog,
};

/** Union of every system permission slug in this flavor. */
export type PermissionSlug = PermissionSlugs<typeof permissionCatalog>;

/**
 * The camelCase form of a snake_case permission action (`manage_roles` →
 * `manageRoles`); the runtime counterpart of the nested `permissions` keys.
 */
const actionKey = (action: string): string =>
	action.replace(/_([a-z])/g, (_separator, letter: string) => letter.toUpperCase());

/**
 * The nested identity map of this flavor's permission slugs: one group per
 * catalog category (`permissions.users`, `permissions.pages`, ...) whose
 * keys are the camelCase form of the category's actions
 * (`permissions.users.view`, `permissions.users.manageRoles`, ...) mapped to
 * the raw slug string. Derived at runtime from the {@link permissionCatalog},
 * so renaming a slug in a domain catalog file renames its key here, and
 * every former `permissions.*` use site fails to compile until it is updated.
 */
export const permissions = Object.fromEntries(
	(Object.keys(permissionCatalog) as Array<keyof typeof permissionCatalog>).map(
		(category): [string, Record<string, string>] => [
			String(category),
			Object.fromEntries(
				(permissionCatalog[category] as readonly string[]).map((action): [string, string] => [
					actionKey(action),
					`${String(category)}.${action}`,
				]),
			),
		],
	),
) as unknown as PermissionMap<typeof permissionCatalog>;

/**
 * The system role slugs of this flavor; the role seeder persists exactly
 * this list, so it is the single source of the persisted role slugs.
 */
export const systemRoleSlugs = coreRoleSlugs;

/** Union of every system role slug in this flavor. */
export type SystemRoleSlug = (typeof systemRoleSlugs)[number];
