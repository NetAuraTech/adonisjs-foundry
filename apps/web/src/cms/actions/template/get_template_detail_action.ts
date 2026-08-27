import { inject } from '@adonisjs/core';
import { TemplateRepository } from '#cms/repositories/template/template_repository';
import type Template from '#cms/models/template/template';

interface GetTemplateDetailPayload {
	id: number;
}

/**
 * Retrieve a single template by its primary key, preloading the thumbnail image.
 */
@inject()
export class GetTemplateDetailAction {
	constructor(protected templateRepository: TemplateRepository) {}

	/**
	 * Execute template detail lookup.
	 *
	 * @param payload - The template ID to retrieve.
	 * @returns The {@link Template} with thumbnail preloaded.
	 * @throws {Exception} With code `E_ROW_NOT_FOUND` if no record exists for the given id.
	 *
	 * @example
	 * const template = await getTemplateDetailAction.execute({ id: 1 })
	 */
	async execute(payload: GetTemplateDetailPayload): Promise<Template> {
		return this.templateRepository.findByIdOrFail(payload.id);
	}
}
