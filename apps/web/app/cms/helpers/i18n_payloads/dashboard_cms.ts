import type { BuildPayloadResult, I18nService } from '#services/i18n_service';

/**
 * The i18n key mapping for the CMS dashboard section.
 * Keys are nested under a `cms` branch so they never collide with the core
 * dashboard mapping (`app/helpers/i18n_payloads/dashboard.ts`).
 */
export const CMS_DASHBOARD_MAPPING = {
	cms: {
		cards: {
			pages: 'cms.page.admin.value',
			translations: 'cms.page.admin.dashboard.cards.translations',
			templates: 'cms.template.admin.value',
			published_locales: 'cms.page.admin.dashboard.cards.published_locales',
		},
		status: {
			draft: 'cms.page.admin.status.draft',
			published: 'cms.page.admin.status.published',
			archived: 'cms.page.admin.status.archived',
		},
		recent: {
			published_pages: 'cms.page.admin.dashboard.recent.published_pages',
		},
	},
};

/**
 * Shape of the resolved CMS dashboard translation fragment.
 */
export type CmsDashboardTranslations = BuildPayloadResult<typeof CMS_DASHBOARD_MAPPING>;

/**
 * Builds the resolved CMS dashboard translation fragment.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The `cms` branch of the dashboard translation payload.
 */
export function buildCmsDashboardPayload(i18n: I18nService): CmsDashboardTranslations {
	return i18n.buildPayload(CMS_DASHBOARD_MAPPING);
}
