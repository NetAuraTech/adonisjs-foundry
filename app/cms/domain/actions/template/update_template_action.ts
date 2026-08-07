import { inject } from '@adonisjs/core'
import type Template from '#cms/models/template/template'
import { TemplateRepository } from '#cms/domain/repositories/template/template_repository'
import { withTransaction } from '#shared/utils/with_transaction'
import type { BlockType, PageContent } from '#cms/types/page'

interface UpdateTemplatePayload {
  id: number
  name?: string
  description?: string | null
  thumbnailId?: number | null
  content?: PageContent
  blockType?: BlockType | null
}

/**
 * Update an existing template.
 */
@inject()
export class UpdateTemplateAction {
  constructor(protected templateRepository: TemplateRepository) {}

  /**
   * Execute template update.
   *
   * @param payload - Template ID and fields to update.
   * @returns The updated {@link Template}.
   */
  async execute(payload: UpdateTemplatePayload): Promise<Template> {
    const template = await this.templateRepository.findByIdOrFail(payload.id)
    const data: Partial<{
      name: string
      description: string | null
      thumbnailId: number | null
      content: PageContent
      blockType: BlockType | null
    }> = {}
    if (payload.name !== undefined) data.name = payload.name
    if (payload.description !== undefined) data.description = payload.description
    if (payload.thumbnailId !== undefined) data.thumbnailId = payload.thumbnailId
    if (payload.content !== undefined) data.content = payload.content
    if (payload.blockType !== undefined) data.blockType = payload.blockType

    return withTransaction(async () => {
      return this.templateRepository.update(template, data)
    })
  }
}
