import { inject } from '@adonisjs/core';
import { Exception } from '@adonisjs/core/exceptions';
import { DeleteUserAccountAction } from '#account/actions/account/delete_user_account_action';
import { UpdateUserAccountAction } from '#account/actions/account/update_user_account_action';
import { enabledProviders } from '#auth/oauth_providers';
import { buildAccountPayload } from '#transport/account/helpers/i18n_payloads/account';
import {
	deleteAccountValidator,
	updateEmailValidator,
	updatePasswordValidator,
} from '#transport/account/validators/account';
import { regenerateCsrfToken } from '#transport/auth/helpers/crsf';
import { I18nService } from '#transport/core/helpers/i18n_service';
import UserTransformer from '#transport/identity/transformers/user_transformer';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class AccountController {
	constructor(
		protected i18n: I18nService,
		protected updateUserAccountAction: UpdateUserAccountAction,
		protected deleteUserAccountAction: DeleteUserAccountAction,
	) {}

	async render(ctx: HttpContext) {
		const { inertia, auth } = ctx;

		const user = auth.user!;

		return inertia.render('settings/account/front/index', {
			user: UserTransformer.transform(user.toDomain()),
			providers: enabledProviders,
			translations: buildAccountPayload(this.i18n),
		});
	}

	async execute(ctx: HttpContext) {
		const { auth, request, response, session } = ctx;

		const action = request.input('_action');

		const user = auth.getUserOrFail();

		switch (action) {
			case 'update_email': {
				const payload = await updateEmailValidator(user.id).validate(request.all());

				const updated = await this.updateUserAccountAction.execute({ user, email: payload.email });

				regenerateCsrfToken(ctx);

				if (payload.email === updated.pendingEmail) {
					session.flash('success', this.i18n.translate('account.account.success'));
				}

				return response.redirect().toRoute('account.account.render');
			}
			case 'update_password': {
				const payload = await updatePasswordValidator.validate(request.all());

				await this.updateUserAccountAction.execute({
					user,
					currentPassword: payload.current_password,
					password: payload.password,
				});

				regenerateCsrfToken(ctx);

				session.flash('success', this.i18n.translate('account.account.password.success'));

				return response.redirect().toRoute('account.account.render');
			}
			default:
				throw new Exception('', { status: 400 });
		}
	}

	async destroy(ctx: HttpContext) {
		const { auth, request, response, session } = ctx;

		const user = auth.getUserOrFail();

		const payload = await deleteAccountValidator.validate(request.all());

		await this.deleteUserAccountAction.execute({ user, password: payload.password });

		await auth.use('web').logout();

		session.flash('success', this.i18n.translate('account.password.delete.success'));

		return response.redirect().toRoute('auth.session.render');
	}
}
