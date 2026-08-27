import { inject } from '@adonisjs/core';
import { PageRepository } from '#cms/repositories/page/page_repository';
import { PageTranslationRepository } from '#cms/repositories/page/page_translation_repository';
import type { DashboardPageSection } from '#cms/types/dashboard';
import type { DashboardCollector, DashboardCollectorPayload } from '#core/types/dashboard';

/**
 * Contributes the page section of the admin dashboard: page and translation
 * counts, the published-locale count, and the recent publishing activity.
 *
 * Read-only: figures come from dedicated repository aggregates and a bounded
 * recent-items query — no full table loads — so the dashboard stays cheap as
 * data grows.
 */
@inject()
export class PageDashboardCollector implements DashboardCollector<'page'> {
	constructor(
		protected pageRepository: PageRepository,
		protected pageTranslationRepository: PageTranslationRepository,
	) {}

	/**
	 * Collect the page dashboard section.
	 *
	 * @param payload - Recent-activity list limit forwarded by the stats action.
	 * @returns The page figures and the recent publishing activity.
	 */
	async collect(payload: DashboardCollectorPayload): Promise<DashboardPageSection> {
		const [totalPages, byStatus, publishedLocales, recentPublished] = await Promise.all([
			this.pageRepository.count(),
			this.pageTranslationRepository.countByStatus(),
			this.pageTranslationRepository.countPublishedLocales(),
			this.pageTranslationRepository.listRecentlyPublished(payload.recentLimit),
		]);

		return {
			pages: totalPages,
			pageTranslations: {
				...byStatus,
				total: byStatus.draft + byStatus.published + byStatus.archived,
			},
			publishedLocales,
			recentPublishedPages: recentPublished.map((translation) => ({
				id: translation.id,
				pageId: translation.pageId,
				title: translation.title,
				slug: translation.slug,
				locale: translation.locale,
				publishedAt: translation.publishedAt,
			})),
		};
	}
}
