import { inject } from '@adonisjs/core';
import { ContactMailService } from '#cms/services/contact_mail_service';
import { contactValidator } from '#transport/cms/validators/contact';
import { I18nService } from '#transport/core/helpers/i18n_service';
import type { HttpContext } from '@adonisjs/core/http';

/**
 * Front contact form endpoint: validates the submission and delivers the
 * notification mail through the CMS {@link ContactMailService}.
 */
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
