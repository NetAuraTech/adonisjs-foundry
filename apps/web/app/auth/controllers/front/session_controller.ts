import { inject } from '@adonisjs/core';
import { regenerateCsrfToken } from '#app/auth/helpers/crsf';
import { buildSessionPayload } from '#app/auth/helpers/i18n_payloads/session';
import { loginValidator } from '#app/auth/validators/auth';
import { LoginAction } from '#auth/actions/session/login_action';
import { LogoutAction } from '#auth/actions/session/logout_action';
import { enabledProviders } from '#auth/oauth_providers';
import { I18nService } from '#services/i18n_service';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class SessionController {
	constructor(
		protected i18n: I18nService,
		protected loginAction: LoginAction,
		protected logoutAction: LogoutAction,
	) {}

	render(ctx: HttpContext) {
		const { inertia } = ctx;

		return inertia.render('auth/front/login', {
			providers: enabledProviders,
			translations: buildSessionPayload(this.i18n),
		});
	}

	async execute(ctx: HttpContext) {
		const { request, response, session, auth } = ctx;

		const payload = await loginValidator.validate(request.all());

		const user = await this.loginAction.execute({
			email: payload.email,
			password: payload.password,
		});

		await auth.use('web').login(user, payload.remember_me);
		regenerateCsrfToken(ctx);

		session.flash('success', this.i18n.translate('auth.session.login.success'));

		return response.redirect().toRoute('settings.profile.render');
	}

	async destroy(ctx: HttpContext) {
		const { auth, response, session } = ctx;

		const userId = auth.user?.id;

		await auth.use('web').logout();

		if (userId) {
			await this.logoutAction.execute({ userId });
		}

		session.flash('success', this.i18n.translate('auth.session.logout.success'));

		return response.redirect().toRoute('auth.session.render');
	}
}
