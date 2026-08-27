import { inject } from '@adonisjs/core';
import { TemplateRepository } from '#cms/domain/repositories/template/template_repository';
import { withTransaction } from '#core/services/with_transaction';
import { LogService } from '#log/services/log_service';
import type Template from '#cms/models/template/template';
import type { BlockType, PageContent } from '#cms/types/page';
import type { TemplateType } from '#cms/types/template';

interface CreateTemplatePayload {
	name: string;
	description?: string | null;
	thumbnailId?: number | null;
	type: TemplateType;
	blockType?: BlockType | null;
	content: PageContent;
	userId: number;
}

/**
 * Create a new template from provided content.
 */
@inject()
export class CreateTemplateAction {
	constructor(
		protected templateRepository: TemplateRepository,
		protected logService: LogService,
	) {}

	/**
	 * Execute template creation.
	 *
	 * @param payload - Template data and acting user ID.
	 * @returns The newly created {@link Template}.
	 */
	async execute(payload: CreateTemplatePayload): Promise<Template> {
		const template = await withTransaction(async () => {
			const { userId, ...templateData } = payload;
			return this.templateRepository.create({ ...templateData, createdBy: userId });
		});

		this.logService.logBusiness(
			'template.created',
			{ userId: payload.userId },
			{ templateId: template.id, type: template.type, blockType: template.blockType },
		);
		return template;
	}
}
