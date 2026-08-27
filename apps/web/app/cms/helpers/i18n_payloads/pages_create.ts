import { createI18nEntry, type BuildPayloadResult, type I18nTranslator } from '#core/contracts/i18n_translator';

/**
 * The flat i18n key mapping for the admin page create form.
 */
export const PAGES_CREATE_MAPPING = {
	title: 'cms.page.admin.create.title',
	action: 'cms.page.admin.list.title',
	details: 'cms.page.admin.create.details.value',
	locale: 'cms.page.admin.form.locale.default',
	slug: 'cms.page.admin.form.slug.value',
	page_title: {
		value: 'cms.page.admin.form.title.value',
		placeholder: 'cms.page.admin.form.title.placeholder',
	},
	seo: {
		value: 'cms.page.admin.create.seo.value',
		help: createI18nEntry('cms.page.admin.create.seo.help', { title: '{title}' }),
	},
	meta: {
		title: {
			value: 'cms.page.admin.form.meta.title.value',
			placeholder: 'cms.page.admin.form.meta.title.placeholder',
		},
		description: {
			value: 'cms.page.admin.form.meta.description.value',
			placeholder: 'cms.page.admin.form.meta.description.placeholder',
		},
	},
	submit: 'cms.page.admin.form.submit',
};

/**
 * Shape of the resolved translation payload for the admin page create form.
 */
export type AdminPagesCreateTranslations = BuildPayloadResult<typeof PAGES_CREATE_MAPPING>;

/**
 * Builds the resolved translation payload for the admin page create form.
 *
 * @param i18n - The request-scoped {@link I18nTranslator}.
 * @returns The page create form `t` object with every UI string resolved.
 */
export function buildPagesCreatePayload(i18n: I18nTranslator): AdminPagesCreateTranslations {
	return i18n.buildPayload(PAGES_CREATE_MAPPING);
}
