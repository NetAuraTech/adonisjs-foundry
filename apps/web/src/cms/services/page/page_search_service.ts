import { inject } from '@adonisjs/core';
import { PageSearchDriver, type PageSearchHit } from '#cms/contracts/page_search_driver';
import { extractPageText } from '#cms/services/page/page_search_text';
import cmsConfig from '#config/cms';
import { LogService } from '#log/services/log_service';
import type Page from '#cms/models/page/page';
import type PageTranslation from '#cms/models/page/page_translation';
import type { PageContent, PageStatus } from '#cms/types/page';

/**
 * Filters accepted by {@link PageSearchService.search}.
 */
export interface PageSearchFilters {
	locale?: string;
	status?: PageStatus;
}

/**
 * Full-text search over CMS page translations.
 *
 * Facade over the {@link PageSearchDriver} (bound to a Typesense driver in
 * `start/container.ts`). Owns the graceful-degradation policy: every
 * operation is a no-op or a `null` result when search is disabled
 * (`SEARCH_ENABLED=false`) or when the backend is unreachable, and a search
 * outage therefore never breaks the CMS. Lifecycle actions call
 * {@link indexPage} / {@link indexTranslation} / {@link removePage} after
 * their persistence step succeeded, so a failed index write is logged and
 * swallowed, never rethrown.
 */
@inject()
export class PageSearchService {
	constructor(
		protected driver: PageSearchDriver,
		protected logService: LogService,
	) {}

	/**
	 * Whether the search backend is enabled by configuration.
	 */
	isEnabled(): boolean {
		return cmsConfig.search.enabled;
	}

	/**
	 * Index every translation of a page. The page must have its translations
	 * preloaded.
	 *
	 * @param page - The page to (re)index, with translations preloaded.
	 */
	async indexPage(page: Page): Promise<void> {
		if (!this.isEnabled()) return;

		for (const translation of page.translations ?? []) {
			await this.indexTranslation(translation);
		}
	}

	/**
	 * Index (insert or replace) a single translation document.
	 *
	 * @param translation - The translation to index.
	 */
	async indexTranslation(translation: PageTranslation): Promise<void> {
		if (!this.isEnabled()) return;

		try {
			const content: PageContent = translation.content ?? { blocks: [] };
			await this.driver.upsert({
				id: translation.id,
				pageId: translation.pageId,
				locale: translation.locale,
				slug: translation.slug,
				title: translation.title,
				metaTitle: translation.metaTitle,
				text: extractPageText(content),
				status: translation.status,
				publishedAt: translation.publishedAt ? translation.publishedAt.toMillis() : null,
			});
		} catch (error) {
			this.reportFailure('index', { pageId: translation.pageId, locale: translation.locale }, error);
		}
	}

	/**
	 * Remove every indexed document belonging to a page.
	 *
	 * @param pageId - The primary key of the deleted page.
	 */
	async removePage(pageId: number): Promise<void> {
		if (!this.isEnabled()) return;

		try {
			await this.driver.removeByPage(pageId);
		} catch (error) {
			this.reportFailure('remove', { pageId }, error);
		}
	}

	/**
	 * Run a full-text search over the indexed translations.
	 *
	 * @param q - The search term.
	 * @param filters - Optional locale / status restrictions.
	 * @returns Ranked hits best-first, or `null` when search is disabled or
	 *          the backend is unreachable — callers must degrade to the
	 *          standard listing.
	 */
	async search(q: string, filters: PageSearchFilters = {}): Promise<PageSearchHit[] | null> {
		if (!this.isEnabled()) return null;

		try {
			return await this.driver.search({ q, ...filters, limit: cmsConfig.search.maxResults });
		} catch (error) {
			this.reportFailure('search', { q }, error);
			return null;
		}
	}

	// ─── Private ────────────────────────────────────────────────────────────────

	/**
	 * Logs a backend failure. Search degradation is expected and routine
	 * (node down, not configured), so it is a warning, not an error.
	 */
	private reportFailure(operation: string, context: Record<string, unknown>, error: unknown): void {
		this.logService.warn({
			message: 'CMS page search backend unavailable, degrading gracefully',
			context: { operation, ...context },
			error: error instanceof Error ? error : undefined,
		});
	}
}
