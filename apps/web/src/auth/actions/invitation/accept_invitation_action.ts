import { inject } from '@adonisjs/core';
import { DateTime } from 'luxon';
import { TOKEN_TYPES, type FullToken } from '#auth/enums/token_type';
import { TokenRepository } from '#auth/repositories/token_repository';
import { TokenService } from '#auth/services/token_service';
import RowNotFoundException from '#core/exceptions/row_not_found_exception';
import { withTransaction } from '#core/services/with_transaction';
import User from '#identity/models/user';
import { UserRepository } from '#identity/repositories/user_repository';
import { LogService } from '#log/services/log_service';

interface AcceptInvitationPayload {
	token: FullToken;
	password: string;
}

/**
 * Accept an invitation by setting a password and verifying email via a token.
 *
 * Resolves the invited user through the {@link TokenService} — consuming
 * exactly one attempt — then sets the password, verifies the email, and
 * expires the invitation tokens atomically within a transaction.
 */
@inject()
export class AcceptInvitationAction {
	constructor(
		protected logService: LogService,
		protected userRepository: UserRepository,
		protected tokenService: TokenService,
		protected tokenRepository: TokenRepository,
	) {}

	/**
	 * @param payload - The invitation token and desired password
	 * @returns The updated User with password set and email verified
	 * @throws {InvalidTokenException} When the token is invalid or already used.
	 * @throws {MaxAttemptsExceededException} When the token is locked.
	 * @throws {RowNotFoundException} When the invited user no longer exists.
	 */
	async execute(payload: AcceptInvitationPayload): Promise<User> {
		return withTransaction(async () => {
			const user = await this.tokenService.resolveUser(payload.token, TOKEN_TYPES.PENDING_INVITE);

			const updated = await this.userRepository.update(user, {
				password: payload.password,
				emailVerifiedAt: DateTime.now(),
			});

			if (!updated) {
				throw new RowNotFoundException(User);
			}

			await this.tokenRepository.expireTokensByType(updated, TOKEN_TYPES.PENDING_INVITE);

			this.logService.logAuth('invitation.accepted', {
				userId: updated.id,
				userEmail: updated.email,
			});

			return updated;
		});
	}
}
