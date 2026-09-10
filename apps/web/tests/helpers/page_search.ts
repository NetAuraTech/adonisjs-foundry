import app from '@adonisjs/core/services/app';
import {
	PageSearchDriver,
	type PageSearchDocument,
	type PageSearchHit,
	type PageSearchQuery,
} from '#cms/contracts/page_search_driver';
import cmsConfig from '#config/cms';

/**
 * In-memory {@link PageSearchDriver} for tests. Records every upsert and
 * removal, and answers searches either from a test-provided callback
 * (`searchImpl`) or a simple substring match over the indexed documents.
 * Setting `fail = true` makes every method throw, to exercise the service's
 * graceful degradation.
 */
export class FakePageSearchDriver extends PageSearchDriver {
	readonly upserted: PageSearchDocument[] = [];
	readonly removedPageIds: number[] = [];
	fail = false;
	searchImpl?: (query: PageSearchQuery) => Promise<PageSearchHit[]>;
	private documents = new Map<number, PageSearchDocument>();

	async upsert(document: PageSearchDocument): Promise<void> {
		if (this.fail) throw new Error('fake driver failure (upsert)');
		this.upserted.push(document);
		this.documents.set(document.id, document);
	}

	async removeByPage(pageId: number): Promise<void> {
		if (this.fail) throw new Error('fake driver failure (remove)');
		this.removedPageIds.push(pageId);
		for (const [id, doc] of [...this.documents]) {
			if (doc.pageId === pageId) this.documents.delete(id);
		}
	}

	async search(query: PageSearchQuery): Promise<PageSearchHit[]> {
		if (this.fail) throw new Error('fake driver failure (search)');
		if (this.searchImpl) return this.searchImpl(query);

		const q = query.q.toLowerCase();
		const matches = [...this.documents.values()].filter(
			(doc) =>
				(!query.locale || doc.locale === query.locale) &&
				(!query.status || doc.status === query.status) &&
				(doc.title.toLowerCase().includes(q) ||
					doc.slug.toLowerCase().includes(q) ||
					doc.text.toLowerCase().includes(q)),
		);

		return matches.map((doc, index) => ({
			translationId: doc.id,
			pageId: doc.pageId,
			locale: doc.locale,
			score: matches.length - index,
		}));
	}
}

/**
 * Swap the {@link PageSearchDriver} binding for an in-memory fake for the
 * duration of a test (pair with {@link restorePageSearchDriver}).
 */
export function swapPageSearchDriver(): FakePageSearchDriver {
	const fake = new FakePageSearchDriver();
	app.container.swap(PageSearchDriver, () => fake);
	return fake;
}

/** Restore the real {@link PageSearchDriver} binding. */
export function restorePageSearchDriver(): void {
	app.container.restore(PageSearchDriver);
}

/** The search feature flag as it was when the app booted (to restore after tests). */
const ORIGINAL_SEARCH_ENABLED = cmsConfig.search.enabled;

/** Enable or disable the Typesense-backed search feature flag for a test. */
export function setSearchEnabled(enabled: boolean): void {
	cmsConfig.search.enabled = enabled;
}

/** Restore the search feature flag to its boot value (pair with {@link setSearchEnabled}). */
export function restoreSearchEnabled(): void {
	cmsConfig.search.enabled = ORIGINAL_SEARCH_ENABLED;
}
