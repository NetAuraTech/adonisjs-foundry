import { BaseTransformer } from '@adonisjs/core/transformers';
import PageTranslationTransformer from '#app/cms/transformers/page_translation_transformer';
import type Page from '#cms/models/page/page';

/**
 * Maps a CMS {@link Page} model to the Inertia page payload, embedding
 * every translation.
 */
export default class PageTransformer extends BaseTransformer<Page> {
	/**
	 * Build the page payload, transforming all translations in parallel.
	 */
	async toObject() {
		const translations = await Promise.all(
			this.resource.translations.map((translation) => new PageTranslationTransformer(translation).toObject()),
		);

		return {
			...this.pick(this.resource, ['id', 'defaultLocale', 'isHomepage', 'createdAt', 'updatedAt']),
			translations,
		};
	}
}
