import { inject } from '@adonisjs/core';
import { PageTranslationRepository } from '#cms/domain/repositories/page/page_translation_repository';
import { TemplateRepository } from '#cms/domain/repositories/template/template_repository';
import MissingTranslationException from '#cms/exceptions/page/missing_translation_exception';
import InvalidTemplateTypeException from '#cms/exceptions/template/invalid_template_type_exception';
import { LogService } from '#services/logging/log_service';
import { withTransaction } from '#shared/utils/with_transaction';

interface ApplyToPagePayload {
	templateId: number;
	pageId: number;
	locale: string;
	userId: number;
}

/**
 * Apply a page template to an existing page translation, replacing its content.
 *
 * Saves a revision before applying the change and validates that the template is a page-type template.
 */
@inject()
export class ApplyToPageAction {
	constructor(
		protected templateRepository: TemplateRepository,
		protected translationRepository: PageTranslationRepository,
		protected logService: LogService,
	) {}

	/**
	 * Execute template application.
	 *
	 * @param payload - Template ID, target page ID, locale, and user ID for audit logging.
	 * @throws {Error} With code `E_INVALID_TEMPLATE_TYPE` if the template is not a page template.
	 * @throws {Error} With code `E_ROW_NOT_FOUND` if the translation does not exist.
	 *
	 * @example
	 * await applyToPageAction.execute({ templateId: 1, pageId: 5, locale: 'en', userId: 1 })
	 */
	async execute(payload: ApplyToPagePayload): Promise<void> {
		await withTransaction(async () => {
			const template = await this.templateRepository.findByIdOrFail(payload.templateId);
			if (template.type !== 'page') throw new InvalidTemplateTypeException();

			const translation = await this.translationRepository.findByPageAndLocale(payload.pageId, payload.locale);
			if (!translation) throw new MissingTranslationException(payload.locale, payload.pageId);

			await translation.saveRevision(payload.userId);
			await this.translationRepository.update(translation, { content: template.content });
		});

		this.logService.logBusiness(
			'template.applied',
			{ userId: payload.userId },
			{ templateId: payload.templateId, pageId: payload.pageId, locale: payload.locale },
		);
	}
}
