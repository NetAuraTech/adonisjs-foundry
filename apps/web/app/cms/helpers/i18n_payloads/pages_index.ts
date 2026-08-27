import { createI18nEntry, type BuildPayloadResult, type I18nService } from '#services/i18n_service';

/**
 * The flat i18n key mapping for the admin pages listing page.
 */
export const PAGES_INDEX_MAPPING = {
	title: 'cms.page.admin.list.title',
	action: 'cms.page.admin.list.action',
	search: {
		value: 'cms.page.admin.search.value',
		placeholder: 'cms.page.admin.search.placeholder',
		filter: 'cms.page.admin.search.filter',
	},
	status: {
		all: 'cms.page.admin.status.all',
		draft: 'cms.page.admin.status.draft',
		published: 'cms.page.admin.status.published',
		archived: 'cms.page.admin.status.archived',
		value: 'cms.page.admin.status.value',
	},
	locale: {
		value: 'cms.page.admin.locale.value',
		all: 'cms.page.admin.locale.all',
	},
	page_title: 'cms.page.admin.form.title.value',
	slug: 'cms.page.admin.form.slug.value',
	empty: 'cms.page.admin.list.empty',
	value: 'cms.page.admin.value',
	value_one: 'cms.page.admin.value_one',
	actions: {
		value: 'cms.page.admin.actions',
		show: createI18nEntry('cms.page.admin.show.title', { title: '{title}' }),
		edit: createI18nEntry('cms.page.admin.edit.title', { title: '{title}' }),
		delete: {
			value: createI18nEntry('cms.page.admin.delete.title', { title: '{title}' }),
			confirm: 'cms.page.admin.delete.confirm',
		},
	},
};

/**
 * Shape of the resolved translation payload for the admin pages listing page.
 */
export type AdminPagesIndexTranslations = BuildPayloadResult<typeof PAGES_INDEX_MAPPING>;

/**
 * Builds the resolved translation payload for the admin pages listing page.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The pages listing `t` object with every UI string resolved.
 */
export function buildPagesIndexPayload(i18n: I18nService): AdminPagesIndexTranslations {
	return i18n.buildPayload(PAGES_INDEX_MAPPING);
}
