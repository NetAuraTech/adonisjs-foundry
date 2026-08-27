import { nestTranslation, type TranslationNodes } from '#app/core/helpers/i18n_payloads/nest';
import { permissionCategoryKey } from '#app/identity/helpers/i18n_payloads/permission_category';
import { createI18nEntry } from '#core/contracts/i18n_translator';
import type { BuildPayloadResult, I18nTranslator } from '#core/contracts/i18n_translator';
import type Permission from '#identity/models/permission';

/**
 * The flat i18n key mapping for the role create/edit form. The dynamic part of
 * the `permissions` node (per-permission entries and per-category labels) is
 * appended at build time, one entry per data-driven slug.
 */
export const ROLES_FORM_MAPPING = {
	title: {
		create: 'admin.roles.create.title',
		edit: createI18nEntry('admin.roles.edit.title', { name: '{name}' }),
	},
	name: {
		value: 'admin.roles.form.name.value',
		placeholder: 'admin.roles.form.name.placeholder',
	},
	slug: {
		value: 'admin.roles.form.slug.value',
		placeholder: 'admin.roles.form.slug.placeholder',
	},
	description: {
		value: 'admin.roles.form.description.value',
		placeholder: 'admin.roles.form.description.placeholder',
	},
	submit: 'admin.roles.form.submit',
	actions: {
		list: 'admin.roles.list.title',
	},
	permissions: {
		value: 'admin.roles.form.permissions.value',
		system_hint: 'admin.roles.form.permissions.system_hint',
	},
};

/**
 * Shape of the resolved translation payload for the role create/edit form:
 * the static keys plus the data-driven `permissions` node. Leaves of that node
 * are the raw stored values: system permissions store i18n keys
 * (`permissions.users.create.value`) resolved by the `permissions` lang
 * namespace, while custom permissions store plain strings which `i18n.t()`
 * returns unchanged.
 */
export type AdminRolesFormTranslations = BuildPayloadResult<typeof ROLES_FORM_MAPPING> & {
	permissions: TranslationNodes;
};

/**
 * Builds the translation payload for the role create/edit form.
 *
 * Includes per-permission entries nested by slug (`permissions.items.{...}`)
 * and per-category labels (`permissions.categories.{...}`) so the frontend can
 * group the checkboxes.
 *
 * @param i18n - The request-scoped {@link I18nTranslator}.
 * @param permissions - The permissions to build data-driven entries for.
 * @returns The role form `t` object with every UI string resolved.
 */
export function buildRolesFormPayload(i18n: I18nTranslator, permissions: Permission[]): AdminRolesFormTranslations {
	const categories: TranslationNodes = {};
	const items: TranslationNodes = {};

	for (const permission of permissions) {
		nestTranslation(categories, permissionCategoryKey(permission.category), permission.category);
		nestTranslation(items, permission.slug, {
			value: permission.name,
			description: permission.description ?? '',
		});
	}

	return i18n.buildPayload({
		...ROLES_FORM_MAPPING,
		permissions: {
			...ROLES_FORM_MAPPING.permissions,
			categories,
			items,
		},
	});
}
