import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import emitter from '@adonisjs/core/services/emitter'
import { contactValidator } from '#validators/contact'
import ContactFormSubmitted from '#events/page/contact_form_submitted'

@inject()
export default class ContactController {
  /**
   * Handles a contact form submission from a `ContactFormBlock`.
   *
   * Validates the payload, dispatches the `ContactFormSubmitted` event which
   * triggers `SendContactFormEmail`, and returns a JSON success response so
   * the React block can display the success message without a page reload.
   */
  async execute(ctx: HttpContext) {
    const { request, response, i18n } = ctx

    const payload = await contactValidator.validate(request.all())

    await emitter.emit('page:contact_form_submitted', new ContactFormSubmitted(payload))

    return response.ok({ success: true, message: i18n.t('page.contact_form.success') })
  }
}
