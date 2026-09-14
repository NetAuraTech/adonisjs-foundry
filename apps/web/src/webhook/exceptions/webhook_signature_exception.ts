import app from '@adonisjs/core/services/app';
import { BaseHttpException } from '#core/exceptions/base_http_exception';
import type { HttpContext } from '@adonisjs/core/http';

/**
 * Raised when an inbound webhook's `X-Signature` header is missing or does not
 * match the expected HMAC-SHA256 of the signed payload.
 *
 * Webhook senders are external programs, not browser sessions: the response is
 * always a structured JSON 401, never a flash + redirect.
 */
export default class WebhookSignatureException extends BaseHttpException {
	static status = 401;
	static code = 'E_WEBHOOK_SIGNATURE';

	constructor(private readonly reason: string) {
		super('The webhook signature is missing or invalid.', { cause: undefined });
	}

	protected override details(): Record<string, unknown> {
		return { reason: this.reason };
	}

	async handle(error: this, ctx: HttpContext): Promise<void> {
		const { response } = ctx;
		const message = ctx.i18n.t(`exceptions.${error.code}`);

		return response.status(error.status).send({
			error: {
				code: error.code,
				message,
				details: this.details(),
				...(app.inDev && { stack: error.stack }),
			},
		});
	}
}
