import type { BuildPayloadResult, I18nService } from '#services/i18n_service';

/**
 * The flat i18n key mapping for the preferences settings section.
 */
export const PREFERENCES_MAPPING = {
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
	appearance: {
		title: 'settings.preferences.appearance.title',
		sub_title: 'settings.preferences.appearance.sub_title',
		value: 'settings.preferences.appearance.value',
	},
	interface: {
		title: 'settings.preferences.interface.title',
		sub_title: 'settings.preferences.interface.sub_title',
		submit: 'settings.preferences.interface.submit',
		locale: {
			english: 'settings.preferences.interface.locale.english',
			french: 'settings.preferences.interface.locale.french',
			value: 'settings.preferences.interface.locale.value',
		},
	},
};

/**
 * Shape of the resolved translation payload for the preferences settings section.
 */
export type SettingsPreferencesTranslations = BuildPayloadResult<typeof PREFERENCES_MAPPING>;

/**
 * Builds the resolved translation payload for the preferences settings section.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The preferences `t` object with every UI string resolved.
 */
export function buildPreferencesPayload(i18n: I18nService): SettingsPreferencesTranslations {
	return i18n.buildPayload(PREFERENCES_MAPPING);
}
