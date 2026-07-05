import { inject } from '@adonisjs/core'
import { PageRevisionRepository } from '#repositories/page/page_revision_repository'
import type { PaginationFilters } from '#types/pagination'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import PageRevision from '#models/page/page_revision'

interface ListRevisionsPayload {
  pageId: number
  pagination: PaginationFilters
}

/**
 * List revisions for a page.
 */
@inject()
export class ListRevisionsAction {
  constructor(protected revisionRepository: PageRevisionRepository) {}

  /**
   * Execute revision listing.
   *
   * @param payload - Page ID and pagination filters.
   * @returns Paginated list of revisions (newest first).
   */
  async execute(payload: ListRevisionsPayload): Promise<ModelPaginatorContract<PageRevision>> {
    return this.revisionRepository.list(payload.pageId, payload.pagination)
  }
}
