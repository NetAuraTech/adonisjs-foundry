import type { BuildPayloadResult, I18nTranslator } from '#core/contracts/i18n_translator';

/**
 * The flat i18n key mapping for the profile settings section.
 */
export const PROFILE_MAPPING = {
	header: {
		title: 'settings.title',
		sub_title: 'settings.sub_title',
		tabs: {
			profile: 'settings.profile.value',
			account: 'settings.account.value',
			preferences: 'settings.preferences.value',
			admin: 'admin.value',
			logout: 'auth.session.logout.value',
		},
	},
	avatar: {
		change: 'settings.profile.avatar.change',
		value: 'settings.profile.avatar.value',
	},
	username: {
		placeholder: 'settings.profile.username.placeholder',
		value: 'settings.profile.username.value',
	},
	title: 'settings.profile.title',
	sub_title: 'settings.profile.sub_title',
	submit: 'settings.profile.submit',
};

/**
 * Shape of the resolved translation payload for the profile settings section.
 */
export type SettingsProfileTranslations = BuildPayloadResult<typeof PROFILE_MAPPING>;

/**
 * Builds the resolved translation payload for the profile settings section.
 *
 * @param i18n - The request-scoped {@link I18nTranslator}.
 * @returns The profile `t` object with every UI string resolved.
 */
export function buildProfilePayload(i18n: I18nTranslator): SettingsProfileTranslations {
	return i18n.buildPayload(PROFILE_MAPPING);
}
