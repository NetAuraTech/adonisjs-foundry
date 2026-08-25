import type { BuildPayloadResult, I18nService } from '#services/i18n_service';

/**
 * The flat i18n key mapping for the forgot password page.
 */
export const FORGOT_PASSWORD_MAPPING = {
	title: 'auth.password.forgot.title',
	sub_title: 'auth.password.forgot.sub_title',
	email: {
		value: 'auth.password.forgot.email.value',
		placeholder: 'auth.password.forgot.email.placeholder',
	},
	submit: 'auth.password.forgot.submit',
	back_to_login: 'auth.password.forgot.back_to_login',
};

/**
 * Shape of the resolved translation payload for the forgot password page.
 */
export type ForgotPasswordTranslations = BuildPayloadResult<typeof FORGOT_PASSWORD_MAPPING>;

/**
 * Builds the resolved translation payload for the forgot password page.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The forgot password `t` object with every UI string resolved.
 */
export function buildForgotPasswordPayload(i18n: I18nService): ForgotPasswordTranslations {
	return i18n.buildPayload(FORGOT_PASSWORD_MAPPING);
}
