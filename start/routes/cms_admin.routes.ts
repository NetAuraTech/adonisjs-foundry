/*
|--------------------------------------------------------------------------
| CMS admin routes
|--------------------------------------------------------------------------
|
| Pages CRUD, revisions, preview, and templates management. Registered from
| `start/routes.ts` behind the `cms` feature flag.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

export function registerCmsAdminRoutes(): void {
  router
    .group(() => {
      // Pages
      router
        .group(() => {
          router
            .get('/', [controllers.page.admin.Pages, 'render'])
            .use([middleware.permission({ permissions: ['pages.view'] })])

          router
            .group(() => {
              router.get('/', [controllers.page.admin.PagesCreate, 'render'])
              router.post('/', [controllers.page.admin.PagesCreate, 'execute'])
            })
            .prefix('create')
            .use([middleware.permission({ permissions: ['pages.create'] })])

          router
            .group(() => {
              router
                .get('/', [controllers.page.admin.PagesShow, 'render'])
                .use([middleware.permission({ permissions: ['pages.view'] })])
              router
                .get('/edit', [controllers.page.admin.PagesUpdate, 'render'])
                .use([middleware.permission({ permissions: ['pages.update'] })])
              router
                .post('/edit', [controllers.page.admin.PagesUpdate, 'execute'])
                .use([middleware.permission({ permissions: ['pages.update'] })])
              router
                .post('/publish', [controllers.page.admin.PagesUpdate, 'publish'])
                .use([middleware.permission({ permissions: ['pages.update'] })])
              router
                .post('/unpublish', [controllers.page.admin.PagesUpdate, 'unpublish'])
                .use([middleware.permission({ permissions: ['pages.update'] })])
              router
                .post('/homepage', [controllers.page.admin.Pages, 'setHomepage'])
                .use([middleware.permission({ permissions: ['pages.update'] })])
              router
                .delete('/', [controllers.page.admin.Pages, 'destroy'])
                .use([middleware.permission({ permissions: ['pages.delete'] })])
              router
                .post('/translations', [controllers.page.admin.PageTranslations, 'execute'])
                .use([middleware.permission({ permissions: ['pages.update'] })])
              router
                .group(() => {
                  router
                    .get('/', [controllers.page.admin.PageRevisions, 'index'])
                    .use([middleware.permission({ permissions: ['pages.view'] })])
                  router
                    .post('/:revisionId/restore', [controllers.page.admin.PageRevisions, 'restore'])
                    .use([middleware.permission({ permissions: ['pages.update'] })])
                  router
                    .post('/:revisionId/keep', [controllers.page.admin.PageRevisions, 'toggleKeep'])
                    .use([middleware.permission({ permissions: ['pages.update'] })])
                })
                .prefix('translations/:translationId/revisions')
            })
            .prefix(':id')

          router
            .get('/preview/:pageId', [controllers.page.admin.PagesPreview, 'render'])
            .use([middleware.permission({ permissions: ['pages.view'] })])
        })
        .prefix('pages')

      // Templates
      router
        .group(() => {
          router
            .get('/', [controllers.template.admin.Templates, 'render'])
            .use([middleware.permission({ permissions: ['templates.view'] })])
          router
            .post('/', [controllers.template.admin.Templates, 'execute'])
            .use([middleware.permission({ permissions: ['templates.create'] })])
          router
            .post('/:id/apply', [controllers.template.admin.Templates, 'applyToPage'])
            .use([middleware.permission({ permissions: ['templates.update'] })])
          router
            .post('/:id', [controllers.template.admin.Templates, 'update'])
            .use([middleware.permission({ permissions: ['templates.update'] })])
          router
            .delete('/:id', [controllers.template.admin.Templates, 'destroy'])
            .use([middleware.permission({ permissions: ['templates.delete'] })])
          router
            .get('/preview/:id', [controllers.template.admin.TemplatesPreview, 'render'])
            .use([middleware.permission({ permissions: ['templates.view'] })])
          router
            .get('/:id/edit', [controllers.template.admin.Templates, 'edit'])
            .use([middleware.permission({ permissions: ['templates.view'] })])
        })
        .prefix('templates')
    })
    .prefix('admin')
    .as('admin')
    .use([middleware.auth({ guards: ['web'] })])
}
