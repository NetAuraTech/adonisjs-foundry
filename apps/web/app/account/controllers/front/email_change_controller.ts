import { inject } from '@adonisjs/core';
import { ConfirmEmailChangeAction } from '#actions/account/confirm_email_change_action';
import { regenerateCsrfToken } from '#helpers/auth/crsf';
import { buildEmailChangePayload } from '#helpers/i18n_payloads/email_change';
import { I18nService } from '#services/i18n_service';
import { FullToken } from '#types/core';
import { changeEmailValidator } from '#validators/account';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class EmailChangeController {
	constructor(
		protected i18n: I18nService,
		protected confirmEmailChangeAction: ConfirmEmailChangeAction,
	) {}

	async render(ctx: HttpContext) {
		const { inertia, params } = ctx;

		return inertia.render('settings/account/front/email_change', {
			token: params.token,
			translations: buildEmailChangePayload(this.i18n),
		});
	}

	async execute(ctx: HttpContext) {
		const { request, response, session, auth } = ctx;

		await changeEmailValidator.validate(request.all());

		const updated = await this.confirmEmailChangeAction.execute({
			token: request.input('token') as FullToken,
		});

		if (!auth.user || auth.user.id !== updated.id) {
			await auth.use('web').login(updated);
		}

		regenerateCsrfToken(ctx);

		session.flash('success', this.i18n.translate('settings.email.change.success'));

		return response.redirect().toRoute('settings.account.render');
	}
}
