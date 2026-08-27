import { inject } from '@adonisjs/core';
import { I18nService } from '#app/core/helpers/i18n_service';
import { buildUsersShowPayload } from '#app/identity/helpers/i18n_payloads/users_show';
import PermissionTransformer from '#app/identity/transformers/permission_transformer';
import UserTransformer from '#app/identity/transformers/user_transformer';
import { showValidator } from '#app/identity/validators/user';
import { enabledProviders } from '#auth/oauth_providers';
import { ListAllPermissionsAction } from '#identity/actions/permission/list_all_permissions_action';
import { GetUserDetailAction } from '#identity/actions/user/get_user_detail_action';
import Role from '#identity/models/role';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class UsersShowsController {
	constructor(
		protected i18n: I18nService,
		protected getUserDetailAction: GetUserDetailAction,
		protected listAllPermissionsAction: ListAllPermissionsAction,
	) {}

	async render(ctx: HttpContext) {
		const { inertia, params } = ctx;

		const payload = await showValidator.validate(params);

		const user = await this.getUserDetailAction.execute({ id: payload.id });

		const role = user.role as unknown as Role;

		const permissions = await this.listAllPermissionsAction.execute();

		return inertia.render('auth/admin/show', {
			user: UserTransformer.transform(user),
			providers: enabledProviders,
			permissions: PermissionTransformer.transform(permissions),
			translations: buildUsersShowPayload(this.i18n, role, permissions),
		});
	}
}
