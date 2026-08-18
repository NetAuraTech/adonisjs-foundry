import { createI18nEntry, type BuildPayloadResult, type I18nService } from '#services/i18n_service'

/**
 * The flat i18n key mapping for the account settings section (credentials,
 * password, account deletion and OAuth connections).
 */
export const ACCOUNT_MAPPING = {
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
  email: {
    title: 'settings.account.email.title',
    sub_title: 'settings.account.email.sub_title',
    submit: 'settings.account.email.submit',
    placeholder: 'settings.account.email.placeholder',
    value: 'settings.account.email.value',
    change: {
      title: 'settings.account.email.change.title',
      sub_title: 'settings.account.email.change.sub_title',
      submit: 'settings.account.email.change.submit',
      cancel: 'settings.account.email.change.cancel',
      info: {
        title: 'settings.account.email.change.info.title',
        message: 'settings.account.email.change.info.message',
      },
    },
  },
  password: {
    title: 'settings.account.password.title',
    sub_title: 'settings.account.password.sub_title',
    submit: 'settings.account.password.submit',
    current: {
      value: 'settings.account.password.current.value',
    },
    confirm: {
      help: 'settings.account.password.confirm.help',
      value: 'settings.account.password.confirm.value',
    },
    new: {
      help: 'settings.account.password.new.help',
      value: 'settings.account.password.new.value',
    },
  },
  delete: {
    title: 'settings.account.delete.title',
    sub_title: 'settings.account.delete.sub_title',
    submit: 'settings.account.delete.submit',
    cancel: 'settings.account.delete.cancel',
    password: 'settings.account.delete.password',
    confirm: {
      title: 'settings.account.delete.confirm.title',
      sub_title: 'settings.account.delete.confirm.sub_title',
    },
  },
  oauth: {
    title: 'settings.account.oauth.title',
    sub_title: 'settings.account.oauth.sub_title',
    connected: 'settings.account.oauth.connected',
    not_connected: 'settings.account.oauth.not_connected',
    link: 'settings.account.oauth.link',
    unlink: {
      value: 'settings.account.oauth.unlink.value',
      confirm: createI18nEntry('settings.account.oauth.unlink.confirm', {
        provider: '{provider}',
      }),
    },
  },
}

/**
 * Shape of the resolved translation payload for the account settings section.
 */
export type SettingsAccountTranslations = BuildPayloadResult<typeof ACCOUNT_MAPPING>

/**
 * Builds the resolved translation payload for the account settings section.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The account settings `t` object with every UI string resolved.
 */
export function buildAccountPayload(i18n: I18nService): SettingsAccountTranslations {
  return i18n.buildPayload(ACCOUNT_MAPPING)
}
