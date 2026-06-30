import { inject } from '@adonisjs/core'
import { PageRepository } from '#repositories/page/page_repository'

/**
 * Generate a robots.txt string for the site.
 */
@inject()
export class GetRobotsTxtAction {
  constructor(protected pageRepository: PageRepository) {}

  /**
   * Execute robots.txt generation.
   *
   * @returns The complete robots.txt string.
   */
  async execute(): Promise<string> {
    return this.pageRepository.getRobotsTxt(process.env.APP_URL ?? 'http://localhost:3000')
  }
}
