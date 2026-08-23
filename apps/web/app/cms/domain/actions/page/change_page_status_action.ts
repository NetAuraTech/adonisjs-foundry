import { inject } from '@adonisjs/core';
import { DateTime } from 'luxon';
import { PageTranslationRepository } from '#cms/domain/repositories/page/page_translation_repository';
import MissingTranslationException from '#cms/exceptions/page/missing_translation_exception';
import { withTransaction } from '#core/services/with_transaction';
import { LogService } from '#services/logging/log_service';
import type PageTranslation from '#cms/models/page/page_translation';
import type { PageStatus } from '#cms/types/page';

interface ChangePageStatusPayload {
	pageId: number;
	locale: string;
	status: PageStatus;
	userId?: number;
}

/**
 * Change the publication status of a page translation.
 *
 * Publishing stamps `publishedAt` so the admin dashboard can order recent
 * publications by the actual publication date. Unpublishing keeps the last
 * publication date as historical information.
 */
@inject()
export class ChangePageStatusAction {
	constructor(
		protected translationRepository: PageTranslationRepository,
		protected logService: LogService,
	) {}

	/**
	 * Execute status change.
	 *
	 * @param payload - Page ID, locale, target status, and optional actor ID.
	 * @returns The updated {@link PageTranslation}.
	 */
	async execute(payload: ChangePageStatusPayload): Promise<PageTranslation> {
		const translation = await this.translationRepository.findByPageAndLocale(payload.pageId, payload.locale);
		if (!translation) throw new MissingTranslationException(payload.locale, payload.pageId);

		const updated = await withTransaction(async () => {
			return this.translationRepository.update(translation, {
				status: payload.status,
				...(payload.status === 'published' ? { publishedAt: DateTime.now() } : {}),
			});
		});

		// Log only after the status change actually succeeded.
		this.logService.logBusiness(
			payload.status === 'published' ? 'page.published' : 'page.unpublished',
			{ userId: payload.userId },
			{ pageId: payload.pageId, locale: payload.locale, status: payload.status },
		);

		return updated;
	}
}
