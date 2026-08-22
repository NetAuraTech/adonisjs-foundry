import { inject } from '@adonisjs/core';
import { ListAllPermissionsAction } from '#actions/permission/list_all_permissions_action';
import { GetUserDetailAction } from '#actions/user/get_user_detail_action';
import { enabledProviders } from '#helpers/auth/oauth';
import { buildUsersShowPayload } from '#helpers/i18n_payloads/users_show';
import Role from '#models/auth/role';
import { I18nService } from '#services/i18n_service';
import PermissionTransformer from '#transformers/permission_transformer';
import UserTransformer from '#transformers/user_transformer';
import { showValidator } from '#validators/user';
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
