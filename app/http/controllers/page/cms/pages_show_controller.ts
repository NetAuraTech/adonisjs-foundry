import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { showPageValidator } from '#validators/page'
import PageTransformer from '#transformers/page_transformer'
import { GetPageDetailAction } from '#actions/page/get_page_detail_action'
import { I18nService } from '#services/i18n_service'

@inject()
export default class PagesShowController {
  constructor(
    protected i18n: I18nService,
    protected getPageDetailAction: GetPageDetailAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, params } = ctx

    const { id } = await showPageValidator.validate(params)
    const page = await this.getPageDetailAction.execute({ id })

    return inertia.render('page/cms/show', {
      page: PageTransformer.transform(page),
      translations: this.i18n.buildPayload({
        title: this.i18n.entry('cms.pages.show.title', { title: '{title}' }),
        translation: this.i18n.entry('cms.pages.show.translation', { count: '{count}' }),
        actions: {
          back: 'cms.pages.list.title',
          edit: this.i18n.entry('cms.pages.edit.title', { title: '{title}' }),
          show: this.i18n.entry('cms.pages.show.title', { title: '{title}' }),
          delete: {
            confirm: this.i18n.entry('cms.pages.delete.title', { title: '{title}' }),
            value: this.i18n.entry('cms.pages.delete.title', { title: '{title}' }),
          },
        },
        status: {
          draft: 'cms.pages.status.draft',
          published: 'cms.pages.status.published',
          archived: 'cms.pages.status.archived',
        },
        meta: {
          value: 'cms.pages.show.meta.value',
          title: 'cms.pages.show.meta.title',
          id: 'cms.pages.show.meta.id',
          locale: 'cms.pages.show.meta.locale',
          translations: 'cms.pages.show.meta.translations',
          created: 'cms.pages.show.meta.created',
          updated: 'cms.pages.show.meta.updated',
        },
        revision: {
          value: 'cms.pages.show.revision.value',
          view: 'cms.pages.show.revision.view',
        },
        homepage: {
          value: 'cms.pages.show.homepage.value',
          confirm: 'cms.pages.show.homepage.confirm',
          submit: 'cms.pages.show.homepage.submit',
          help: {
            title: {
              not_set: 'cms.pages.show.homepage.help.title.not_set',
              set: 'cms.pages.show.homepage.help.title.set',
            },
            message: {
              not_set: 'cms.pages.show.homepage.help.message.not_set',
              set: 'cms.pages.show.homepage.help.message.set',
            },
          },
        },
        last_update: 'cms.pages.show.last_update',
        default: 'cms.pages.show.default',
      }),
    })
  }
}
