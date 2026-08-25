import { inject } from '@adonisjs/core';
import { buildPermissionsFormPayload } from '#app/identity/helpers/i18n_payloads/permissions_form';
import { createPermissionValidator } from '#app/identity/validators/permission';
import { CreatePermissionAction } from '#identity/actions/permission/create_permission_action';
import { I18nService } from '#services/i18n_service';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class PermissionsCreateController {
	constructor(
		protected i18n: I18nService,
		protected createPermissionAction: CreatePermissionAction,
	) {}

	/**
	 * Renders the permission creation form.
	 */
	async render(ctx: HttpContext) {
		const { inertia } = ctx;

		return inertia.render('permission/admin/form', {
			permission: null,
			translations: buildPermissionsFormPayload(this.i18n),
		});
	}

	/**
	 * Creates a custom permission.
	 */
	async execute(ctx: HttpContext) {
		const { request, response, session } = ctx;

		const payload = await createPermissionValidator.validate(request.all());

		await this.createPermissionAction.execute({
			name: payload.name,
			slug: payload.slug,
			category: payload.category,
			description: payload.description ?? null,
		});

		session.flash('success', this.i18n.translate('admin.permissions.flash.created'));

		return response.redirect().toRoute('admin.identity.permissions.render');
	}
}
