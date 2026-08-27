import { createI18nEntry } from '#core/contracts/i18n_translator';
import type { BuildPayloadResult, I18nTranslator } from '#core/contracts/i18n_translator';

/**
 * The flat i18n key mapping for the admin template metadata edit page.
 */
export const TEMPLATES_EDIT_MAPPING = {
	title: createI18nEntry('cms.template.admin.edit.title', { name: '{name}' }),
	back: 'cms.template.admin.edit.back',
	form: {
		name: 'cms.template.admin.edit.form.name',
		description: 'cms.template.admin.edit.form.description',
		thumbnail: {
			value: 'cms.template.admin.edit.form.thumbnail.value',
			replace: 'cms.template.admin.edit.form.thumbnail.replace',
			remove: 'cms.template.admin.edit.form.thumbnail.remove',
			regenerate: 'cms.template.admin.edit.form.thumbnail.regenerate',
			regenerating: 'cms.template.admin.edit.form.thumbnail.regenerating',
			placeholder: 'cms.template.admin.edit.form.thumbnail.placeholder',
		},
		submit: 'cms.template.admin.edit.form.submit',
		cancel: 'cms.template.admin.edit.form.cancel',
	},
	preview: {
		value: 'cms.template.admin.edit.preview.value',
		empty: 'cms.template.admin.edit.preview.empty',
		block: 'cms.template.admin.edit.preview.block',
		page: 'cms.template.admin.edit.preview.page',
	},
};

/**
 * Shape of the resolved translation payload for the template edit page.
 */
export type AdminTemplatesEditTranslations = BuildPayloadResult<typeof TEMPLATES_EDIT_MAPPING>;

/**
 * Builds the translation payload for the admin template metadata edit page.
 *
 * @param i18n - The request-scoped {@link I18nTranslator}.
 * @returns The template edit `t` object with every UI string resolved.
 */
export function buildTemplatesEditPayload(i18n: I18nTranslator): AdminTemplatesEditTranslations {
	return i18n.buildPayload(TEMPLATES_EDIT_MAPPING);
}
