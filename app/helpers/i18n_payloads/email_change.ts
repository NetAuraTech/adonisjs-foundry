import type { BuildPayloadResult, I18nService } from '#services/i18n_service'

/**
 * The flat i18n key mapping for the email change confirmation page.
 */
export const EMAIL_CHANGE_MAPPING = {
  title: 'settings.email.change.title',
  sub_title: 'settings.email.change.sub_title',
  submit: 'settings.email.change.submit',
  cancel: 'settings.email.change.cancel',
  token: 'settings.email.change.token',
  info: {
    title: 'settings.email.change.info.title',
    message: 'settings.email.change.info.message',
  },
}

/**
 * Shape of the resolved translation payload for the email change confirmation page.
 */
export type EmailChangeTranslations = BuildPayloadResult<typeof EMAIL_CHANGE_MAPPING>

/**
 * Builds the resolved translation payload for the email change confirmation page.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The email change `t` object with every UI string resolved.
 */
export function buildEmailChangePayload(i18n: I18nService): EmailChangeTranslations {
  return i18n.buildPayload(EMAIL_CHANGE_MAPPING)
}
