import { inject } from '@adonisjs/core'
import { PageRepository } from '#repositories/page/page_repository'

/**
 * Generate a sitemap XML string from all published page translations.
 */
@inject()
export class GenerateSitemapAction {
  constructor(protected pageRepository: PageRepository) {}

  /**
   * Execute sitemap generation.
   *
   * @returns The complete sitemap XML string.
   */
  async execute(): Promise<string> {
    return this.pageRepository.generateSitemap(process.env.APP_URL ?? 'http://localhost:3000')
  }
}
