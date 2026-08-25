import { inject } from '@adonisjs/core';
import { PageRevisionRepository } from '#cms/domain/repositories/page/page_revision_repository';
import { PageTranslationRepository } from '#cms/domain/repositories/page/page_translation_repository';
import MissingRevisionException from '#cms/exceptions/page/missing_revision_exception';
import { withTransaction } from '#core/services/with_transaction';
import RowNotFoundException from '#core/exceptions/row_not_found_exception';
import { LogService } from '#services/logging/log_service';
import type PageTranslation from '#cms/models/page/page_translation';

interface RestoreRevisionPayload {
	translationId: number;
	revisionId: number;
	userId: number;
}

/**
 * Restore a page translation to a previous revision.
 */
@inject()
export class RestoreRevisionAction {
	constructor(
		protected revisionRepository: PageRevisionRepository,
		protected translationRepository: PageTranslationRepository,
		protected logService: LogService,
	) {}

	/**
	 * Execute revision restore.
	 *
	 * Saves the current state as a new revision, then replaces the content with
	 * the archived revision data atomically within a transaction.
	 *
	 * @param payload - Translation ID, revision to restore, and acting user.
	 * @returns The updated {@link PageTranslation}.
	 */
	async execute(payload: RestoreRevisionPayload): Promise<PageTranslation> {
		const translation = await this.translationRepository.findById(payload.translationId);
		if (!translation) throw new RowNotFoundException();

		const revisionData = await this.revisionRepository.getRevisionData(payload.revisionId);
		if (!revisionData) throw new MissingRevisionException(payload.revisionId);

		this.logService.logBusiness(
			'page.revision.restored',
			{ userId: payload.userId },
			{ translationId: payload.translationId, revisionId: payload.revisionId },
		);

		return withTransaction(async () => {
			await (translation as any).saveRevision(payload.userId);
			return this.translationRepository.update(translation, { content: revisionData });
		});
	}
}
