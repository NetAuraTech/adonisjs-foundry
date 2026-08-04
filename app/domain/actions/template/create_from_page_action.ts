import { inject } from '@adonisjs/core'
import type Template from '#models/template/template'
import { TemplateRepository } from '#repositories/template/template_repository'
import { PageTranslationRepository } from '#repositories/page/page_translation_repository'
import { LogService } from '#services/logging/log_service'
import RowNotFoundException from '#exceptions/core/row_not_found_exception'
import { withTransaction } from '#shared/utils/with_transaction'
import type { PageContent } from '#types/page'

interface CreateFromPagePayload {
  name: string
  pageId: number
  locale: string
  userId: number
  content?: PageContent
}

/**
 * Create a template by extracting the content from an existing page translation.
 */
@inject()
export class CreateFromPageAction {
  constructor(
    protected templateRepository: TemplateRepository,
    protected translationRepository: PageTranslationRepository,
    protected logService: LogService
  ) {}

  /**
   * Execute template creation from page.
   *
   * @param payload - Template name, source page ID, locale, and acting user.
   * @returns The newly created {@link Template}.
   */
  async execute(payload: CreateFromPagePayload): Promise<Template> {
    const translation = await this.translationRepository.findByPageAndLocale(
      payload.pageId,
      payload.locale
    )
    if (!translation) throw new RowNotFoundException()

    const content = payload.content ?? translation.content

    const template = await withTransaction(async () => {
      return this.templateRepository.create({
        name: payload.name,
        type: 'page',
        blockType: null,
        content,
        createdBy: payload.userId,
      })
    })

    this.logService.logBusiness(
      'template.created_from_page',
      { userId: payload.userId },
      { templateId: template.id, pageId: payload.pageId, locale: payload.locale }
    )
    return template
  }
}
