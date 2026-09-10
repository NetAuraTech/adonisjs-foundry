import type { PageStatus } from '#cms/types/page';

/**
 * A single indexable document: one page translation.
 *
 * The document id is the translation's primary key, so upserting the same
 * translation replaces its document in place.
 */
export interface PageSearchDocument {
	/** Primary key of the translation (used as the search document id). */
	id: number;
	/** Primary key of the owning page. */
	pageId: number;
	/** Locale of the translation (e.g. `en`, `fr`). */
	locale: string;
	/** Slug of the translation. */
	slug: string;
	/** Title of the translation. */
	title: string;
	/** SEO title, or `null` when unset. */
	metaTitle: string | null;
	/** Extracted plain text of the page content, for full-text matching. */
	text: string;
	/** Publication status of the translation. */
	status: PageStatus;
	/** Publication date in epoch milliseconds, or `null` when never published. */
	publishedAt: number | null;
}

/**
 * A filterable full-text query over the page translation index.
 */
export interface PageSearchQuery {
	/** Full-text search term. */
	q: string;
	/** Restrict to a single locale. */
	locale?: string;
	/** Restrict to a single status. */
	status?: PageStatus;
	/** Maximum number of hits to return. */
	limit: number;
}

/**
 * A single ranked hit produced by the driver, best hits first.
 */
export interface PageSearchHit {
	/** Primary key of the matching translation. */
	translationId: number;
	/** Primary key of the owning page. */
	pageId: number;
	/** Locale of the matching translation. */
	locale: string;
	/** Relevance score derived from the ranking position (higher is better). */
	score: number;
}

/**
 * Contract a page search index backend must satisfy.
 *
 * Declared as an abstract class (not an interface) so it can serve as an
 * IoC container token. The application binds it to a Typesense-backed
 * driver (`start/container.ts`), keeping {@link PageSearchService} decoupled
 * from any specific search engine. Tests swap it for an in-memory fake.
 */
export abstract class PageSearchDriver {
	/** Index a single translation document, replacing it when it already exists. */
	abstract upsert(document: PageSearchDocument): Promise<void>;

	/** Remove every document belonging to a page. */
	abstract removeByPage(pageId: number): Promise<void>;

	/** Run a full-text search, returning hits best-first. */
	abstract search(query: PageSearchQuery): Promise<PageSearchHit[]>;
}
