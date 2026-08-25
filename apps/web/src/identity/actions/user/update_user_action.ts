import { inject } from '@adonisjs/core';
import RowNotFoundException from '#core/exceptions/row_not_found_exception';
import { withTransaction } from '#core/services/with_transaction';
import { events } from '#generated/events';
import User from '#identity/models/user';
import { UserRepository } from '#identity/repositories/user_repository';

interface UpdateUserPayload {
	id: number;
	email?: string;
	username?: string;
	roleId?: number | null;
}

/**
 * Update an existing user's details.
 */
@inject()
export class UpdateUserAction {
	constructor(protected userRepository: UserRepository) {}

	/**
	 * Execute user update.
	 *
	 * @param payload - User ID and fields to update.
	 * @returns The updated {@link User}.
	 * @throws {RowNotFoundException} When the user does not exist.
	 */
	async execute(payload: UpdateUserPayload): Promise<User> {
		const user = await this.userRepository.findById(payload.id);

		if (!user) {
			throw new RowNotFoundException(User);
		}

		const { email, ...rest } = payload;

		if (email && user.email !== email) {
			await withTransaction(async () => {
				await this.userRepository.update(user, { pendingEmail: email });
			});
			await events.account.InitiateEmailChange.dispatch(user);
		}

		return withTransaction(async () => {
			return this.userRepository.update(user, rest as Partial<User>);
		});
	}
}
