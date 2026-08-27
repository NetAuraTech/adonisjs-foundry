import { inject } from '@adonisjs/core';
import { TokenRepository } from '#auth/repositories/token_repository';
import type { FullToken } from '#auth/enums/token_type';
import type User from '#identity/models/user';

interface GetInvitationPayload {
	token: FullToken;
}

/**
 * Retrieve the user associated with an invitation token for display.
 */
@inject()
export class GetInvitationAction {
	constructor(protected tokenRepository: TokenRepository) {}

	/**
	 * @param payload - The full invitation token string
	 * @returns The invited User or null if invalid or expired
	 */
	async execute(payload: GetInvitationPayload): Promise<User> {
		const data = await this.tokenRepository.getUserInvitationToken(payload.token);
		return data.user;
	}
}
