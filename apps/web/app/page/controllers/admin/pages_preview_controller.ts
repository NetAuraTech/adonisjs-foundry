import { inject } from '@adonisjs/core';
import vine from '@vinejs/vine';
import { GetPageDetailAction } from '#cms/domain/actions/page/get_page_detail_action';
import { BuilderSessionService } from '#cms/domain/services/page/builder_session_service';
import { PageResolverService } from '#cms/domain/services/page/page_resolver_service';
import { PageContent } from '#cms/types/page';
import { PreviewTokenHelper } from '#helpers/core/preview_token';
import env from '#start/env';
import PageTranslationTransformer from '#app/page/transformers/page_translation_transformer';
import type { HttpContext } from '@adonisjs/core/http';

const previewParamsValidator = vine.create({
	pageId: vine.number().positive(),
	locale: vine.string().trim().maxLength(10),
	token: vine.string().trim(),
	translationId: vine.number().positive().optional(),
});

@inject()
export default class PagesPreviewController {
	protected previewTokenHelper: PreviewTokenHelper;

	constructor(
		protected getPageDetailAction: GetPageDetailAction,
		protected sessionService: BuilderSessionService,
		protected resolverService: PageResolverService,
	) {
		this.previewTokenHelper = new PreviewTokenHelper(env.get('APP_KEY').release());
	}

	/**
	 * Generates and returns a short-lived preview token for the current user.
	 * Called via `GET /api/admin/page/preview/token?pageId=:id&locale=:locale`
	 * so the editor can embed the token in the iframe URL without exposing
	 * the signing secret to the client.
	 */
	async token(ctx: HttpContext) {
		const { request, response, auth } = ctx;

		const user = auth.getUserOrFail();
		const pageId = Number(request.input('pageId'));
		const locale = String(request.input('locale', 'en'));

		if (!pageId || Number.isNaN(pageId)) {
			return response.badRequest({
				error: { code: 'E_INVALID_PARAMS', message: 'pageId is required' },
			});
		}

		const token = this.previewTokenHelper.generate(pageId, user.id, locale);
		return response.ok({ token });
	}

	/**
	 * Renders the preview page inside the builder iframe.
	 *
	 * Validates the HMAC token, loads the translation (draft included — this
	 * is the whole point of the preview route), resolves file refs, and
	 * renders `page/preview` with `editable: true` so the React page can
	 * initialise the Transmit SSE listener.
	 *
	 * Route: GET /admin/pages/preview/:pageId?locale=en&token=xxx
	 */
	async render(ctx: HttpContext) {
		const { inertia, params, request, response, auth } = ctx;

		const user = auth.getUserOrFail();

		const payload = await previewParamsValidator.validate({
			pageId: params.pageId,
			locale: request.input('locale', 'en'),
			token: request.input('token', ''),
		});

		if (!this.previewTokenHelper.validate(payload.token, payload.pageId, user.id, payload.locale)) {
			return response.unauthorized({
				error: { code: 'E_INVALID_TOKEN', message: 'Preview token is invalid or expired.' },
			});
		}

		const page = await this.getPageDetailAction.execute({ id: payload.pageId });
		const translation = page.translationFor(payload.locale);

		if (!translation) {
			return response.notFound();
		}

		const draftTranslationId = payload.translationId ?? translation.id;
		const draft = await this.sessionService.getDraft<PageContent>(draftTranslationId);
		const contentToRender = draft ?? translation.content;

		translation.resolved_content = await this.resolverService.resolve(contentToRender, payload.locale);

		return inertia.render('cms/page/front/preview', {
			page: PageTranslationTransformer.transform(translation),
			editable: true,
		});
	}
}
