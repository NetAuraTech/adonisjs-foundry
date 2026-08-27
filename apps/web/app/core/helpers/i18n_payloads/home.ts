import type { BuildPayloadResult, I18nService } from '#services/i18n_service';

/**
 * The flat i18n key mapping for the hand-written front home page.
 */
export const HOME_MAPPING = {
	welcome: 'home.welcome',
	tagline: 'home.tagline',
};

/**
 * Shape of the resolved translation payload for the front home page.
 */
export type HomeTranslations = BuildPayloadResult<typeof HOME_MAPPING>;

/**
 * Builds the resolved translation payload for the hand-written front home page.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The home page `t` object with every UI string resolved.
 */
export function buildHomePayload(i18n: I18nService): HomeTranslations {
	return i18n.buildPayload(HOME_MAPPING);
}
