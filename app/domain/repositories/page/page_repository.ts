import { transactionContext } from '#shared/context/transaction_context'
import Page from '#models/page/page'
import type { PaginationFilters } from '#types/pagination'
import type { PageStatus } from '#types/page'
import { BaseRepository } from '#repositories/base_repository'

interface ListFilters {
  status?: PageStatus
  locale?: string
  search?: string
}

/**
 * Handles all database operations for the {@link Page} model.
 *
 * Manages page metadata, homepage flagging, and published page listings.
 */
export class PageRepository extends BaseRepository {
  /**
   * Finds a page by its primary key, preloading translations and meta image.
   *
   * @param id - The page's primary key.
   * @returns The matching {@link Page}, or `null` if not found.
   *
   * @example
   * const page = await pageRepository.findById(1)
   */
  async findById(id: number): Promise<Page | null> {
    return Page.query(this.client())
      .where('id', id)
      .preload('translations')
      .preload('metaImage')
      .first()
  }

  /**
   * Finds a page by its primary key, preloading translations and meta image.
   * Throws if not found.
   *
   * @param id - The page's primary key.
   * @returns The matching {@link Page}.
   * @throws {Exception} With code `E_ROW_NOT_FOUND` if no record exists for `id`.
   *
   * @example
   * const page = await pageRepository.findByIdOrFail(1)
   */
  async findByIdOrFail(id: number): Promise<Page> {
    return Page.query(this.client())
      .where('id', id)
      .preload('translations')
      .preload('metaImage')
      .firstOrFail()
  }

  /**
   * Finds a published page by its slug across all locales.
   * The locale is derived from the matching translation's locale field.
   *
   * @param slug - The page slug to look up.
   * @returns The matching {@link Page}, or `null` if not found.
   *
   * @example
   * const page = await pageRepository.findBySlug('about-us')
   */
  async findBySlug(slug: string): Promise<Page | null> {
    return Page.query(this.client())
      .whereHas('translations', (t) => {
        t.where('slug', slug).where('status', 'published')
      })
      .preload('translations', (t) => t.preload('revisions', (r) => r.limit(0)))
      .preload('metaImage', (m) => m.preload('alts'))
      .first()
  }

  /**
   * Returns the page flagged as homepage, or null if none is set.
   *
   * @returns The homepage {@link Page}, or `null`.
   *
   * @example
   * const homepage = await pageRepository.findHomepage()
   */
  async findHomepage(): Promise<Page | null> {
    return Page.query(this.client()).where('is_homepage', true).preload('translations').first()
  }

  /**
   * Returns a paginated list of pages with optional filters.
   *
   * @param filters - Optional filters for status, locale, and search term.
   * @param pagination - Page number and items per page.
   * @returns A paginated result set.
   *
   * @example
   * const result = await pageRepository.list({ status: 'published' }, { page: 1, perPage: 20 })
   */
  async list(filters: ListFilters, pagination: PaginationFilters) {
    const query = Page.query(this.client()).preload('translations').orderBy('created_at', 'desc')

    if (filters.status) {
      query.whereHas('translations', (t) => t.where('status', filters.status!))
    }

    if (filters.locale) {
      query.whereHas('translations', (t) => t.where('locale', filters.locale!))
    }

    if (filters.search) {
      query.whereHas('translations', (t) => {
        t.whereILike('title', `%${filters.search}%`).orWhereILike('slug', `%${filters.search}%`)
      })
    }

    return query.paginate(pagination.page ?? 1, pagination.perPage ?? 20)
  }

  /**
   * Creates and persists a new page.
   *
   * @param data - The page data including default locale and creator ID.
   * @returns The newly created {@link Page}.
   *
   * @example
   * const page = await pageRepository.create({ defaultLocale: 'en', createdBy: 1 })
   */
  async create(data: {
    defaultLocale: string
    createdBy: number
    metaImageId?: number | null
  }): Promise<Page> {
    return Page.create(data, this.client())
  }

  /**
   * Updates an existing page.
   *
   * @param page - The {@link Page} instance to update.
   * @param data - Partial fields to merge into the page.
   * @returns The updated {@link Page}.
   *
   * @example
   * const updated = await pageRepository.update(page, { defaultLocale: 'fr' })
   */
  async update(
    page: Page,
    data: Partial<{
      defaultLocale: string
      metaImageId: number | null
    }>
  ): Promise<Page> {
    page.merge(data as any)
    await transactionContext.merge(page)
    await page.save()
    return page
  }

  /**
   * Sets `pageId` as the homepage, clearing the flag on any previous homepage.
   * Runs in a transaction to avoid a race condition between the clear and the set.
   *
   * @param pageId - The primary key of the page to set as homepage.
   *
   * @example
   * await pageRepository.setHomepage(5)
   */
  async setHomepage(pageId: number): Promise<void> {
    await Page.query(this.client()).where('is_homepage', true).update({ isHomepage: false })
    await Page.query(this.client()).where('id', pageId).update({ isHomepage: true })
  }

  /**
   * Deletes a page by its primary key.
   *
   * @param id - The primary key of the page to delete.
   *
   * @example
   * await pageRepository.delete(1)
   */
  async delete(id: number): Promise<void> {
    const page = await Page.query(this.client()).where('id', id).firstOrFail()
    await page.delete()
  }

  /**
   * Returns a lightweight list of pages for link selection UI.
   * Includes only id, default_locale, and translation titles/slugs.
   *
   * @returns An array of {@link Page} records with minimal preloaded data.
   *
   * @example
   * const pages = await pageRepository.listForLinks()
   */
  async listForLinks() {
    return Page.query(this.client())
      .select('id', 'default_locale')
      .preload('translations', (q) => q.select('title', 'locale', 'slug'))
      .orderBy('id', 'asc')
  }

  /**
   * Retrieves all pages that have at least one published translation.
   * Specifically used for XML Sitemap generation.
   *
   * @returns An array of {@link Page} records with published translations preloaded.
   *
   * @example
   * const pages = await pageRepository.listPublishedForSitemap()
   */
  async listPublishedForSitemap() {
    return Page.query(this.client())
      .whereHas('translations', (query) => {
        query.where('status', 'published')
      })
      .preload('translations', (query) => {
        query.where('status', 'published')
      })
  }

  /**
   * Alias for {@link listForLinks} — returns published pages available for internal linking.
   */
  async getLinkablePages() {
    return this.listForLinks()
  }

  /**
   * Generates an XML sitemap string from all published page translations.
   *
   * @param appUrl - The base URL of the application.
   * @returns The complete sitemap XML string.
   */
  async generateSitemap(appUrl: string): Promise<string> {
    const pages = await this.listPublishedForSitemap()
    let xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

    for (const page of pages) {
      const translations = (page as any).translations ?? []
      for (const t of translations) {
        let url: string
        if ((page as any).isHomepage) {
          url = t.locale === (page as any).defaultLocale ? `${appUrl}/` : `${appUrl}/${t.locale}/`
        } else {
          url =
            t.locale === (page as any).defaultLocale
              ? `${appUrl}/${t.slug}`
              : `${appUrl}/${t.locale}/${t.slug}`
        }
        xml += `\n  <url><loc>${url}</loc></url>`
      }
    }

    xml += '\n</urlset>'
    return xml
  }

  /**
   * Returns a basic robots.txt content string.
   *
   * @param appUrl - The base URL of the application (for sitemap reference).
   * @returns The robots.txt content.
   */
  getRobotsTxt(appUrl?: string): string {
    const lines = ['User-agent: *', 'Allow: /']
    if (appUrl) {
      lines.push(`Sitemap: ${appUrl}/sitemap.xml`)
    }
    return lines.join('\n') + '\n'
  }
}
