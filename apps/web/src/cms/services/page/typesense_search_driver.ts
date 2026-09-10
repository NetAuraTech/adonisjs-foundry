import {
	PageSearchDriver,
	type PageSearchDocument,
	type PageSearchHit,
	type PageSearchQuery,
} from '#cms/contracts/page_search_driver';
import cmsConfig from '#config/cms';

/**
 * Per-request timeout for Typesense calls. Bounds the damage of an
 * unreachable or wedged node: the search service degrades instead of
 * hanging the admin request.
 */
const REQUEST_TIMEOUT_MS = 3_000;

/**
 * Fields searched by full-text matching, in ranking-weight order.
 */
const QUERY_BY = 'title,slug,meta_title,text';

/**
 * Typesense-backed implementation of the {@link PageSearchDriver}.
 *
 * Talks to a single Typesense node over its REST API with `fetch` — the API
 * surface used here (collection create, document upsert, filter delete,
 * search) is stable across Typesense versions. The collection is created on
 * first use when missing, so a fresh Typesense instance needs no manual
 * schema setup.
 *
 * Every method throws on network errors or non-2xx responses; the
 * {@link PageSearchService} is responsible for degrading gracefully when
 * they do.
 */
export class TypesensePageSearchDriver extends PageSearchDriver {
	private readonly baseUrl: string;
	private readonly apiKey: string;
	private readonly collection: string;
	private collectionCreated = false;

	constructor() {
		super();

		const { search } = cmsConfig;
		this.baseUrl = `http://${search.host}:${search.port}`;
		this.apiKey = search.apiKey;
		this.collection = search.collection;
	}

	/**
	 * Index a single translation document, replacing it when it already
	 * exists. The document id is the translation's primary key.
	 */
	async upsert(document: PageSearchDocument): Promise<void> {
		await this.ensureCollection();

		const response = await this.fetch(`/collections/${this.collection}/documents/${document.id}`, {
			method: 'PUT',
			body: JSON.stringify({
				page_id: document.pageId,
				locale: document.locale,
				slug: document.slug,
				title: document.title,
				meta_title: document.metaTitle,
				text: document.text,
				status: document.status,
				published_at: document.publishedAt,
			}),
		});

		if (!response.ok) {
			throw new Error(`Typesense upsert failed with status ${response.status}`);
		}
	}

	/**
	 * Remove every document belonging to a page.
	 */
	async removeByPage(pageId: number): Promise<void> {
		await this.ensureCollection();

		const response = await this.fetch(
			`/collections/${this.collection}/documents?filter_by=${encodeURIComponent(`page_id:${pageId}`)}`,
			{ method: 'DELETE' },
		);

		if (!response.ok) {
			throw new Error(`Typesense bulk delete failed with status ${response.status}`);
		}
	}

	/**
	 * Run a full-text search over the indexed translations, optionally
	 * restricted by locale and status. Hits come back best-first; the
	 * `score` is derived from the ranking position since Typesense does not
	 * expose its internal scores.
	 */
	async search(query: PageSearchQuery): Promise<PageSearchHit[]> {
		await this.ensureCollection();

		const filters: string[] = [];
		if (query.status) filters.push(`status:${query.status}`);
		if (query.locale) filters.push(`locale:${query.locale}`);

		const params = new URLSearchParams({
			q: query.q,
			query_by: QUERY_BY,
			limit: String(query.limit),
		});
		if (filters.length) params.set('filter_by', filters.join(' & '));

		const response = await this.fetch(`/collections/${this.collection}/documents/search?${params.toString()}`);

		if (!response.ok) {
			throw new Error(`Typesense search failed with status ${response.status}`);
		}

		const body: {
			hits?: { document: { id: string | number; page_id: number; locale: string } }[];
		} = await response.json();
		const hits = body.hits ?? [];

		return hits.map((hit, index) => ({
			translationId: Number(hit.document.id),
			pageId: hit.document.page_id,
			locale: hit.document.locale,
			score: hits.length - index,
		}));
	}

	// ─── Private ────────────────────────────────────────────────────────────────

	/**
	 * Creates the collection on first use. A pre-existing collection (or any
	 * conflict) is treated as success; other failures propagate.
	 */
	private async ensureCollection(): Promise<void> {
		if (this.collectionCreated) return;

		const response = await this.fetch('/collections', {
			method: 'POST',
			body: JSON.stringify({
				name: this.collection,
				fields: [
					{ name: 'page_id', type: 'int64' },
					{ name: 'locale', type: 'string', facet: true },
					{ name: 'slug', type: 'string' },
					{ name: 'title', type: 'string' },
					{ name: 'meta_title', type: 'string', optional: true },
					{ name: 'text', type: 'string' },
					{ name: 'status', type: 'string', facet: true },
					{ name: 'published_at', type: 'int64', optional: true },
				],
			}),
		});

		// 409 = the collection already exists, which is exactly what we want.
		if (response.status === 409) {
			this.collectionCreated = true;
			return;
		}

		if (!response.ok) {
			throw new Error(`Typesense collection creation failed with status ${response.status}`);
		}

		this.collectionCreated = true;
	}

	/**
	 * Performs an HTTP request against the Typesense node with the admin
	 * API key, the `Content-Type` header, and a hard timeout.
	 */
	private async fetch(path: string, init: RequestInit = {}): Promise<Response> {
		return fetch(`${this.baseUrl}${path}`, {
			...init,
			headers: {
				'Content-Type': 'application/json',
				'X-TYPESENSE-API-KEY': this.apiKey,
				...init.headers,
			},
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});
	}
}
