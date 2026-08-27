import { inject } from '@adonisjs/core';
import { I18nService } from '#app/core/helpers/i18n_service';
import { buildUsersFormPayload } from '#app/identity/helpers/i18n_payloads/users_form';
import { roleIdsToAllowlist } from '#app/identity/helpers/load_user_role';
import RoleTransformer from '#app/identity/transformers/role_transformer';
import { createValidator } from '#app/identity/validators/user';
import { ListAllRolesAction } from '#identity/actions/role/list_all_roles_action';
import { CreateUserAction } from '#identity/actions/user/create_user_action';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class UsersCreateController {
	constructor(
		protected i18n: I18nService,
		protected createUserAction: CreateUserAction,
		protected listAllRolesAction: ListAllRolesAction,
	) {}

	async render(ctx: HttpContext) {
		const { inertia } = ctx;

		const roles = await this.listAllRolesAction.execute();

		return inertia.render('auth/admin/form', {
			roles: RoleTransformer.transform(roles),
			translations: buildUsersFormPayload(this.i18n, roles),
		});
	}

	async execute(ctx: HttpContext) {
		const { request, response, session } = ctx;

		const roles = await this.listAllRolesAction.execute();
		const allowed = roleIdsToAllowlist(roles);

		const payload = await createValidator(allowed).validate(request.all());

		const user = await this.createUserAction.execute({
			email: payload.email,
			roleId: payload.role_id ? Number(payload.role_id) : undefined,
		});

		session.flash(
			'success',
			this.i18n.translate('admin.users.created', { email: user.email, username: user.username }),
		);

		return response.redirect().toRoute('admin.identity.users_show.render', { id: user.id });
	}
}
