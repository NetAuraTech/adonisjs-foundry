import { inject } from '@adonisjs/core';
import { PageTranslationRepository } from '#cms/repositories/page/page_translation_repository';
import { sanitizePageContent } from '#cms/services/page/sanitize_content';
import SlugExistsException from '#core/exceptions/slug_exists_exception';
import { withTransaction } from '#core/services/with_transaction';
import type PageTranslation from '#cms/models/page/page_translation';
import type { PageContent } from '#cms/types/page';

interface CreateTranslationPayload {
	pageId: number;
	locale: string;
	slug: string;
	title: string;
	metaTitle?: string | null;
	metaDescription?: string | null;
	seedFromLocale?: string;
}

/**
 * Create a new translation for an existing page.
 */
@inject()
export class CreateTranslationAction {
	constructor(protected translationRepository: PageTranslationRepository) {}

	/**
	 * Execute translation creation.
	 *
	 * @param payload - Page ID, locale, slug, title, and optional seed source.
	 * @returns The newly created {@link PageTranslation}.
	 */
	async execute(payload: CreateTranslationPayload): Promise<PageTranslation> {
		const slugExists = await this.translationRepository.slugExists(payload.slug);
		if (slugExists) throw new SlugExistsException(payload.slug);

		let content: PageContent = { blocks: [] };
		if (payload.seedFromLocale) {
			const source = await this.translationRepository.findByPageAndLocale(payload.pageId, payload.seedFromLocale);
			if (source) content = sanitizePageContent(JSON.parse(JSON.stringify(source.content)));
		}

		return withTransaction(async () => {
			return this.translationRepository.create({
				pageId: payload.pageId,
				locale: payload.locale,
				slug: payload.slug,
				title: payload.title,
				content,
				metaTitle: payload.metaTitle ?? null,
				metaDescription: payload.metaDescription ?? null,
				status: 'draft',
			});
		});
	}
}
