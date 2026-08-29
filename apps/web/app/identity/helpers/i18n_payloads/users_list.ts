import { nestTranslation, type TranslationNodes } from '#app/core/helpers/translation_tree';
import { createI18nEntry } from '#core/contracts/i18n_translator';
import type { BuildPayloadResult, I18nTranslator } from '#core/contracts/i18n_translator';
import type Role from '#identity/models/role';

/**
 * The flat i18n key mapping for the users listing page. The `roles` node is
 * built dynamically at build time, one entry per data-driven slug.
 */
export const USERS_LIST_MAPPING = {
	title: 'admin.users.list.title',
	action: 'admin.users.list.action',
	search: {
		value: 'admin.users.search.value',
		placeholder: 'admin.users.search.placeholder',
		filter: 'admin.users.search.filter',
	},
	roles: {
		value: 'admin.users.roles.value',
		placeholder: 'admin.users.roles.placeholder',
	},
	status: {
		verified: 'admin.users.status.verified',
		unverified: 'admin.users.status.unverified',
		pending_invite: 'admin.users.status.pending_invite',
		value: 'admin.users.status.value',
	},
	empty: 'admin.users.list.empty',
	register_on: 'admin.users.list.register_on',
	value: 'admin.users.value',
	value_one: 'admin.users.value_one',
	actions: {
		value: 'admin.users.actions',
		show: createI18nEntry('admin.users.show.title', { username: '{username}' }),
		edit: createI18nEntry('admin.users.edit.title', { username: '{username}' }),
		delete: createI18nEntry('admin.users.delete.title', { username: '{username}' }),
	},
};

/**
 * Shape of the resolved translation payload for the users listing: the static
 * keys plus the data-driven `roles` node.
 */
export type AdminUsersIndexTranslations = BuildPayloadResult<typeof USERS_LIST_MAPPING> & {
	roles: TranslationNodes;
};

/**
 * Builds the translation payload for the users listing.
 *
 * Includes dynamic per-role entries (name resolved through the shared `roles`
 * lang namespace, description stored raw) keyed by slug.
 *
 * @param i18n - The request-scoped {@link I18nTranslator}.
 * @param roles - The roles to build per-role entries for.
 * @returns The users listing `t` object with every UI string resolved.
 */
export function buildUsersListPayload(i18n: I18nTranslator, roles: Role[]): AdminUsersIndexTranslations {
	const rolesEntries: TranslationNodes = {};

	for (const role of roles) {
		nestTranslation(rolesEntries, role.slug, {
			value: `roles.${role.slug}.value`,
			description: `roles.${role.slug}.description`,
		});
	}

	return i18n.buildPayload({
		...USERS_LIST_MAPPING,
		roles: { ...USERS_LIST_MAPPING.roles, ...rolesEntries },
	});
}
