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
import { permissions } from '#start/permissions'
import { controllers } from '#generated/controllers'

export function registerCmsAdminRoutes(): void {
  router
    .group(() => {
      // Pages
      router
        .group(() => {
          router
            .get('/', [controllers.page.admin.Pages, 'render'])
            .use([middleware.permission({ permissions: [permissions.pagesView] })])

          router
            .group(() => {
              router.get('/', [controllers.page.admin.PagesCreate, 'render'])
              router.post('/', [controllers.page.admin.PagesCreate, 'execute'])
            })
            .prefix('create')
            .use([middleware.permission({ permissions: [permissions.pagesCreate] })])

          router
            .group(() => {
              router
                .get('/', [controllers.page.admin.PagesShow, 'render'])
                .use([middleware.permission({ permissions: [permissions.pagesView] })])
              router
                .get('/edit', [controllers.page.admin.PagesUpdate, 'render'])
                .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
              router
                .post('/edit', [controllers.page.admin.PagesUpdate, 'execute'])
                .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
              router
                .post('/publish', [controllers.page.admin.PagesUpdate, 'publish'])
                .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
              router
                .post('/unpublish', [controllers.page.admin.PagesUpdate, 'unpublish'])
                .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
              router
                .post('/homepage', [controllers.page.admin.Pages, 'setHomepage'])
                .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
              router
                .delete('/', [controllers.page.admin.Pages, 'destroy'])
                .use([middleware.permission({ permissions: [permissions.pagesDelete] })])
              router
                .post('/translations', [controllers.page.admin.PageTranslations, 'execute'])
                .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
              router
                .group(() => {
                  router
                    .get('/', [controllers.page.admin.PageRevisions, 'index'])
                    .use([middleware.permission({ permissions: [permissions.pagesView] })])
                  router
                    .post('/:revisionId/restore', [controllers.page.admin.PageRevisions, 'restore'])
                    .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
                  router
                    .post('/:revisionId/keep', [controllers.page.admin.PageRevisions, 'toggleKeep'])
                    .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
                })
                .prefix('translations/:translationId/revisions')
            })
            .prefix(':id')

          router
            .get('/preview/:pageId', [controllers.page.admin.PagesPreview, 'render'])
            .use([middleware.permission({ permissions: [permissions.pagesView] })])
        })
        .prefix('pages')

      // Templates
      router
        .group(() => {
          router
            .get('/', [controllers.template.admin.Templates, 'render'])
            .use([middleware.permission({ permissions: [permissions.templatesView] })])
          router
            .post('/', [controllers.template.admin.Templates, 'execute'])
            .use([middleware.permission({ permissions: [permissions.templatesCreate] })])
          router
            .post('/:id/apply', [controllers.template.admin.Templates, 'applyToPage'])
            .use([middleware.permission({ permissions: [permissions.templatesUpdate] })])
          router
            .post('/:id', [controllers.template.admin.Templates, 'update'])
            .use([middleware.permission({ permissions: [permissions.templatesUpdate] })])
          router
            .delete('/:id', [controllers.template.admin.Templates, 'destroy'])
            .use([middleware.permission({ permissions: [permissions.templatesDelete] })])
          router
            .get('/preview/:id', [controllers.template.admin.TemplatesPreview, 'render'])
            .use([middleware.permission({ permissions: [permissions.templatesView] })])
          router
            .get('/:id/edit', [controllers.template.admin.Templates, 'edit'])
            .use([middleware.permission({ permissions: [permissions.templatesView] })])
        })
        .prefix('templates')
    })
    .prefix('admin')
    .as('admin')
    .use([middleware.auth({ guards: ['web'] })])
}
