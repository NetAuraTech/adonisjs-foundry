import { inject } from '@adonisjs/core'
import type Template from '#cms/models/template/template'
import { TemplateRepository } from '#cms/domain/repositories/template/template_repository'
import type { BlockType } from '#cms/types/page'
import type { TemplateType } from '#cms/types/template'

interface ListTemplatesPayload {
  type?: TemplateType
  blockType?: BlockType
  search?: string
}

/**
 * List templates with optional filters for type, block type, and search term.
 */
@inject()
export class ListTemplatesAction {
  constructor(protected templateRepository: TemplateRepository) {}

  /**
   * Execute template listing.
   *
   * @param payload - Optional filters for type, block type, and search term.
   * @returns An array of {@link Template} records sorted by name.
   *
   * @example
   * const templates = await listTemplatesAction.execute({ type: 'page', search: 'hero' })
   */
  async execute(payload?: ListTemplatesPayload): Promise<Template[]> {
    return this.templateRepository.list({
      type: payload?.type,
      blockType: payload?.blockType,
      search: payload?.search,
    })
  }
}
