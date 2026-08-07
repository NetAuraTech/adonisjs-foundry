/*
|--------------------------------------------------------------------------
| Admin routes
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
        .get('/', [controllers.core.admin.Dashboard, 'render'])
        .use([middleware.permission({ permissions: ['admin.access'] })])

      router
        .group(() => {
          router
            .get('/', [controllers.auth.admin.Users, 'render'])
            .use([middleware.permission({ permissions: ['users.view'] })])

          router
            .group(() => {
              router.get('/', [controllers.auth.admin.UsersCreate, 'render'])
              router.post('/', [controllers.auth.admin.UsersCreate, 'execute'])
            })
            .prefix('create')
            .use([middleware.permission({ permissions: ['users.create'] })])

          router
            .group(() => {
              router
                .delete('/', [controllers.auth.admin.Users, 'destroy'])
                .use([middleware.permission({ permissions: ['users.delete'] })])
              router
                .get('/', [controllers.auth.admin.UsersShow, 'render'])
                .use([middleware.permission({ permissions: ['users.view'] })])

              router
                .group(() => {
                  router.get('/', [controllers.auth.admin.UsersUpdate, 'render'])
                  router.post('/', [controllers.auth.admin.UsersUpdate, 'execute'])
                })
                .prefix('edit')
                .use([middleware.permission({ permissions: ['users.update'] })])
            })
            .prefix(':id')
        })
        .prefix('users')

      router
        .group(() => {
          router
            .get('/', [controllers.auth.admin.Roles, 'render'])
            .use([middleware.permission({ permissions: ['roles.view'] })])

          router
            .group(() => {
              router.get('/', [controllers.auth.admin.RolesCreate, 'render'])
              router.post('/', [controllers.auth.admin.RolesCreate, 'execute'])
            })
            .prefix('create')
            .use([middleware.permission({ permissions: ['roles.create'] })])

          router
            .group(() => {
              router
                .delete('/', [controllers.auth.admin.Roles, 'destroy'])
                .use([middleware.permission({ permissions: ['roles.delete'] })])
              router
                .get('/', [controllers.auth.admin.RolesShow, 'render'])
                .use([middleware.permission({ permissions: ['roles.view'] })])

              router
                .group(() => {
                  router.get('/', [controllers.auth.admin.RolesUpdate, 'render'])
                  router.post('/', [controllers.auth.admin.RolesUpdate, 'execute'])
                })
                .prefix('edit')
                .use([middleware.permission({ permissions: ['roles.update'] })])
            })
            .prefix(':id')
        })
        .prefix('roles')

      router
        .group(() => {
          router
            .get('/', [controllers.auth.admin.Permissions, 'render'])
            .use([middleware.permission({ permissions: ['permissions.view'] })])

          router
            .group(() => {
              router.get('/', [controllers.auth.admin.PermissionsCreate, 'render'])
              router.post('/', [controllers.auth.admin.PermissionsCreate, 'execute'])
            })
            .prefix('create')
            .use([middleware.permission({ permissions: ['permissions.create'] })])

          router
            .group(() => {
              router
                .delete('/', [controllers.auth.admin.Permissions, 'destroy'])
                .use([middleware.permission({ permissions: ['permissions.delete'] })])

              router
                .group(() => {
                  router.get('/', [controllers.auth.admin.PermissionsUpdate, 'render'])
                  router.post('/', [controllers.auth.admin.PermissionsUpdate, 'execute'])
                })
                .prefix('edit')
                .use([middleware.permission({ permissions: ['permissions.update'] })])
            })
            .prefix(':id')
        })
        .prefix('permissions')

      router.group(() => {
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
                      .post('/:revisionId/restore', [
                        controllers.page.admin.PageRevisions,
                        'restore',
                      ])
                      .use([middleware.permission({ permissions: ['pages.update'] })])
                    router
                      .post('/:revisionId/keep', [
                        controllers.page.admin.PageRevisions,
                        'toggleKeep',
                      ])
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

        // Files
        router
          .group(() => {
            router
              .get('/', [controllers.file.admin.Files, 'render'])
              .use([middleware.permission({ permissions: ['files.view'] })])
            router
              .post('/upload', [controllers.file.admin.Files, 'upload'])
              .use([middleware.permission({ permissions: ['files.create'] })])
            router
              .post('/:id/move', [controllers.file.admin.Files, 'move'])
              .use([middleware.permission({ permissions: ['files.update'] })])
            router
              .delete('/:id', [controllers.file.admin.Files, 'destroy'])
              .use([middleware.permission({ permissions: ['files.delete'] })])
            router
              .post('/:id/alts', [controllers.file.admin.Files, 'upsertAlt'])
              .use([middleware.permission({ permissions: ['files.update'] })])
            router
              .delete('/:id/alts', [controllers.file.admin.Files, 'deleteAlt'])
              .use([middleware.permission({ permissions: ['files.update'] })])
          })
          .prefix('files')

        // File folders
        router
          .group(() => {
            router
              .get('/', [controllers.file.admin.FileFolders, 'render'])
              .use([middleware.permission({ permissions: ['folders.view'] })])
            router
              .post('/', [controllers.file.admin.FileFolders, 'execute'])
              .use([middleware.permission({ permissions: ['folders.create'] })])
            router
              .put('/:id', [controllers.file.admin.FileFolders, 'update'])
              .use([middleware.permission({ permissions: ['folders.update'] })])
            router
              .delete('/:id', [controllers.file.admin.FileFolders, 'destroy'])
              .use([middleware.permission({ permissions: ['folders.delete'] })])
          })
          .prefix('files/folders')

        // Settings - Maintenance
        router
          .group(() => {
            router
              .group(() => {
                router
                  .get('/maintenance', [controllers.maintenance.admin.Maintenance, 'render'])
                  .as('maintenance.render')
                router
                  .post('/maintenance', [controllers.maintenance.admin.Maintenance, 'update'])
                  .as('maintenance.update')
                router
                  .post('/maintenance/toggle', [
                    controllers.maintenance.admin.Maintenance,
                    'toggle',
                  ])
                  .as('maintenance.toggle')
              })
              .prefix('settings')
              .as('settings')
              .use([middleware.permission({ permissions: ['settings.maintenance'] })])
          })
          .use([middleware.auth()])

        // Logs
        router
          .group(() => {
            router
              .get('/', [controllers.log.admin.Logs, 'render'])
              .as('logs.render')
              .use([middleware.permission({ permissions: ['logs.view'] })])
          })
          .prefix('logs')
          .use([middleware.auth()])
      })
    })
    .prefix('admin')
    .as('admin')
    .use([middleware.auth()])
}
