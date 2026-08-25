import { inject } from '@adonisjs/core';
import { events } from '#generated/events';
import User from '#identity/models/user';
import { UserRepository } from '#identity/repositories/user_repository';
import { TokenRepository } from '#repositories/core/token_repository';
import { LogService } from '#services/logging/log_service';

interface SendEmailVerificationPayload {
	user: User;
}

/**
 * Trigger sending of an email verification link for a user.
 */
@inject()
export class SendEmailVerificationAction {
	constructor(
		protected logService: LogService,
		protected userRepository: UserRepository,
		protected tokenRepository: TokenRepository,
	) {}

	/**
	 * @param payload - The User to send the verification email to
	 * @returns Nothing; dispatches an event for async email delivery
	 */
	async execute(payload: SendEmailVerificationPayload): Promise<void> {
		await events.auth.UserRegistered.dispatch(payload.user);
	}
}
