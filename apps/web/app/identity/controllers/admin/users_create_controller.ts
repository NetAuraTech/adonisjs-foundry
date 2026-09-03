import { inject } from '@adonisjs/core';
import { ListAllRolesAction } from '#identity/actions/role/list_all_roles_action';
import { CreateUserAction } from '#identity/actions/user/create_user_action';
import { I18nService } from '#transport/core/helpers/i18n_service';
import { buildUsersFormPayload } from '#transport/identity/helpers/i18n_payloads/users_form';
import { roleIdsToAllowlist } from '#transport/identity/helpers/load_user_role';
import RoleTransformer from '#transport/identity/transformers/role_transformer';
import { createValidator } from '#transport/identity/validators/user';
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
			roles: RoleTransformer.transform(roles.map((role) => role.toDomain())),
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
			this.i18n.translate('identity.admin.users.created', { email: user.email, username: user.username }),
		);

		return response.redirect().toRoute('admin.identity.users_show.render', { id: user.id });
	}
}
