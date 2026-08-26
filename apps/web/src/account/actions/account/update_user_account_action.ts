import { inject } from '@adonisjs/core';
import hash from '@adonisjs/core/services/hash';
import { EmailChangeMailService } from '#account/services/email_change_mail_service';
import InvalidCurrentPasswordException from '#auth/exceptions/invalid_current_password_exception';
import UnverifiedAccountException from '#auth/exceptions/unverified_account_exception';
import { withTransaction } from '#core/services/with_transaction';
import User from '#identity/models/user';
import { UserRepository } from '#identity/repositories/user_repository';
import { LogService } from '#services/logging/log_service';

interface UpdateUserAccountPayload {
	user: User;
	currentPassword?: string;
	password?: string;
	email?: string;
}

/**
 * Update the authenticated user's account credentials.
 */
@inject()
export class UpdateUserAccountAction {
	constructor(
		protected logService: LogService,
		protected userRepository: UserRepository,
		protected emailChangeMailService: EmailChangeMailService,
	) {}

	async execute(payload: UpdateUserAccountPayload): Promise<User> {
		if (!payload.user.isEmailVerified) {
			this.logService.logSecurity('Attempt to update account with unverified email', {
				userId: payload.user.id,
				userEmail: payload.user.email,
			});
			throw new UnverifiedAccountException(payload.user.email);
		}

		let updated = payload.user;

		if (payload.currentPassword && payload.password) {
			const isPasswordValid = await hash.verify(payload.user.password!, payload.currentPassword);
			if (!isPasswordValid) {
				this.logService.logSecurity('Failed password change attempt - invalid current password', {
					userId: payload.user.id,
					userEmail: payload.user.email,
				});
				throw new InvalidCurrentPasswordException();
			}
			updated = await withTransaction(async () =>
				this.userRepository.update(payload.user, { password: payload.password }),
			);
		}

		if (payload.email && payload.user.email !== payload.email) {
			updated = await withTransaction(async () => {
				const user = await this.userRepository.update(payload.user, { pendingEmail: payload.email });
				if (user) await this.emailChangeMailService.sendEmailChangeMails(user);
				return user;
			});
		}

		if (updated !== payload.user) {
			this.logService.logBusiness('settings.account.updated', {
				userId: payload.user.id,
				userEmail: payload.user.email,
			});
		}

		return updated;
	}
}
