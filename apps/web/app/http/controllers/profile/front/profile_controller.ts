import { inject } from '@adonisjs/core';
import { UpdateUserProfileAction } from '#actions/profile/update_user_profile_action';
import { buildProfilePayload } from '#helpers/i18n_payloads/profile';
import { I18nService } from '#services/i18n_service';
import UserTransformer from '#transformers/user_transformer';
import { profileValidator } from '#validators/profile';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class ProfileController {
	constructor(
		protected i18n: I18nService,
		protected updateUserProfileAction: UpdateUserProfileAction,
	) {}

	async render(ctx: HttpContext) {
		const { inertia, auth } = ctx;

		const user = auth.user!;

		return inertia.render('settings/profile/front/index', {
			user: UserTransformer.transform(user),
			translations: buildProfilePayload(this.i18n),
		});
	}

	async execute(ctx: HttpContext) {
		const { auth, request, response, session } = ctx;

		const user = auth.getUserOrFail();

		const payload = await profileValidator(user.id).validate(request.all());

		await this.updateUserProfileAction.execute({ user, username: payload.username });

		await user.refresh();

		session.flash('success', this.i18n.translate('settings.profile.success'));

		return response.redirect().toRoute('settings.profile.render');
	}
}
