import { createI18nEntry, type BuildPayloadResult, type I18nService } from '#services/i18n_service';

/**
 * The flat i18n key mapping for the admin page create form.
 */
export const PAGES_CREATE_MAPPING = {
	title: 'page.admin.create.title',
	action: 'page.admin.list.title',
	details: 'page.admin.create.details.value',
	locale: 'page.admin.form.locale.default',
	slug: 'page.admin.form.slug.value',
	page_title: {
		value: 'page.admin.form.title.value',
		placeholder: 'page.admin.form.title.placeholder',
	},
	seo: {
		value: 'page.admin.create.seo.value',
		help: createI18nEntry('page.admin.create.seo.help', { title: '{title}' }),
	},
	meta: {
		title: {
			value: 'page.admin.form.meta.title.value',
			placeholder: 'page.admin.form.meta.title.placeholder',
		},
		description: {
			value: 'page.admin.form.meta.description.value',
			placeholder: 'page.admin.form.meta.description.placeholder',
		},
	},
	submit: 'page.admin.form.submit',
};

/**
 * Shape of the resolved translation payload for the admin page create form.
 */
export type AdminPagesCreateTranslations = BuildPayloadResult<typeof PAGES_CREATE_MAPPING>;

/**
 * Builds the resolved translation payload for the admin page create form.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The page create form `t` object with every UI string resolved.
 */
export function buildPagesCreatePayload(i18n: I18nService): AdminPagesCreateTranslations {
	return i18n.buildPayload(PAGES_CREATE_MAPPING);
}
