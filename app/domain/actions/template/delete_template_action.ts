import { inject } from '@adonisjs/core'
import { TemplateRepository } from '#repositories/template/template_repository'
import { LogService } from '#services/logging/log_service'
import { withTransaction } from '#shared/utils/with_transaction'

interface DeleteTemplatePayload {
  id: number
}

/**
 * Delete a template by ID.
 */
@inject()
export class DeleteTemplateAction {
  constructor(
    protected templateRepository: TemplateRepository,
    protected logService: LogService
  ) {}

  /**
   * Execute template deletion.
   *
   * @param payload - Template ID to delete.
   */
  async execute(payload: DeleteTemplatePayload): Promise<void> {
    this.logService.logBusiness('template.deleted', {}, { templateId: payload.id })
    return withTransaction(async () => this.templateRepository.delete(payload.id))
  }
}
