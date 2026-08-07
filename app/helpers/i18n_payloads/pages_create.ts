import type { I18nService } from '#services/i18n_service'

export function buildPagesCreatePayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'admin.pages.create.title',
    action: 'admin.pages.list.title',
    details: 'admin.pages.create.details.value',
    locale: 'admin.pages.form.locale.default',
    slug: 'admin.pages.form.slug.value',
    page_title: {
      value: 'admin.pages.form.title.value',
      placeholder: 'admin.pages.form.title.placeholder',
    },
    seo: {
      value: 'admin.pages.create.seo.value',
      help: i18n.entry('admin.pages.create.seo.help', { title: '{title}' }),
    },
    meta: {
      title: {
        value: 'admin.pages.form.meta.title.value',
        placeholder: 'admin.pages.form.meta.title.placeholder',
      },
      description: {
        value: 'admin.pages.form.meta.description.value',
        placeholder: 'admin.pages.form.meta.description.placeholder',
      },
    },
    submit: 'admin.pages.form.submit',
  })
}
