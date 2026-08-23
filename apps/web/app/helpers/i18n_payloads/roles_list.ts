import { nestTranslation, type TranslationNodes } from '#helpers/i18n_payloads/nest';
import { createI18nEntry } from '#services/i18n_service';
import type Role from '#models/auth/role';
import type { BuildPayloadResult, I18nService } from '#services/i18n_service';

/**
 * The flat i18n key mapping for the roles listing page. The `roles` node is
 * built dynamically at build time, one entry per data-driven slug.
 */
export const ROLES_LIST_MAPPING = {
	title: 'admin.roles.list.title',
	search: {
		value: 'admin.roles.search.value',
		placeholder: 'admin.roles.search.placeholder',
		filter: 'admin.roles.search.filter',
	},
	create: { title: 'admin.roles.create.title' },
	table: {
		name: 'admin.roles.table.name',
		slug: 'admin.roles.table.slug',
		permissions: 'admin.roles.table.permissions',
		users: 'admin.roles.table.users',
	},
	actions: {
		value: 'admin.roles.actions',
		show: createI18nEntry('admin.roles.show.title', { name: '{name}' }),
		edit: createI18nEntry('admin.roles.edit.title', { name: '{name}' }),
		delete: createI18nEntry('admin.roles.delete.title', { name: '{name}' }),
	},
	delete: {
		confirm: createI18nEntry('admin.roles.delete.confirm', { name: '{name}' }),
	},
	system: {
		value: 'admin.roles.system.value',
		hint: 'admin.roles.system.hint',
	},
	empty: 'admin.roles.empty',
};

/**
 * Shape of the resolved translation payload for the roles listing: the static
 * keys plus the data-driven `roles` node. Leaves are the raw stored values:
 * system roles store i18n keys (`roles.admin.value`) resolved by the `roles`
 * lang namespace, while custom roles store plain strings which `i18n.t()`
 * returns unchanged.
 */
export type AdminRolesIndexTranslations = BuildPayloadResult<typeof ROLES_LIST_MAPPING> & {
	roles: TranslationNodes;
};

/**
 * Builds the translation payload for the roles listing page.
 *
 * Includes one `roles.{slug...}` entry per role (system or custom).
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @param roles - The roles to build per-role entries for.
 * @returns The roles listing `t` object with every UI string resolved.
 */
export function buildRolesListPayload(i18n: I18nService, roles: Role[]): AdminRolesIndexTranslations {
	const roleEntries: TranslationNodes = {};

	for (const role of roles) {
		nestTranslation(roleEntries, role.slug, {
			value: role.name,
			description: role.description ?? '',
		});
	}

	return i18n.buildPayload({ ...ROLES_LIST_MAPPING, roles: roleEntries });
}
