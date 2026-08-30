import { BaseTransformer } from '@adonisjs/core/transformers';
import type PageTranslation from '#cms/models/page/page_translation';

/**
 * Maps a CMS {@link PageTranslation} model to the Inertia payload shape
 * consumed by the page editor and the front controllers.
 */
export default class PageTranslationTransformer extends BaseTransformer<PageTranslation> {
	/**
	 * Project the translation columns, including the resolved content used
	 * for rendering.
	 */
	toObject() {
		return this.pick(this.resource, [
			'id',
			'pageId',
			'locale',
			'slug',
			'title',
			'status',
			'metaTitle',
			'metaDescription',
			'content',
			'resolved_content',
			'updatedAt',
		]);
	}
}
