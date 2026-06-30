import { inject } from '@adonisjs/core'
import type PageTranslation from '#models/page/page_translation'
import { PageRevisionRepository } from '#repositories/page/page_revision_repository'
import { PageTranslationRepository } from '#repositories/page/page_translation_repository'
import { LogService } from '#services/logging/log_service'
import { withTransaction } from '#shared/utils/with_transaction'
import RowNotFoundException from '#exceptions/core/row_not_found_exception'
import MissingRevisionException from '#exceptions/page/missing_revision_exception'

interface RestoreRevisionPayload {
  translationId: number
  revisionId: number
  userId: number
}

/**
 * Restore a page translation to a previous revision.
 */
@inject()
export class RestoreRevisionAction {
  constructor(
    protected revisionRepository: PageRevisionRepository,
    protected translationRepository: PageTranslationRepository,
    protected logService: LogService
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
    const translation = await this.translationRepository.findById(payload.translationId)
    if (!translation) throw new RowNotFoundException()

    const revisionData = await this.revisionRepository.getRevisionData(payload.revisionId)
    if (!revisionData) throw new MissingRevisionException(payload.revisionId)

    this.logService.logBusiness(
      'page.revision.restored',
      { userId: payload.userId },
      { translationId: payload.translationId, revisionId: payload.revisionId }
    )

    return withTransaction(async () => {
      await (translation as any).saveRevision(payload.userId)
      return this.translationRepository.update(translation, { content: revisionData })
    })
  }
}
