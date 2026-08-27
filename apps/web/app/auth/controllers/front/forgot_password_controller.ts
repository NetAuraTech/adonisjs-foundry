import { inject } from '@adonisjs/core';
import { buildForgotPasswordPayload } from '#app/auth/helpers/i18n_payloads/forgot_password';
import { forgotPasswordValidator } from '#app/auth/validators/auth';
import { I18nService } from '#app/core/helpers/i18n_service';
import { SendPasswordResetAction } from '#auth/actions/password/send_password_reset_action';
import User from '#identity/models/user';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class ForgotPasswordController {
	constructor(
		protected i18n: I18nService,
		protected sendPasswordResetAction: SendPasswordResetAction,
	) {}

	render(ctx: HttpContext) {
		const { inertia } = ctx;

		return inertia.render('auth/front/forgot_password', {
			translations: buildForgotPasswordPayload(this.i18n),
		});
	}

	async execute(ctx: HttpContext) {
		const { request, response, session } = ctx;

		const payload = await forgotPasswordValidator.validate(request.all());

		const user = await User.findBy('email', payload.email);

		if (user) {
			await this.sendPasswordResetAction.execute({ user });
		}

		session.flash('success', this.i18n.translate('auth.password.forgot.email_sent'));

		return response.redirect().toRoute('auth.session.render');
	}
}
