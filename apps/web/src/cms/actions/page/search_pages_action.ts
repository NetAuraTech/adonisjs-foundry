import { inject } from '@adonisjs/core';
import { PageRepository } from '#cms/repositories/page/page_repository';
import { PageSearchService } from '#cms/services/page/page_search_service';
import type Page from '#cms/models/page/page';
import type { PageStatus } from '#cms/types/page';

/**
 * One ranked search result: a page, its full translation set (locale
 * context), and the locales whose translation matched the query.
 */
export interface PageSearchResult {
	/** The matched page, with all its translations preloaded. */
	page: Page;
	/** Locales of the translations that matched the query. */
	matchedLocales: string[];
}

interface SearchPagesPayload {
	search: string;
	locale?: string;
	status?: PageStatus;
}

/**
 * Search pages through the Typesense-backed full-text index.
 *
 * Hits are grouped per page (a page can match in several locales), ranked by
 * the driver's best hit, and enriched with the page's full translation set so
 * callers get complete locale context back.
 */
@inject()
export class SearchPagesAction {
	constructor(
		protected searchService: PageSearchService,
		protected pageRepository: PageRepository,
	) {}

	/**
	 * Execute the search.
	 *
	 * @param payload - The search term and optional locale / status filters.
	 * @returns The ranked results, or `null` when search is disabled or the
	 *          backend is unreachable (callers must degrade to the standard
	 *          listing), or `[]` when there is simply no match.
	 *
	 * @example
	 * const results = await searchPagesAction.execute({ search: 'about' })
	 */
	async execute(payload: SearchPagesPayload): Promise<PageSearchResult[] | null> {
		const hits = await this.searchService.search(payload.search, {
			locale: payload.locale,
			status: payload.status,
		});

		if (hits === null) return null;
		if (hits.length === 0) return [];

		const byPage = new Map<number, { bestScore: number; locales: Set<string> }>();
		for (const hit of hits) {
			const entry = byPage.get(hit.pageId) ?? { bestScore: 0, locales: new Set<string>() };
			entry.bestScore = Math.max(entry.bestScore, hit.score);
			entry.locales.add(hit.locale);
			byPage.set(hit.pageId, entry);
		}

		const orderedPageIds = [...byPage.entries()].sort((a, b) => b[1].bestScore - a[1].bestScore).map(([id]) => id);

		const pages = await this.pageRepository.findByIds(orderedPageIds);
		const pageMap = new Map(pages.map((page) => [page.id, page]));

		// A page deleted between the index read and the DB fetch is dropped
		// silently — its documents will be gone on the next index write.
		return orderedPageIds.flatMap((id) => {
			const page = pageMap.get(id);
			if (!page) return [];
			return [{ page, matchedLocales: [...byPage.get(id)!.locales] }];
		});
	}
}
