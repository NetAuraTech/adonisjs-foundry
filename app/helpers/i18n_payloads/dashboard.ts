import type { BuildPayloadResult, I18nService } from '#services/i18n_service';

/**
 * The flat i18n key mapping for the admin dashboard page (core sections only).
 * CMS-specific keys live in `app/cms/helpers/i18n_payloads/dashboard_cms.ts`.
 */
export const DASHBOARD_MAPPING = {
	title: 'admin.dashboard.title',
	cards: {
		users: 'admin.users.value',
		files: 'admin.files.value',
		folders: 'admin.dashboard.cards.folders',
		no_role: 'admin.dashboard.cards.no_role',
	},
	recent: {
		uploads: 'admin.dashboard.recent.uploads',
		empty: 'admin.dashboard.recent.empty',
	},
	view_all: 'admin.dashboard.view_all',
};

/**
 * Shape of the resolved translation payload for the admin dashboard page.
 */
export type AdminDashboardTranslations = BuildPayloadResult<typeof DASHBOARD_MAPPING>;

/**
 * Builds the resolved translation payload for the admin dashboard page.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The dashboard `t` object with every UI string resolved.
 */
export function buildDashboardPayload(i18n: I18nService): AdminDashboardTranslations {
	return i18n.buildPayload(DASHBOARD_MAPPING);
}
