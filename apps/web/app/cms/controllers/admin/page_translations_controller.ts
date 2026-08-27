import { inject } from '@adonisjs/core';
import vine from '@vinejs/vine';
import { showPageValidator } from '#app/cms/validators/page';
import { I18nService } from '#app/core/helpers/i18n_service';
import { CreateTranslationAction } from '#cms/actions/page/create_translation_action';
import type { HttpContext } from '@adonisjs/core/http';

const createTranslationValidator = vine.compile(
	vine.object({
		locale: vine.string().trim().maxLength(10),
		slug: vine.string().trim(),
		title: vine.string().trim(),
	}),
);

@inject()
export default class PageTranslationsController {
	constructor(
		protected i18n: I18nService,
		protected createTranslationAction: CreateTranslationAction,
	) {}

	async execute(ctx: HttpContext) {
		const { params, request, response, session } = ctx;

		const { id } = await showPageValidator.validate(params);
		const payload = await createTranslationValidator.validate(request.all());

		await this.createTranslationAction.execute({
			pageId: id,
			locale: payload.locale,
			slug: payload.slug,
			title: payload.title,
		});

		session.flash('success', this.i18n.translate('cms.page.translation.created'));

		return response.redirect().back();
	}
}
