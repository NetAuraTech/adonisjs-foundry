import { createI18nEntry } from '#core/contracts/i18n_translator';
import { nestTranslation, type TranslationNodes } from '#transport/core/helpers/translation_tree';
import type { BuildPayloadResult, I18nTranslator } from '#core/contracts/i18n_translator';

/**
 * The flat i18n key mapping for the user detail page. The `roles` and
 * `permissions` nodes are built dynamically at build time, keyed by data-driven
 * slugs and sections.
 */
export const USERS_SHOW_MAPPING = {
	title: 'admin.users.list.title',
	info: {
		email: 'admin.users.show.info.email',
		username: 'admin.users.show.info.username',
		value: 'admin.users.show.info.value',
	},
	history: {
		created_at: 'admin.users.show.history.created_at',
		updated_at: 'admin.users.show.history.updated_at',
		verified_at: 'admin.users.show.history.verified_at',
		value: 'admin.users.show.history.value',
	},
	providers: {
		connected: 'admin.users.show.providers.connected',
		not_connected: 'admin.users.show.providers.not_connected',
		value: 'admin.users.show.providers.value',
	},
	status: {
		verified: 'admin.users.status.verified',
		unverified: 'admin.users.status.unverified',
		pending_invite: 'admin.users.status.pending_invite',
	},
	actions: {
		edit: createI18nEntry('admin.users.edit.title', { username: '{username}' }),
		delete: createI18nEntry('admin.users.delete.title', { username: '{username}' }),
	},
	roles: {
		value: 'admin.users.show.role.value',
		current: 'admin.users.show.role.current',
	},
	permissions: {
		value: createI18nEntry('admin.users.show.permission.value', { amount: '{amount}' }),
	},
};

/**
 * Shape of the resolved translation payload for the user detail page: the
 * static keys plus the data-driven `roles` and `permissions` nodes.
 */
export type AdminUsersShowTranslations = BuildPayloadResult<typeof USERS_SHOW_MAPPING> & {
	roles: TranslationNodes;
	permissions: TranslationNodes;
};

type PermissionPayload = { category: Record<string, string> } & TranslationNodes;

/**
 * Builds the translation payload for the user detail page.
 *
 * Includes a dynamic per-role entry and a dynamic `permissions` node where each
 * permission is nested under its section (`{section}.{action}`) with a matching
 * category label, so the frontend can group the permissions without extra
 * fetches.
 *
 * @param i18n - The request-scoped {@link I18nTranslator}.
 * @param role - The role assigned to the user, or `null` when the user has none.
 * @param permissions - The permissions to build data-driven entries for.
 * @returns The user detail `t` object with every UI string resolved.
 */
export function buildUsersShowPayload(
	i18n: I18nTranslator,
	role: { slug: string; name: string; description: string | null } | null,
	permissions: ReadonlyArray<{ slug: string; name: string; description: string | null; category: string }>,
): AdminUsersShowTranslations {
	const rolesEntries: TranslationNodes = {};
	if (role) {
		nestTranslation(rolesEntries, role.slug, {
			value: `roles.${role.slug}.value`,
			description: `roles.${role.slug}.description`,
		});
	}

	const permissionsPayload: PermissionPayload = { category: {} };

	for (const permission of permissions) {
		const [section, action] = permission.slug.split('.');

		if (section && action) {
			if (!permissionsPayload.category[section]) {
				permissionsPayload.category[section] = `admin.users.permissions.category.${section}`;
			}

			if (!permissionsPayload[section]) permissionsPayload[section] = {};
			nestTranslation(permissionsPayload, `${section}.${action}`, {
				value: `admin.users.permissions.${section}.${action}.value`,
			});
		}
	}

	return i18n.buildPayload({
		...USERS_SHOW_MAPPING,
		roles: { ...USERS_SHOW_MAPPING.roles, ...rolesEntries },
		permissions: { ...USERS_SHOW_MAPPING.permissions, ...permissionsPayload },
	});
}
