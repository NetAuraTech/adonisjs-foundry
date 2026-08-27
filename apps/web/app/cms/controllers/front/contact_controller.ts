import { inject } from '@adonisjs/core';
import { contactValidator } from '#app/cms/validators/contact';
import { I18nService } from '#app/core/helpers/i18n_service';
import { ContactMailService } from '#cms/services/contact_mail_service';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class ContactController {
	constructor(
		protected i18n: I18nService,
		protected contactMailService: ContactMailService,
	) {}

	/**
	 * Handles a contact form submission from a `ContactFormBlock`.
	 *
	 * Validates the payload and hands it to the {@link ContactMailService},
	 * which renders and delivers the notification mail directly.
	 */
	async execute(ctx: HttpContext) {
		const { request, response, session } = ctx;
		const payload = await contactValidator.validate(request.all());

		await this.contactMailService.sendContactFormEmail(payload);

		session.flash('success', this.i18n.translate('cms.page.contact_form.submitted'));

		return response.redirect().back();
	}
}
