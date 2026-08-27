import { createI18nEntry, type BuildPayloadResult, type I18nTranslator } from '#core/contracts/i18n_translator';

/**
 * The flat i18n key mapping for the admin page detail page.
 */
export const PAGES_SHOW_MAPPING = {
	title: createI18nEntry('cms.page.admin.show.title', { title: '{title}' }),
	translation: createI18nEntry('cms.page.admin.show.translation', { count: '{count}' }),
	actions: {
		back: 'cms.page.admin.list.title',
		edit: createI18nEntry('cms.page.admin.edit.title', { title: '{title}' }),
		show: createI18nEntry('cms.page.admin.show.title', { title: '{title}' }),
		delete: {
			confirm: createI18nEntry('cms.page.admin.delete.title', { title: '{title}' }),
			value: createI18nEntry('cms.page.admin.delete.title', { title: '{title}' }),
		},
	},
	status: {
		draft: 'cms.page.admin.status.draft',
		published: 'cms.page.admin.status.published',
		archived: 'cms.page.admin.status.archived',
	},
	meta: {
		value: 'cms.page.admin.show.meta.value',
		title: 'cms.page.admin.show.meta.title',
		id: 'cms.page.admin.show.meta.id',
		locale: 'cms.page.admin.show.meta.locale',
		translations: 'cms.page.admin.show.meta.translations',
		created: 'cms.page.admin.show.meta.created',
		updated: 'cms.page.admin.show.meta.updated',
	},
	revision: {
		value: 'cms.page.admin.show.revision.value',
		view: 'cms.page.admin.show.revision.view',
	},
	homepage: {
		value: 'cms.page.admin.show.homepage.value',
		confirm: 'cms.page.admin.show.homepage.confirm',
		submit: 'cms.page.admin.show.homepage.submit',
		help: {
			title: {
				not_set: 'cms.page.admin.show.homepage.help.title.not_set',
				set: 'cms.page.admin.show.homepage.help.title.set',
			},
			message: {
				not_set: 'cms.page.admin.show.homepage.help.message.not_set',
				set: 'cms.page.admin.show.homepage.help.message.set',
			},
		},
	},
	last_update: 'cms.page.admin.show.last_update',
	default: 'cms.page.admin.show.default',
};

/**
 * Shape of the resolved translation payload for the admin page detail page.
 */
export type AdminPagesShowTranslations = BuildPayloadResult<typeof PAGES_SHOW_MAPPING>;

/**
 * Builds the resolved translation payload for the admin page detail page.
 *
 * @param i18n - The request-scoped {@link I18nTranslator}.
 * @returns The page detail `t` object with every UI string resolved.
 */
export function buildPagesShowPayload(i18n: I18nTranslator): AdminPagesShowTranslations {
	return i18n.buildPayload(PAGES_SHOW_MAPPING);
}
