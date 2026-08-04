/*
|--------------------------------------------------------------------------
| Admin CMS routes
|--------------------------------------------------------------------------
|
| Dashboard, users CRUD, pages CRUD, templates, files, file folders.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

export function registerAdminRoutes(): void {
  router
    .group(() => {
      router
        .get('/', [controllers.core.cms.Dashboard, 'render'])
        .use([middleware.permission({ permissions: ['admin.access'] })])

      router
        .group(() => {
          router
            .get('/', [controllers.auth.cms.Users, 'render'])
            .use([middleware.permission({ permissions: ['users.view'] })])

          router
            .group(() => {
              router.get('/', [controllers.auth.cms.UsersCreate, 'render'])
              router.post('/', [controllers.auth.cms.UsersCreate, 'execute'])
            })
            .prefix('create')
            .use([middleware.permission({ permissions: ['users.create'] })])

          router
            .group(() => {
              router
                .delete('/', [controllers.auth.cms.Users, 'destroy'])
                .use([middleware.permission({ permissions: ['users.delete'] })])
              router
                .get('/', [controllers.auth.cms.UsersShow, 'render'])
                .use([middleware.permission({ permissions: ['users.view'] })])

              router
                .group(() => {
                  router.get('/', [controllers.auth.cms.UsersUpdate, 'render'])
                  router.post('/', [controllers.auth.cms.UsersUpdate, 'execute'])
                })
                .prefix('edit')
                .use([middleware.permission({ permissions: ['users.update'] })])
            })
            .prefix(':id')
        })
        .prefix('users')

      router.group(() => {
        // Pages
        router
          .group(() => {
            router
              .get('/', [controllers.page.cms.Pages, 'render'])
              .use([middleware.permission({ permissions: ['pages.view'] })])

            router
              .group(() => {
                router.get('/', [controllers.page.cms.PagesCreate, 'render'])
                router.post('/', [controllers.page.cms.PagesCreate, 'execute'])
              })
              .prefix('create')
              .use([middleware.permission({ permissions: ['pages.create'] })])

            router
              .group(() => {
                router
                  .get('/', [controllers.page.cms.PagesShow, 'render'])
                  .use([middleware.permission({ permissions: ['pages.view'] })])
                router
                  .get('/edit', [controllers.page.cms.PagesUpdate, 'render'])
                  .use([middleware.permission({ permissions: ['pages.update'] })])
                router
                  .post('/edit', [controllers.page.cms.PagesUpdate, 'execute'])
                  .use([middleware.permission({ permissions: ['pages.update'] })])
                router
                  .post('/publish', [controllers.page.cms.PagesUpdate, 'publish'])
                  .use([middleware.permission({ permissions: ['pages.update'] })])
                router
                  .post('/unpublish', [controllers.page.cms.PagesUpdate, 'unpublish'])
                  .use([middleware.permission({ permissions: ['pages.update'] })])
                router
                  .post('/homepage', [controllers.page.cms.Pages, 'setHomepage'])
                  .use([middleware.permission({ permissions: ['pages.update'] })])
                router
                  .delete('/', [controllers.page.cms.Pages, 'destroy'])
                  .use([middleware.permission({ permissions: ['pages.delete'] })])
                router
                  .post('/translations', [controllers.page.cms.PageTranslations, 'execute'])
                  .use([middleware.permission({ permissions: ['pages.update'] })])
                router
                  .group(() => {
                    router
                      .get('/', [controllers.page.cms.PageRevisions, 'index'])
                      .use([middleware.permission({ permissions: ['pages.view'] })])
                    router
                      .post('/:revisionId/restore', [controllers.page.cms.PageRevisions, 'restore'])
                      .use([middleware.permission({ permissions: ['pages.update'] })])
                    router
                      .post('/:revisionId/keep', [controllers.page.cms.PageRevisions, 'toggleKeep'])
                      .use([middleware.permission({ permissions: ['pages.update'] })])
                  })
                  .prefix('translations/:translationId/revisions')
              })
              .prefix(':id')

            router
              .get('/preview/:pageId', [controllers.page.cms.PagesPreview, 'render'])
              .use([middleware.permission({ permissions: ['pages.view'] })])
          })
          .prefix('pages')

        // Templates
        router
          .group(() => {
            router
              .get('/', [controllers.template.cms.Templates, 'render'])
              .use([middleware.permission({ permissions: ['templates.view'] })])
            router
              .post('/', [controllers.template.cms.Templates, 'execute'])
              .use([middleware.permission({ permissions: ['templates.create'] })])
            router
              .post('/:id/apply', [controllers.template.cms.Templates, 'applyToPage'])
              .use([middleware.permission({ permissions: ['templates.update'] })])
            router
              .post('/:id', [controllers.template.cms.Templates, 'update'])
              .use([middleware.permission({ permissions: ['templates.update'] })])
            router
              .delete('/:id', [controllers.template.cms.Templates, 'destroy'])
              .use([middleware.permission({ permissions: ['templates.delete'] })])
            router
              .get('/preview/:id', [controllers.template.cms.TemplatesPreview, 'render'])
              .use([middleware.permission({ permissions: ['templates.view'] })])
            router
              .get('/:id/edit', [controllers.template.cms.Templates, 'edit'])
              .use([middleware.permission({ permissions: ['templates.view'] })])
          })
          .prefix('templates')

        // Files
        router
          .group(() => {
            router
              .get('/', [controllers.file.cms.Files, 'render'])
              .use([middleware.permission({ permissions: ['files.view'] })])
            router
              .post('/upload', [controllers.file.cms.Files, 'upload'])
              .use([middleware.permission({ permissions: ['files.create'] })])
            router
              .post('/:id/move', [controllers.file.cms.Files, 'move'])
              .use([middleware.permission({ permissions: ['files.update'] })])
            router
              .delete('/:id', [controllers.file.cms.Files, 'destroy'])
              .use([middleware.permission({ permissions: ['files.delete'] })])
            router
              .post('/:id/alts', [controllers.file.cms.Files, 'upsertAlt'])
              .use([middleware.permission({ permissions: ['files.update'] })])
            router
              .delete('/:id/alts', [controllers.file.cms.Files, 'deleteAlt'])
              .use([middleware.permission({ permissions: ['files.update'] })])
          })
          .prefix('files')

        // File folders
        router
          .group(() => {
            router
              .get('/', [controllers.file.cms.FileFolders, 'render'])
              .use([middleware.permission({ permissions: ['folders.view'] })])
            router
              .post('/', [controllers.file.cms.FileFolders, 'execute'])
              .use([middleware.permission({ permissions: ['folders.create'] })])
            router
              .put('/:id', [controllers.file.cms.FileFolders, 'update'])
              .use([middleware.permission({ permissions: ['folders.update'] })])
            router
              .delete('/:id', [controllers.file.cms.FileFolders, 'destroy'])
              .use([middleware.permission({ permissions: ['folders.delete'] })])
          })
          .prefix('files/folders')

        // Settings - Maintenance
        router
          .group(() => {
            router
              .group(() => {
                router
                  .get('/maintenance', [controllers.maintenance.cms.Maintenance, 'render'])
                  .as('maintenance.render')
                router
                  .post('/maintenance', [controllers.maintenance.cms.Maintenance, 'update'])
                  .as('maintenance.update')
                router
                  .post('/maintenance/toggle', [controllers.maintenance.cms.Maintenance, 'toggle'])
                  .as('maintenance.toggle')
              })
              .prefix('settings')
              .as('settings')
              .use([middleware.permission({ permissions: ['settings.maintenance'] })])
          })
          .use([middleware.auth()])
      })
    })
    .prefix('admin')
    .as('admin')
    .use([middleware.auth()])
}
