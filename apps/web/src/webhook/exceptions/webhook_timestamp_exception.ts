import app from '@adonisjs/core/services/app';
import { BaseHttpException } from '#core/exceptions/base_http_exception';
import type { HttpContext } from '@adonisjs/core/http';

/**
 * Raised when an inbound webhook's `X-Timestamp` header is missing, malformed,
 * or falls outside the accepted replay window.
 *
 * Webhook senders are external programs, not browser sessions: the response is
 * always a structured JSON 401, never a flash + redirect.
 */
export default class WebhookTimestampException extends BaseHttpException {
	static status = 401;
	static code = 'E_WEBHOOK_TIMESTAMP';

	constructor(private readonly reason: string) {
		super('The webhook timestamp is missing or stale.', { cause: undefined });
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
