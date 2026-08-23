import { nestTranslation, type TranslationNodes } from '#helpers/i18n_payloads/nest';
import { createI18nEntry } from '#services/i18n_service';
import type Role from '#models/auth/role';
import type { BuildPayloadResult, I18nService } from '#services/i18n_service';

/**
 * The flat i18n key mapping for the user create/edit form. The `roles` node
 * is built dynamically at build time, one entry per data-driven slug.
 */
export const USERS_FORM_MAPPING = {
	title: {
		create: 'admin.users.create.title',
		edit: createI18nEntry('admin.users.edit.title', { username: '{username}' }),
	},
	email: {
		value: 'admin.users.form.email.value',
		placeholder: 'admin.users.form.email.placeholder',
	},
	username: {
		value: 'admin.users.form.username.value',
		placeholder: 'admin.users.form.username.placeholder',
	},
	roles: {
		value: 'admin.users.form.role.value',
		placeholder: 'admin.users.form.role.placeholder',
	},
	submit: 'admin.users.form.submit',
	actions: {
		list: 'admin.users.list.title',
	},
};

/**
 * Shape of the resolved translation payload for the user create/edit form:
 * the static keys plus the data-driven `roles` node.
 */
export type AdminUsersFormTranslations = BuildPayloadResult<typeof USERS_FORM_MAPPING> & {
	roles: TranslationNodes;
};

/**
 * Builds the translation payload for the user create/edit form.
 *
 * Includes dynamic per-role entries (name resolved through the shared `roles`
 * lang namespace, description stored raw) keyed by slug so the role selector
 * can render without extra fetches.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @param roles - The roles to build per-role entries for.
 * @returns The user form `t` object with every UI string resolved.
 */
export function buildUsersFormPayload(i18n: I18nService, roles: Role[]): AdminUsersFormTranslations {
	const rolesEntries: TranslationNodes = {};

	for (const role of roles) {
		nestTranslation(rolesEntries, role.slug, {
			value: `roles.${role.slug}.value`,
			description: `roles.${role.slug}.description`,
		});
	}

	return i18n.buildPayload({
		...USERS_FORM_MAPPING,
		roles: { ...USERS_FORM_MAPPING.roles, ...rolesEntries },
	});
}
