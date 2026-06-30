import { inject } from '@adonisjs/core'
import type PageTranslation from '#models/page/page_translation'
import { PageTranslationRepository } from '#repositories/page/page_translation_repository'
import { withTransaction } from '#shared/utils/with_transaction'
import { sanitizePageContent } from '#services/page/sanitize_content'
import type { PageContent } from '#types/page'
import SlugExistsException from '#exceptions/core/slug_exists_exception'

interface CreateTranslationPayload {
  pageId: number
  locale: string
  slug: string
  title: string
  metaTitle?: string | null
  metaDescription?: string | null
  seedFromLocale?: string
}

/**
 * Create a new translation for an existing page.
 */
@inject()
export class CreateTranslationAction {
  constructor(protected translationRepository: PageTranslationRepository) {}

  /**
   * Execute translation creation.
   *
   * @param payload - Page ID, locale, slug, title, and optional seed source.
   * @returns The newly created {@link PageTranslation}.
   */
  async execute(payload: CreateTranslationPayload): Promise<PageTranslation> {
    const slugExists = await this.translationRepository.slugExists(payload.slug)
    if (slugExists) throw new SlugExistsException(payload.slug)

    let content: PageContent = { blocks: [] }
    if (payload.seedFromLocale) {
      const source = await this.translationRepository.findByPageAndLocale(
        payload.pageId,
        payload.seedFromLocale
      )
      if (source) content = sanitizePageContent(JSON.parse(JSON.stringify(source.content)))
    }

    return withTransaction(async () => {
      return this.translationRepository.create({
        pageId: payload.pageId,
        locale: payload.locale,
        slug: payload.slug,
        title: payload.title,
        content,
        metaTitle: payload.metaTitle ?? null,
        metaDescription: payload.metaDescription ?? null,
        status: 'draft',
      })
    })
  }
}
