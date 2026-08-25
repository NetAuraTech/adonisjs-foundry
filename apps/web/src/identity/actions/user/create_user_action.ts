import { inject } from '@adonisjs/core';
import { withTransaction } from '#core/services/with_transaction';
import EmailAlreadyExistsException from '#core/exceptions/email_already_exists_exception';
import { events } from '#generated/events';
import { extractNameFromEmail } from '#identity/domain/user';
import User from '#identity/models/user';
import { UserRepository } from '#identity/repositories/user_repository';
import { LogService } from '#services/logging/log_service';

interface CreateUserPayload {
	email: string;
	roleId?: number | null;
}

/**
 * Create a new user and dispatch an invitation event.
 */
@inject()
export class CreateUserAction {
	constructor(
		protected logService: LogService,
		protected userRepository: UserRepository,
	) {}

	/**
	 * Execute user creation.
	 *
	 * @param payload - Email address and optional role ID for the new user.
	 * @returns The newly created {@link User}.
	 * @throws {EmailAlreadyExistsException} When the email is already registered.
	 */
	async execute(payload: CreateUserPayload): Promise<User> {
		const existingUser = await this.userRepository.findByEmail(payload.email);

		if (existingUser) {
			throw new EmailAlreadyExistsException(payload.email);
		}

		const user = await withTransaction(async () => {
			return this.userRepository.create({
				email: payload.email,
				username: extractNameFromEmail(payload.email),
				password: null,
				roleId: payload.roleId ?? null,
			} as any);
		});

		await events.admin.InviteUser.dispatch(user);

		this.logService.logAuth('user.created', {
			userId: user.id,
			userEmail: user.email,
		});

		return user;
	}
}
