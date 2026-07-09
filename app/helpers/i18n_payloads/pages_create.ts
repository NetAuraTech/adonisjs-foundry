import type { I18nService } from '#services/i18n_service'

export function buildPagesCreatePayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'cms.pages.create.title',
    action: 'cms.pages.list.title',
    details: 'cms.pages.create.details.value',
    locale: 'cms.pages.form.locale.default',
    slug: 'cms.pages.form.slug.value',
    page_title: {
      value: 'cms.pages.form.title.value',
      placeholder: 'cms.pages.form.title.placeholder',
    },
    seo: {
      value: 'cms.pages.create.seo.value',
      help: i18n.entry('cms.pages.create.seo.help', { title: '{title}' }),
    },
    meta: {
      title: {
        value: 'cms.pages.form.meta.title.value',
        placeholder: 'cms.pages.form.meta.title.placeholder',
      },
      description: {
        value: 'cms.pages.form.meta.description.value',
        placeholder: 'cms.pages.form.meta.description.placeholder',
      },
    },
    submit: 'cms.pages.form.submit',
  })
}
