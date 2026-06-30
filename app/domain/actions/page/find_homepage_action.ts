import { inject } from '@adonisjs/core'
import type Page from '#models/page/page'
import { PageRepository } from '#repositories/page/page_repository'

/**
 * Find the page currently flagged as the site homepage.
 */
@inject()
export class FindHomepageAction {
  constructor(protected pageRepository: PageRepository) {}

  /**
   * Execute homepage lookup.
   *
   * @returns The homepage {@link Page} with translations preloaded, or `null` if no homepage is set.
   *
   * @example
   * const homepage = await findHomepageAction.execute()
   */
  async execute(): Promise<Page | null> {
    return this.pageRepository.findHomepage()
  }
}
