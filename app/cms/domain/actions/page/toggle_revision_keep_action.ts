import { inject } from '@adonisjs/core'
import type PageRevision from '#cms/models/page/page_revision'
import { PageRevisionRepository } from '#cms/domain/repositories/page/page_revision_repository'
import { withTransaction } from '#shared/utils/with_transaction'

interface ToggleRevisionKeepPayload {
  revisionId: number
}

/**
 * Toggle the keep flag on a page revision to prevent or allow auto-cleanup.
 */
@inject()
export class ToggleRevisionKeepAction {
  constructor(protected revisionRepository: PageRevisionRepository) {}

  /**
   * Execute keep toggle.
   *
   * @param payload - Revision ID to toggle.
   * @returns The updated {@link PageRevision} with the new `keep` state.
   */
  async execute(payload: ToggleRevisionKeepPayload): Promise<PageRevision> {
    return withTransaction(async () => {
      return this.revisionRepository.toggleKeep(payload.revisionId)
    })
  }
}
