import { inject } from '@adonisjs/core';
import { DateTime } from 'luxon';
import { withTransaction } from '#core/services/with_transaction';
import RowNotFoundException from '#core/exceptions/row_not_found_exception';
import User from '#identity/models/user';
import { UserRepository } from '#identity/repositories/user_repository';
import { TokenRepository } from '#repositories/core/token_repository';
import { LogService } from '#services/logging/log_service';
import { FullToken } from '#types/core';

interface AcceptInvitationPayload {
	token: FullToken;
	password: string;
}

/**
 * Accept an invitation by setting a password and verifying email via a token.
 */
@inject()
export class AcceptInvitationAction {
	constructor(
		protected logService: LogService,
		protected userRepository: UserRepository,
		protected tokenRepository: TokenRepository,
	) {}

	/**
	 * @param payload - The invitation token and desired password
	 * @returns The updated User with password set and email verified
	 */
	async execute(payload: AcceptInvitationPayload): Promise<User> {
		return withTransaction(async () => {
			const data = await this.tokenRepository.getUserInvitationToken(payload.token);
			const user = data.user;

			const updated = await this.userRepository.update(user, {
				password: payload.password,
				emailVerifiedAt: DateTime.now(),
			});

			if (!updated) {
				throw new RowNotFoundException(User);
			}

			await this.tokenRepository.expireInviteTokens(updated);

			this.logService.logAuth('invitation.accepted', {
				userId: updated.id,
				userEmail: updated.email,
			});

			return updated;
		});
	}
}
