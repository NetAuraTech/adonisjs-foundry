import { inject } from '@adonisjs/core';
import { SendPasswordResetAction } from '#actions/password/send_password_reset_action';
import { buildForgotPasswordPayload } from '#helpers/i18n_payloads/forgot_password';
import User from '#identity/models/user';
import { I18nService } from '#services/i18n_service';
import { forgotPasswordValidator } from '#validators/auth';
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
