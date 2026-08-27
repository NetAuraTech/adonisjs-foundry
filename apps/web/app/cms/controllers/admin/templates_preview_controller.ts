import { inject } from '@adonisjs/core';
import { templatePreviewValidator } from '#app/cms/validators/template';
import { GetTemplateDetailAction } from '#cms/actions/template/get_template_detail_action';
import { PreviewTokenHelper } from '#cms/domain/preview_token';
import { PageResolverService } from '#cms/services/page/page_resolver_service';
import env from '#start/env';
import type { HttpContext } from '@adonisjs/core/http';

/**
 * Token-protected preview route for Template thumbnail capture.
 *
 * Mirrors the page-preview plumbing: the editor fetches a short-lived HMAC
 * token (`GET /api/admin/template/preview/token`), opens
 * `GET /admin/templates/preview/:id?locale=en&token=xxx` in a hidden iframe,
 * and rasterises it to a PNG via `html-to-image`. The content is resolved
 * through the exact same `PageResolverService` pipeline pages use, so the
 * captured thumbnail is byte-for-byte the same render as the editor/live view.
 */
@inject()
export default class TemplatesPreviewController {
	protected previewTokenHelper: PreviewTokenHelper;

	constructor(
		protected getTemplateDetailAction: GetTemplateDetailAction,
		protected resolverService: PageResolverService,
	) {
		this.previewTokenHelper = new PreviewTokenHelper(env.get('APP_KEY').release());
	}

	/**
	 * Generates a short-lived preview token for a Template.
	 * Called via `GET /api/admin/template/preview/token?id=:id&locale=:locale`.
	 *
	 * The template id is carried in the same "pageId" slot as the page preview
	 * token, so no new signing surface is introduced.
	 */
	async token(ctx: HttpContext) {
		const { request, response, auth } = ctx;

		const user = auth.getUserOrFail();
		const id = Number(request.input('id'));
		const locale = String(request.input('locale', 'en'));

		if (!id || Number.isNaN(id)) {
			return response.badRequest({
				error: { code: 'E_INVALID_PARAMS', message: 'id is required' },
			});
		}

		const token = this.previewTokenHelper.generate(id, user.id, locale);
		return response.ok({ token });
	}

	/**
	 * Renders the Template preview inside the capture iframe.
	 *
	 * Route: GET /admin/templates/preview/:id?locale=en&token=xxx
	 */
	async render(ctx: HttpContext) {
		const { inertia, params, request, response, auth } = ctx;

		const user = auth.getUserOrFail();

		const payload = await templatePreviewValidator.validate({
			id: params.id,
			locale: request.input('locale', 'en'),
			token: request.input('token', ''),
		});

		if (!this.previewTokenHelper.validate(payload.token, payload.id, user.id, payload.locale)) {
			return response.unauthorized({
				error: { code: 'E_INVALID_TOKEN', message: 'Preview token is invalid or expired.' },
			});
		}

		const template = await this.getTemplateDetailAction.execute({ id: payload.id });

		const resolved = await this.resolverService.resolve(template.content, payload.locale);

		return (inertia.render as any)('cms/template/preview', {
			template: {
				id: template.id,
				name: template.name,
				type: template.type,
				blockType: template.blockType,
				content: resolved,
				locale: payload.locale,
			},
		});
	}
}
