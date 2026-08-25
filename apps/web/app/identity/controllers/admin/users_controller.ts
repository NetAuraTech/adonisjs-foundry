import { inject } from '@adonisjs/core';
import { deleteValidator } from '#app/identity/validators/user';
import { DeleteUserAction } from '#identity/actions/user/delete_user_action';
import { handle } from '#rest/page_adapter';
import UsersResource from '#rest/users_resource';
import { I18nService } from '#services/i18n_service';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class UsersController {
	constructor(
		protected i18n: I18nService,
		protected deleteUserAction: DeleteUserAction,
		protected usersResource: UsersResource,
	) {}

	async render(ctx: HttpContext) {
		return handle(ctx, this.usersResource.endpoints.index);
	}

	async destroy(ctx: HttpContext) {
		const { response, params, session } = ctx;

		const payload = await deleteValidator.validate(params);

		await this.deleteUserAction.execute({ id: payload.id });

		session.flash('success', this.i18n.translate('admin.users.deleted'));

		return response.redirect().toRoute('admin.identity.users.render');
	}
}
