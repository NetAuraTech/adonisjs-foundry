import { inject } from '@adonisjs/core';
import { UserRepository } from '#identity/repositories/user_repository';
import { LogService } from '#log/services/log_service';
import type User from '#identity/models/user';

interface CreateApiTokenPayload {
	user: User;
}

export interface ApiTokenResult {
	/** Plain-text token secret — only available once, at creation time. */
	token: string;
	expiresAt: Date | null;
}

/**
 * Issues an opaque access token authenticating a user on the `api` guard.
 *
 * The token lifetime defaults to the provider configuration on the
 * {@link User} model, driven by the `AUTH_API_TOKEN_EXPIRY` env variable.
 */
@inject()
export class CreateApiTokenAction {
	constructor(
		protected logService: LogService,
		protected userRepository: UserRepository,
	) {}

	/**
	 * @param payload - The user the token authenticates.
	 * @returns The token secret (available only once) and its expiry.
	 */
	async execute(payload: CreateApiTokenPayload): Promise<ApiTokenResult> {
		const token = await this.userRepository.createAccessToken(payload.user);

		this.logService.logAuth('api_token.issued', {
			userId: payload.user.id,
			userEmail: payload.user.email,
		});

		return {
			token: token.value!.release(),
			expiresAt: token.expiresAt,
		};
	}
}
