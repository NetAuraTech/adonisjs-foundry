import { inject } from '@adonisjs/core';
import { SendInvitationAction } from '#auth/actions/invitation/send_invitation_action';
import { LogService } from '#log/services/log_service';
import type User from '#identity/models/user';

interface CreateUserPayload {
	email: string;
	roleId?: number | null;
}

/**
 * Create a new user and send an invitation.
 *
 * Delegates to the auth-domain {@link SendInvitationAction}, which owns the
 * "create pending user + send invitation mail" flow. This action keeps the
 * identity-side entry point (and its `user.created` log) for the admin
 * surface.
 */
@inject()
export class CreateUserAction {
	constructor(
		protected logService: LogService,
		protected sendInvitationAction: SendInvitationAction,
	) {}

	/**
	 * Execute user creation.
	 *
	 * @param payload - Email address and optional role ID for the new user.
	 * @returns The newly created {@link User}.
	 */
	async execute(payload: CreateUserPayload): Promise<User> {
		const user = await this.sendInvitationAction.execute(payload);

		this.logService.logAuth('user.created', {
			userId: user.id,
			userEmail: user.email,
		});

		return user;
	}
}
