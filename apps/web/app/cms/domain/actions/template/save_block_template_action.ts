import { inject } from '@adonisjs/core';
import { TemplateRepository } from '#cms/domain/repositories/template/template_repository';
import InvalidTemplateTypeException from '#cms/exceptions/template/invalid_template_type_exception';
import { withTransaction } from '#core/services/with_transaction';
import { LogService } from '#log/services/log_service';
import type Template from '#cms/models/template/template';
import type { BlockType, PageContent } from '#cms/types/page';

interface SaveBlockTemplatePayload {
	name: string;
	description?: string | null;
	blockType: BlockType;
	content: PageContent;
	overwriteId?: number | null;
	userId: number;
}

/**
 * Author a Block Template from the builder.
 *
 * When `overwriteId` is provided the target (an existing Block Template) has its
 * name, description, block type, and content replaced instead of creating a
 * duplicate — keeping the library tidy per user story 9. Otherwise a brand-new
 * `block` template is created.
 *
 * Templates are immutable source: storing reuses the raw incoming content and
 * the builder always receives a deep clone on insertion, so the stored source is
 * never mutated.
 */
@inject()
export class SaveBlockTemplateAction {
	constructor(
		protected templateRepository: TemplateRepository,
		protected logService: LogService,
	) {}

	/**
	 * Execute block template save (create or overwrite).
	 *
	 * @param payload - Template metadata, single-root content, optional overwrite target and user.
	 * @returns The saved {@link Template}.
	 * @throws {InvalidTemplateTypeException} When the overwrite target is not a block template.
	 */
	async execute(payload: SaveBlockTemplatePayload): Promise<Template> {
		if (payload.overwriteId) {
			const existing = await this.templateRepository.findByIdOrFail(payload.overwriteId);
			if (existing.type !== 'block') throw new InvalidTemplateTypeException();

			return withTransaction(() =>
				this.templateRepository.update(existing, {
					name: payload.name,
					description: payload.description ?? null,
					content: payload.content,
					blockType: payload.blockType,
				}),
			);
		}

		const template = await withTransaction(() =>
			this.templateRepository.create({
				name: payload.name,
				description: payload.description,
				type: 'block',
				blockType: payload.blockType,
				content: payload.content,
				createdBy: payload.userId,
			}),
		);

		this.logService.logBusiness(
			'template.created',
			{ userId: payload.userId },
			{ templateId: template.id, type: template.type, blockType: template.blockType },
		);
		return template;
	}
}
