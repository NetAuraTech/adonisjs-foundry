import { inject } from '@adonisjs/core';
import { PageRepository } from '#cms/domain/repositories/page/page_repository';
import { PageTranslationRepository } from '#cms/domain/repositories/page/page_translation_repository';
import { sanitizePageContent } from '#cms/domain/services/page/sanitize_content';
import SlugExistsException from '#core/exceptions/slug_exists_exception';
import { withTransaction } from '#core/services/with_transaction';
import { LogService } from '#services/logging/log_service';
import type Page from '#cms/models/page/page';
import type { PageContent } from '#cms/types/page';

interface CreatePagePayload {
	defaultLocale: string;
	metaImageId?: number | null;
	translation: {
		locale: string;
		slug: string;
		title: string;
		content?: PageContent;
		metaTitle?: string | null;
		metaDescription?: string | null;
	};
	userId: number;
}

/**
 * Create a new page with an initial translation, atomically within a transaction.
 *
 * Validates slug uniqueness and sanitizes the page content before persistence.
 */
@inject()
export class CreatePageAction {
	constructor(
		protected pageRepository: PageRepository,
		protected translationRepository: PageTranslationRepository,
		protected logService: LogService,
	) {}

	/**
	 * Execute page creation.
	 *
	 * @param payload - Page metadata, initial translation data, and creator user ID.
	 * @returns The newly created {@link Page} with translations preloaded.
	 * @throws {Error} With code `E_SLUG_EXISTS` if the slug is already taken.
	 *
	 * @example
	 * const page = await createPageAction.execute({ defaultLocale: 'en', translation: {...}, userId: 1 })
	 */
	async execute(payload: CreatePagePayload): Promise<Page> {
		return withTransaction(async () => {
			const slugExists = await this.translationRepository.slugExists(payload.translation.slug);
			if (slugExists) throw new SlugExistsException(payload.translation.slug);

			const safeContent = sanitizePageContent(payload.translation.content ?? { blocks: [] });

			const page = await this.pageRepository.create({
				defaultLocale: payload.defaultLocale,
				metaImageId: payload.metaImageId ?? null,
				createdBy: payload.userId,
			});

			await this.translationRepository.create({
				pageId: page.id,
				locale: payload.translation.locale,
				slug: payload.translation.slug,
				title: payload.translation.title,
				content: safeContent,
				metaTitle: payload.translation.metaTitle ?? null,
				metaDescription: payload.translation.metaDescription ?? null,
				status: 'draft',
			});

			this.logService.logBusiness(
				'page.created',
				{ userId: payload.userId },
				{ pageId: page.id, slug: payload.translation.slug },
			);
			return this.pageRepository.findByIdOrFail(page.id);
		});
	}
}
