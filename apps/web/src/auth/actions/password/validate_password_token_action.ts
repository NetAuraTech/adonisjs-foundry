import { inject } from '@adonisjs/core';
import { TokenRepository } from '#auth/repositories/token_repository';
import type { FullToken } from '#auth/enums/token_type';

interface ValidatePasswordTokenPayload {
	token: FullToken;
}

/**
 * Validate a password reset token for frontend display.
 *
 * The token is fully verified, so this presentation consumes exactly one
 * attempt increment (see {@link TokenRepository.checkAttempts}); an invalid
 * or locked token throws before the page is rendered.
 */
@inject()
export class ValidatePasswordTokenAction {
	constructor(protected tokenRepository: TokenRepository) {}

	/**
	 * @param payload - The full token string to validate.
	 * @returns Nothing; resolves when the token is valid, throws otherwise.
	 */
	async execute(payload: ValidatePasswordTokenPayload): Promise<void> {
		await this.tokenRepository.verifyPasswordResetToken(payload.token);
	}
}
