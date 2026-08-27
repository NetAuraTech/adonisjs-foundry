import { inject } from '@adonisjs/core';
import { TokenMailService } from '#auth/services/token_mail_service';
import { LogService } from '#log/services/log_service';
import type User from '#identity/models/user';

interface SendPasswordResetPayload {
	user: User;
}

/**
 * Trigger sending of a password reset email for a user.
 *
 * Delegates directly to the auth-domain {@link TokenMailService} — no event
 * bus is involved, so the flow is traceable in one call.
 */
@inject()
export class SendPasswordResetAction {
	constructor(
		protected logService: LogService,
		protected tokenMailService: TokenMailService,
	) {}

	/**
	 * @param payload - The User to send the reset email to.
	 * @returns Nothing; issues the token and sends the mail synchronously.
	 */
	async execute(payload: SendPasswordResetPayload): Promise<void> {
		await this.tokenMailService.sendPasswordResetEmail(payload.user);

		this.logService.logAuth('password.reset.requested', {
			userId: payload.user.id,
			userEmail: payload.user.email,
		});
	}
}
