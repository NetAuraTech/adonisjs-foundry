import { BaseTransformer } from '@adonisjs/core/transformers';
import PageTranslationTransformer from '#transformers/page/page_translation_transformer';
import type Page from '#cms/models/page/page';

export default class PageTransformer extends BaseTransformer<Page> {
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
