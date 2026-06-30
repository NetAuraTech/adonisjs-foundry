import { inject } from '@adonisjs/core'
import type PageTranslation from '#models/page/page_translation'
import { PageTranslationRepository } from '#repositories/page/page_translation_repository'
import { LogService } from '#services/logging/log_service'
import { sanitizePageContent } from '#services/page/sanitize_content'
import { withTransaction } from '#shared/utils/with_transaction'
import type { PageContent } from '#types/page'
import SlugExistsException from '#exceptions/core/slug_exists_exception'
import MissingTranslationException from '#exceptions/page/missing_translation_exception'

interface UpdatePagePayload {
  pageId: number
  locale: string
  slug?: string
  title?: string
  content?: PageContent
  metaTitle?: string | null
  metaDescription?: string | null
  metaImageId?: number | null
  userId: number
}

/**
 * Update an existing page translation, saving a revision before applying changes.
 *
 * Validates slug uniqueness if the slug is being changed and sanitizes content.
 */
@inject()
export class UpdatePageAction {
  constructor(
    protected translationRepository: PageTranslationRepository,
    protected logService: LogService
  ) {}

  /**
   * Execute page update.
   *
   * @param payload - Page ID, locale, fields to update, and updater user ID.
   * @returns The updated {@link PageTranslation} with a new revision saved.
   * @throws {Error} With code `E_ROW_NOT_FOUND` if the translation does not exist.
   * @throws {Error} With code `E_SLUG_EXISTS` if the new slug is already taken.
   *
   * @example
   * const updated = await updatePageAction.execute({ pageId: 1, locale: 'en', title: 'New Title', userId: 1 })
   */
  async execute(payload: UpdatePagePayload): Promise<PageTranslation> {
    return withTransaction(async () => {
      const translation = await this.translationRepository.findByPageAndLocale(
        payload.pageId,
        payload.locale
      )
      if (!translation) throw new MissingTranslationException(payload.locale, payload.pageId)

      if (payload.slug && translation.slug !== payload.slug) {
        const slugExists = await this.translationRepository.slugExists(payload.slug, translation.id)
        if (slugExists) throw new SlugExistsException(payload.slug)
      }

      const data: Partial<PageTranslation> = {}
      if (payload.slug !== undefined) data.slug = payload.slug
      if (payload.title !== undefined) data.title = payload.title
      if (payload.content !== undefined) data.content = sanitizePageContent(payload.content)
      if (payload.metaTitle !== undefined) data.metaTitle = payload.metaTitle
      if (payload.metaDescription !== undefined) data.metaDescription = payload.metaDescription

      await translation.saveRevision(payload.userId)
      const updated = await this.translationRepository.update(translation, data)

      this.logService.logBusiness(
        'page.updated',
        { userId: payload.userId },
        { pageId: payload.pageId, locale: payload.locale }
      )
      return updated
    })
  }
}
