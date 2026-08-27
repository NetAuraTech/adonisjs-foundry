import type { BuildPayloadResult, I18nService } from '#services/i18n_service';

/**
 * The flat i18n key mapping for the admin page revisions listing page.
 */
export const PAGE_REVISIONS_MAPPING = {
	title: 'cms.page.admin.show.revision.value',
	help: 'cms.page.admin.show.revision.help',
	index: 'cms.page.admin.show.revision.index',
	created: {
		at: 'cms.page.admin.show.revision.created.at',
		by: 'cms.page.admin.show.revision.created.by',
	},
	empty: {
		value: 'cms.page.admin.show.revision.empty.value',
		help: 'cms.page.admin.show.revision.empty.help',
	},
	latest: 'cms.page.admin.show.revision.latest',
	actions: {
		value: 'cms.page.admin.actions',
		back: 'cms.page.admin.show.revision.back',
		restore: {
			value: 'cms.page.admin.show.revision.restore.value',
			confirm: 'cms.page.admin.show.revision.restore.confirm',
		},
		unpin: 'cms.page.admin.show.revision.unpin',
		pin: 'cms.page.admin.show.revision.pin',
	},
};

/**
 * Shape of the resolved translation payload for the admin page revisions page.
 */
export type AdminPagesRevisionTranslations = BuildPayloadResult<typeof PAGE_REVISIONS_MAPPING>;

/**
 * Builds the resolved translation payload for the admin page revisions page.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The page revisions `t` object with every UI string resolved.
 */
export function buildPageRevisionsPayload(i18n: I18nService): AdminPagesRevisionTranslations {
	return i18n.buildPayload(PAGE_REVISIONS_MAPPING);
}
