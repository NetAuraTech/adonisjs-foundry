import { inject } from '@adonisjs/core';
import { contactValidator } from '#cms/validators/contact';
import { events } from '#generated/events';
import { I18nService } from '#services/i18n_service';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class ContactController {
	constructor(protected i18n: I18nService) {}

	/**
	 * Handles a contact form submission from a `ContactFormBlock`.
	 *
	 * Validates the payload, dispatches the `ContactFormSubmitted` event which
	 * triggers `SendContactFormEmail`
	 */
	async execute(ctx: HttpContext) {
		const { request, response, session } = ctx;
		const payload = await contactValidator.validate(request.all());

		await events.page.ContactFormSubmitted.dispatch(payload);

		session.flash('success', this.i18n.translate('page.contact_form.submitted'));

		return response.redirect().back();
	}
}
