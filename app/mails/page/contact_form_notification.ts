import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import { type ContactFormSubmission } from '#types/page'

export default class ContactFormNotification extends BaseMail {
  constructor(
    private submission: ContactFormSubmission,
    private translations: {
      subject: string
      title: string
      intro: string
      footer: string
    }
  ) {
    super()
  }

  prepare() {
    this.message
      .to(this.submission.recipientEmail)
      .subject(this.translations.subject)
      .htmlView('emails/contact_form_email', {
        locale: this.submission.locale,
        app_name: env.get('APP_NAME'),
        page_title: this.submission.pageTitle,
        fields: this.submission.fields,
        ...this.translations,
      })
  }
}
