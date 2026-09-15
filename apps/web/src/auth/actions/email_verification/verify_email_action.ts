import { inject } from '@adonisjs/core';
import { TOKEN_TYPES, type FullToken } from '#auth/enums/token_type';
import { TokenRepository } from '#auth/repositories/token_repository';
import { TokenService } from '#auth/services/token_service';
import { withTransaction } from '#core/services/with_transaction';
import { UserRepository } from '#identity/repositories/user_repository';
import { LogService } from '#log/services/log_service';
import type User from '#identity/models/user';

interface VerifyEmailPayload {
	token: FullToken;
}

/**
 * Verify a user email address using a token from the verification link.
 *
 * Resolves the user from the token through the {@link TokenService} —
 * consuming exactly one attempt — then marks the email as verified and
 * expires all outstanding verification tokens atomically within a
 * transaction. The token row is re-acquired with an exclusive lock as the
 * first query of the transaction, so a concurrent double-use is serialized:
 * the second presentation sees the expired token and is rejected
 * (see /docs/agents/toctou-protection.md).
 */
@inject()
export class VerifyEmailAction {
	constructor(
		protected logService: LogService,
		protected userRepository: UserRepository,
		protected tokenService: TokenService,
		protected tokenRepository: TokenRepository,
	) {}

	/**
	 * Execute email verification.
	 *
	 * @param payload - The full token string from the verification email.
	 * @returns The verified {@link User}.
	 * @throws {InvalidTokenException} When the token is invalid or already used.
	 * @throws {MaxAttemptsExceededException} When the token is locked.
	 */
	async execute(payload: VerifyEmailPayload): Promise<User> {
		const user = await this.tokenService.resolveUser(payload.token, TOKEN_TYPES.EMAIL_VERIFICATION);

		await withTransaction(async () => {
			await this.tokenService.lockUsableToken(payload.token, TOKEN_TYPES.EMAIL_VERIFICATION);
			await this.userRepository.markEmailAsVerified(user);
			await this.tokenRepository.expireTokensByType(user, TOKEN_TYPES.EMAIL_VERIFICATION);
		});

		this.logService.logAuth('email_verification.confirmed', {
			userId: user.id,
			userEmail: user.email,
		});

		return user;
	}
}
