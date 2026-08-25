import { inject } from '@adonisjs/core';
import { RegisterUserAction } from '#actions/auth/register_user_action';
import { SendEmailVerificationAction } from '#actions/email_verification/send_email_verification_action';
import { preloadUserRoleWithPermissions } from '#app/identity/helpers/load_user_role';
import UserTransformer from '#app/identity/transformers/user_transformer';
import { I18nService } from '#services/i18n_service';
import { registerValidator } from '#validators/auth';
import type { HttpContext } from '@adonisjs/core/http';

/**
 * POST /api/v1/auth/register — public self-registration for API clients.
 * Creates the user and dispatches the email-verification flow.
 */
@inject()
export default class RegisterApiController {
	constructor(
		protected i18n: I18nService,
		protected registerUserAction: RegisterUserAction,
		protected sendEmailVerificationAction: SendEmailVerificationAction,
	) {}

	/**
	 * Register a new user and dispatch the email-verification flow.
	 */
	async store(ctx: HttpContext) {
		const { request, response, serialize } = ctx;

		const payload = await registerValidator.validate(request.all());

		const user = await this.registerUserAction.execute({
			...payload,
			locale: this.i18n.getLocale(),
		});

		await this.sendEmailVerificationAction.execute({ user });

		await preloadUserRoleWithPermissions(user);

		const serialized = await serialize(UserTransformer.transform(user));

		return response.created(serialized);
	}
}
