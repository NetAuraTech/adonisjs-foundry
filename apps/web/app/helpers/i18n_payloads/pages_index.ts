import { createI18nEntry, type BuildPayloadResult, type I18nService } from '#services/i18n_service';

/**
 * The flat i18n key mapping for the admin pages listing page.
 */
export const PAGES_INDEX_MAPPING = {
	title: 'page.admin.list.title',
	action: 'page.admin.list.action',
	search: {
		value: 'page.admin.search.value',
		placeholder: 'page.admin.search.placeholder',
		filter: 'page.admin.search.filter',
	},
	status: {
		all: 'page.admin.status.all',
		draft: 'page.admin.status.draft',
		published: 'page.admin.status.published',
		archived: 'page.admin.status.archived',
		value: 'page.admin.status.value',
	},
	locale: {
		value: 'page.admin.locale.value',
		all: 'page.admin.locale.all',
	},
	page_title: 'page.admin.form.title.value',
	slug: 'page.admin.form.slug.value',
	empty: 'page.admin.list.empty',
	value: 'page.admin.value',
	value_one: 'page.admin.value_one',
	actions: {
		value: 'page.admin.actions',
		show: createI18nEntry('page.admin.show.title', { title: '{title}' }),
		edit: createI18nEntry('page.admin.edit.title', { title: '{title}' }),
		delete: {
			value: createI18nEntry('page.admin.delete.title', { title: '{title}' }),
			confirm: 'page.admin.delete.confirm',
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
