import { inject } from '@adonisjs/core';
import { TemplateRepository } from '#cms/repositories/template/template_repository';
import { withTransaction } from '#core/services/with_transaction';
import { LogService } from '#log/services/log_service';

interface DeleteTemplatePayload {
	id: number;
}

/**
 * Delete a template by ID.
 */
@inject()
export class DeleteTemplateAction {
	constructor(
		protected templateRepository: TemplateRepository,
		protected logService: LogService,
	) {}

	/**
	 * Execute template deletion.
	 *
	 * @param payload - Template ID to delete.
	 */
	async execute(payload: DeleteTemplatePayload): Promise<void> {
		await withTransaction(async () => this.templateRepository.delete(payload.id));

		// Log only after the deletion actually succeeded.
		this.logService.logBusiness('template.deleted', {}, { templateId: payload.id });
	}
}
