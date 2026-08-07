import type { I18nService } from '#services/i18n_service'

export function buildPagesCreatePayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'page.admin.create.title',
    action: 'page.admin.list.title',
    details: 'page.admin.create.details.value',
    locale: 'page.admin.form.locale.default',
    slug: 'page.admin.form.slug.value',
    page_title: {
      value: 'page.admin.form.title.value',
      placeholder: 'page.admin.form.title.placeholder',
    },
    seo: {
      value: 'page.admin.create.seo.value',
      help: i18n.entry('page.admin.create.seo.help', { title: '{title}' }),
    },
    meta: {
      title: {
        value: 'page.admin.form.meta.title.value',
        placeholder: 'page.admin.form.meta.title.placeholder',
      },
      description: {
        value: 'page.admin.form.meta.description.value',
        placeholder: 'page.admin.form.meta.description.placeholder',
      },
    },
    submit: 'page.admin.form.submit',
  })
}
