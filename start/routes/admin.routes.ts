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
            router.get('/', [controllers.page.cms.Pages, 'render'])

            router
              .group(() => {
                router.get('/', [controllers.page.cms.PagesCreate, 'render'])
                router.post('/', [controllers.page.cms.PagesCreate, 'execute'])
              })
              .prefix('create')

            router
              .group(() => {
                router.get('/', [controllers.page.cms.PagesShow, 'render'])
                router.get('/edit', [controllers.page.cms.PagesUpdate, 'render'])
                router.post('/edit', [controllers.page.cms.PagesUpdate, 'execute'])
                router.post('/publish', [controllers.page.cms.PagesUpdate, 'publish'])
                router.post('/unpublish', [controllers.page.cms.PagesUpdate, 'unpublish'])
                router.post('/homepage', [controllers.page.cms.Pages, 'setHomepage'])
                router.delete('/', [controllers.page.cms.Pages, 'destroy'])
                router.post('/translations', [controllers.page.cms.PageTranslations, 'execute'])
                router
                  .group(() => {
                    router.get('/', [controllers.page.cms.PageRevisions, 'index'])
                    router.post('/:revisionId/restore', [
                      controllers.page.cms.PageRevisions,
                      'restore',
                    ])
                    router.post('/:revisionId/keep', [
                      controllers.page.cms.PageRevisions,
                      'toggleKeep',
                    ])
                  })
                  .prefix('translations/:translationId/revisions')
              })
              .prefix(':id')

            router.get('/preview/:pageId', [controllers.page.cms.PagesPreview, 'render'])
          })
          .prefix('pages')

        // Templates
        router.get('/templates', [controllers.template.cms.Templates, 'render'])
        router.post('/templates', [controllers.template.cms.Templates, 'execute'])
        router.post('/templates/from-page', [controllers.template.cms.Templates, 'createFromPage'])
        router.post('/templates/:id/apply', [controllers.template.cms.Templates, 'applyToPage'])
        router.put('/templates/:id', [controllers.template.cms.Templates, 'update'])
        router.delete('/templates/:id', [controllers.template.cms.Templates, 'destroy'])

        // Files
        router.get('/files', [controllers.file.cms.Files, 'render'])
        router.post('/files/upload', [controllers.file.cms.Files, 'upload'])
        router.post('/files/:id/move', [controllers.file.cms.Files, 'move'])
        router.delete('/files/:id', [controllers.file.cms.Files, 'destroy'])
        router.post('/files/:id/alts', [controllers.file.cms.Files, 'upsertAlt'])
        router.delete('/files/:id/alts', [controllers.file.cms.Files, 'deleteAlt'])

        // File folders
        router.get('/files/folders', [controllers.file.cms.FileFolders, 'render'])
        router.post('/files/folders', [controllers.file.cms.FileFolders, 'execute'])
        router.put('/files/folders/:id', [controllers.file.cms.FileFolders, 'update'])
        router.delete('/files/folders/:id', [controllers.file.cms.FileFolders, 'destroy'])
      })
    })
    .prefix('admin')
    .as('admin')
    .use([middleware.auth()])
}
