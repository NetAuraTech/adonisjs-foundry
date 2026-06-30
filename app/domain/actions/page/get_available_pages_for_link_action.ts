import { inject } from '@adonisjs/core'
import type Page from '#models/page/page'
import { PageRepository } from '#repositories/page/page_repository'

/**
 * List published pages available for internal linking.
 */
@inject()
export class GetAvailablePagesForLinkAction {
  constructor(protected pageRepository: PageRepository) {}

  /**
   * Execute linkable page listing.
   *
   * @returns Array of page summaries with translations suitable for link selectors.
   */
  async execute(): Promise<
    Array<{
      id: number
      label: string | undefined
      default_locale: string
      locales: Array<{ locale: string; slug: string }>
    }>
  > {
    const pages = await this.pageRepository.getLinkablePages()
    return pages.map((page: Page) => ({
      id: page.id,
      label: (page as any).translations?.[0]?.title,
      default_locale: page.defaultLocale,
      locales: ((page as any).translations ?? []).map((t: { locale: string; slug: string }) => ({
        locale: t.locale,
        slug: t.slug,
      })),
    }))
  }
}
