import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import type PageTranslation from '#models/page/page_translation'
import { PageTranslationRepository } from '#repositories/page/page_translation_repository'
import { withTransaction } from '#shared/utils/with_transaction'
import type { PageStatus } from '#types/page'
import MissingTranslationException from '#exceptions/page/missing_translation_exception'

interface ChangePageStatusPayload {
  pageId: number
  locale: string
  status: PageStatus
}

/**
 * Change the publication status of a page translation.
 *
 * Publishing stamps `publishedAt` so the admin dashboard can order recent
 * publications by the actual publication date. Unpublishing keeps the last
 * publication date as historical information.
 */
@inject()
export class ChangePageStatusAction {
  constructor(protected translationRepository: PageTranslationRepository) {}

  /**
   * Execute status change.
   *
   * @param payload - Page ID, locale, and target status.
   * @returns The updated {@link PageTranslation}.
   */
  async execute(payload: ChangePageStatusPayload): Promise<PageTranslation> {
    const translation = await this.translationRepository.findByPageAndLocale(
      payload.pageId,
      payload.locale
    )
    if (!translation) throw new MissingTranslationException(payload.locale, payload.pageId)

    return withTransaction(async () => {
      return this.translationRepository.update(translation, {
        status: payload.status,
        ...(payload.status === 'published' ? { publishedAt: DateTime.now() } : {}),
      })
    })
  }
}
