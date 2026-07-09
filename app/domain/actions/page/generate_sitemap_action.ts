import { inject } from '@adonisjs/core'
import env from '#start/env'
import type Page from '#models/page/page'
import { PageRepository } from '#repositories/page/page_repository'

interface SitemapPageData {
  isHomepage: boolean
  defaultLocale: string
  translations: Array<{
    locale: string
    slug: string
  }>
}

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
    const pages = await this.pageRepository.listPublishedForSitemap()
    const appUrl = env.get('APP_URL') ?? 'http://localhost:3000'
    return this.buildSitemapXml(pages, appUrl)
  }

  /**
   * Constructs the sitemap XML from page data.
   *
   * - Homepage pages resolve to `/` (default locale) or `/{locale}/` (other locales).
   * - Subpages resolve to `/{slug}` (default locale) or `/{locale}/{slug}` (other locales).
   */
  buildSitemapXml(pages: Page[], appUrl: string): string {
    const urls: string[] = []

    for (const page of pages) {
      const data = this.toSitemapData(page)
      for (const t of data.translations) {
        urls.push(this.buildUrl(t, data, appUrl))
      }
    }

    let xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    for (const url of urls) {
      xml += `\n  <url><loc>${url}</loc></url>`
    }
    xml += '\n</urlset>'
    return xml
  }

  /**
   * Builds the URL for a single page translation.
   */
  buildUrl(
    translation: { locale: string; slug: string },
    page: SitemapPageData,
    appUrl: string
  ): string {
    if (page.isHomepage) {
      return translation.locale === page.defaultLocale
        ? `${appUrl}/`
        : `${appUrl}/${translation.locale}/`
    }

    return translation.locale === page.defaultLocale
      ? `${appUrl}/${translation.slug}`
      : `${appUrl}/${translation.locale}/${translation.slug}`
  }

  /**
   * Extracts sitemap-relevant data from a Page model instance.
   */
  toSitemapData(page: Page): SitemapPageData {
    return {
      isHomepage: page.isHomepage,
      defaultLocale: page.defaultLocale,
      translations: page.translations.map((t) => ({
        locale: t.locale,
        slug: t.slug,
      })),
    }
  }
}
