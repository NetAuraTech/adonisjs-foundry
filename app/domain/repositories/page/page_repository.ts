import Page from '#models/page/page'
import type { PaginationFilters } from '#types/pagination'
import type { PageStatus } from '#types/page'

interface ListFilters {
  status?: PageStatus
  locale?: string
  search?: string
}

export class PageRepository {
  async findById(id: number): Promise<Page | null> {
    return Page.query().where('id', id).preload('translations').preload('metaImage').first()
  }

  async findByIdOrFail(id: number): Promise<Page> {
    return Page.query().where('id', id).preload('translations').preload('metaImage').firstOrFail()
  }

  /**
   * Finds a published page by its slug across all locales.
   * The locale is derived from the matching translation's locale field.
   */
  async findBySlug(slug: string): Promise<Page | null> {
    return Page.query()
      .whereHas('translations', (t) => {
        t.where('slug', slug).where('status', 'published')
      })
      .preload('translations', (t) => t.preload('revisions', (r) => r.limit(0)))
      .preload('metaImage', (m) => m.preload('alts'))
      .first()
  }

  async list(filters: ListFilters, pagination: PaginationFilters) {
    const query = Page.query().preload('translations').orderBy('created_at', 'desc')

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

  async create(data: {
    defaultLocale: string
    createdBy: number
    metaImageId?: number | null
  }): Promise<Page> {
    return Page.create(data)
  }

  async update(
    page: Page,
    data: Partial<{
      defaultLocale: string
      metaImageId: number | null
    }>
  ): Promise<Page> {
    page.merge(data)
    await page.save()
    return page
  }

  async delete(id: number): Promise<void> {
    const page = await Page.findOrFail(id)
    await page.delete()
  }
}
