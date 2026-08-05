import { inject } from '@adonisjs/core'
import Page from '#models/page/page'
import { PageRepository } from '#repositories/page/page_repository'
import { LogService } from '#services/logging/log_service'
import RowNotFoundException from '#exceptions/core/row_not_found_exception'
import { withTransaction } from '#shared/utils/with_transaction'

interface DeletePagePayload {
  id: number
}

/**
 * Permanently delete a page and all its translations.
 */
@inject()
export class DeletePageAction {
  constructor(
    protected pageRepository: PageRepository,
    protected logService: LogService
  ) {}

  /**
   * Execute page deletion.
   *
   * @param payload - The page ID to delete.
   * @throws {RowNotFoundException} When the page does not exist.
   */
  async execute(payload: DeletePagePayload): Promise<void> {
    const page = await this.pageRepository.findById(payload.id)

    if (!page) {
      throw new RowNotFoundException(Page)
    }

    await withTransaction(async () => this.pageRepository.delete(payload.id))

    // Log only after the deletion actually succeeded.
    this.logService.logBusiness('page.deleted', {}, { pageId: payload.id })
  }
}
