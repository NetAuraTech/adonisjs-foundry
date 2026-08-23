import { inject } from '@adonisjs/core';
import { PreviewTokenHelper } from '#helpers/core/preview_token';
import env from '#start/env';
import type { HttpContext } from '@adonisjs/core/http';

/**
 * GET /api/v1/admin/pages/preview/token — short-lived HMAC token for the
 * page preview iframe.
 *
 * Extended to an external admin via the admin REST surface: a client opens
 * the preview URL in an iframe with the token in the query string, so the
 * preview render validates the token without exposing the signing secret.
 * The token carries the authenticated user's id, keeping it unusable by
 * other users.
 */
@inject()
export default class PagesPreviewTokenController {
	protected previewTokenHelper: PreviewTokenHelper;

	constructor() {
		this.previewTokenHelper = new PreviewTokenHelper(env.get('APP_KEY').release());
	}

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
}
