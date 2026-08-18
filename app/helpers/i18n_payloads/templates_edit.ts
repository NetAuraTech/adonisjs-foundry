import type { BuildPayloadResult, I18nService } from '#services/i18n_service'
import { createI18nEntry } from '#services/i18n_service'

/**
 * The flat i18n key mapping for the admin template metadata edit page.
 */
export const TEMPLATES_EDIT_MAPPING = {
  title: createI18nEntry('template.admin.edit.title', { name: '{name}' }),
  back: 'template.admin.edit.back',
  form: {
    name: 'template.admin.edit.form.name',
    description: 'template.admin.edit.form.description',
    thumbnail: {
      value: 'template.admin.edit.form.thumbnail.value',
      replace: 'template.admin.edit.form.thumbnail.replace',
      remove: 'template.admin.edit.form.thumbnail.remove',
      regenerate: 'template.admin.edit.form.thumbnail.regenerate',
      regenerating: 'template.admin.edit.form.thumbnail.regenerating',
      placeholder: 'template.admin.edit.form.thumbnail.placeholder',
    },
    submit: 'template.admin.edit.form.submit',
    cancel: 'template.admin.edit.form.cancel',
  },
  preview: {
    value: 'template.admin.edit.preview.value',
    empty: 'template.admin.edit.preview.empty',
    block: 'template.admin.edit.preview.block',
    page: 'template.admin.edit.preview.page',
  },
}

/**
 * Shape of the resolved translation payload for the template edit page.
 */
export type AdminTemplatesEditTranslations = BuildPayloadResult<typeof TEMPLATES_EDIT_MAPPING>

/**
 * Builds the translation payload for the admin template metadata edit page.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The template edit `t` object with every UI string resolved.
 */
export function buildTemplatesEditPayload(i18n: I18nService): AdminTemplatesEditTranslations {
  return i18n.buildPayload(TEMPLATES_EDIT_MAPPING)
}
