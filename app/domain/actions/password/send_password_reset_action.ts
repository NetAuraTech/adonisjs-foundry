import { inject } from '@adonisjs/core';
import { events } from '#generated/events';
import User from '#models/auth/user';
import { UserRepository } from '#repositories/auth/user_repository';
import { TokenRepository } from '#repositories/core/token_repository';
import { LogService } from '#services/logging/log_service';

interface SendPasswordResetPayload {
	user: User;
}

/**
 * Trigger sending of a password reset email for a user.
 */
@inject()
export class SendPasswordResetAction {
	constructor(
		protected logService: LogService,
		protected userRepository: UserRepository,
		protected tokenRepository: TokenRepository,
	) {}

	/**
	 * @param payload - The User to send the reset email to
	 * @returns Nothing; dispatches an event for async email delivery
	 */
	async execute(payload: SendPasswordResetPayload): Promise<void> {
		await events.auth.ForgotPassword.dispatch(payload.user);
	}
}
