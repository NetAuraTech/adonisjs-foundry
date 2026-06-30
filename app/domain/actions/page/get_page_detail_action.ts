import { inject } from '@adonisjs/core'
import type Page from '#models/page/page'
import { PageRepository } from '#repositories/page/page_repository'

interface GetPageDetailPayload {
  id: number
}

/**
 * Retrieve a single page by its primary key, preloading translations and meta image.
 */
@inject()
export class GetPageDetailAction {
  constructor(protected pageRepository: PageRepository) {}

  /**
   * Execute page detail lookup.
   *
   * @param payload - The page ID to retrieve.
   * @returns The {@link Page} with translations and meta image preloaded.
   * @throws {Exception} With code `E_ROW_NOT_FOUND` if no record exists for the given id.
   *
   * @example
   * const page = await getPageDetailAction.execute({ id: 1 })
   */
  async execute(payload: GetPageDetailPayload): Promise<Page> {
    return this.pageRepository.findByIdOrFail(payload.id)
  }
}
