import { MailService } from '#services/mails/mail_service'
import ContactFormSubmitted from '#events/page/contact_form_submitted'
import i18nManager from '@adonisjs/i18n/services/main'
import ContactFormNotification from '#mails/page/contact_form_notification'
import env from '#start/env'
import { inject } from '@adonisjs/core'

@inject()
export default class SendContactFormEmail {
  constructor(protected mailService: MailService) {}

  async handle(event: ContactFormSubmitted) {
    const { submission } = event
    const i18n = i18nManager.locale(submission.locale)

    const payload = new ContactFormNotification(submission, {
      subject: i18n.t('page.contact_form.mail.subject', {
        app: env.get('APP_NAME'),
        page: submission.pageTitle,
      }),
      title: i18n.t('page.contact_form.mail.title', { page: submission.pageTitle }),
      intro: i18n.t('page.contact_form.mail.intro'),
      footer: i18n.t('page.contact_form.mail.footer', { app: env.get('APP_NAME') }),
    })

    await this.mailService.send(payload)
  }
}
