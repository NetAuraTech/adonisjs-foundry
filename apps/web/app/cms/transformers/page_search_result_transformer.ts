import { BaseTransformer } from '@adonisjs/core/transformers';
import PageTransformer from '#transport/cms/transformers/page_transformer';
import type { PageSearchResult } from '#cms/actions/page/search_pages_action';

/**
 * Maps a single {@link PageSearchResult} to the API payload: the full page
 * (with its complete translation set) plus the locales in which it matched.
 */
export default class PageSearchResultTransformer extends BaseTransformer<PageSearchResult> {
	/**
	 * Build the result payload, resolving the page through the page transformer.
	 */
	async toObject() {
		return {
			page: await new PageTransformer(this.resource.page).toObject(),
			matchedLocales: this.resource.matchedLocales,
		};
	}
}
