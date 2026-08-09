/*
|--------------------------------------------------------------------------
| Admin REST API v1 routes
|--------------------------------------------------------------------------
|
| Versioned admin REST surface under `/api/v1/admin/*`. Each resource is a
| thin controller reusing the existing domain actions, validators, and
| transformers — no business logic is duplicated with the Inertia admin.
|
| Registered only when the `adminApi` feature flag is on and the `api`
| access-token guard is enabled (see `config/auth.ts`).
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import features from '#config/features'
import { enabledAuthGuards } from '#config/auth'

export function registerAdminRestApiRoutes(): void {
  if (!features.adminApi || !enabledAuthGuards.api) return

  router
    .group(() => {
      router
        .group(() => {
          router
            .group(() => {
              router
                .get('/', [controllers.auth.api.UsersApi, 'index'])
                .use([middleware.permission({ permissions: ['users.view'] })])
              router
                .post('/', [controllers.auth.api.UsersCreateApi, 'store'])
                .use([middleware.permission({ permissions: ['users.create'] })])
              router
                .get('/:id', [controllers.auth.api.UsersShowApi, 'show'])
                .use([middleware.permission({ permissions: ['users.view'] })])
              router
                .put('/:id', [controllers.auth.api.UsersUpdateApi, 'update'])
                .use([middleware.permission({ permissions: ['users.update'] })])
              router
                .delete('/:id', [controllers.auth.api.UsersDeleteApi, 'destroy'])
                .use([middleware.permission({ permissions: ['users.delete'] })])
            })
            .prefix('users')

          router
            .group(() => {
              router
                .get('/', [controllers.auth.api.RolesApi, 'index'])
                .use([middleware.permission({ permissions: ['roles.view'] })])
              router
                .post('/', [controllers.auth.api.RolesCreateApi, 'store'])
                .use([middleware.permission({ permissions: ['roles.create'] })])
              router
                .get('/:id', [controllers.auth.api.RolesShowApi, 'show'])
                .use([middleware.permission({ permissions: ['roles.view'] })])
              router
                .put('/:id', [controllers.auth.api.RolesUpdateApi, 'update'])
                .use([middleware.permission({ permissions: ['roles.update'] })])
              router
                .delete('/:id', [controllers.auth.api.RolesDeleteApi, 'destroy'])
                .use([middleware.permission({ permissions: ['roles.delete'] })])
            })
            .prefix('roles')

          router
            .group(() => {
              router
                .get('/', [controllers.page.api.PagesApi, 'index'])
                .use([middleware.permission({ permissions: ['pages.view'] })])
              router
                .post('/', [controllers.page.api.PagesCreateApi, 'store'])
                .use([middleware.permission({ permissions: ['pages.create'] })])
              router
                .get('/:id', [controllers.page.api.PagesShowApi, 'show'])
                .use([middleware.permission({ permissions: ['pages.view'] })])
              router
                .put('/:id', [controllers.page.api.PagesUpdateApi, 'update'])
                .use([middleware.permission({ permissions: ['pages.update'] })])
              router
                .delete('/:id', [controllers.page.api.PagesDeleteApi, 'destroy'])
                .use([middleware.permission({ permissions: ['pages.delete'] })])
              router
                .put('/:id/publish', [controllers.page.api.PagesUpdateApi, 'publish'])
                .use([middleware.permission({ permissions: ['pages.update'] })])
              router
                .put('/:id/unpublish', [controllers.page.api.PagesUpdateApi, 'unpublish'])
                .use([middleware.permission({ permissions: ['pages.update'] })])
              router
                .put('/:id/homepage', [controllers.page.api.PagesApi, 'setHomepage'])
                .use([middleware.permission({ permissions: ['pages.update'] })])
              router
                .post('/:id/translations', [controllers.page.api.PageTranslationsApi, 'store'])
                .use([middleware.permission({ permissions: ['pages.update'] })])
              router
                .group(() => {
                  router
                    .get('/', [controllers.page.api.PageRevisionsApi, 'index'])
                    .use([middleware.permission({ permissions: ['pages.view'] })])
                  router
                    .post('/:revisionId/restore', [
                      controllers.page.api.PageRevisionsApi,
                      'restore',
                    ])
                    .use([middleware.permission({ permissions: ['pages.update'] })])
                  router
                    .put('/:revisionId/pin', [controllers.page.api.PageRevisionsApi, 'toggle'])
                    .use([middleware.permission({ permissions: ['pages.update'] })])
                })
                .prefix('/:id/translations/:translationId/revisions')
            })
            .prefix('pages')

          router
            .group(() => {
              router
                .get('/', [controllers.file.api.FilesApi, 'index'])
                .use([middleware.permission({ permissions: ['files.view'] })])
              router
                .post('/', [controllers.file.api.FilesUploadApi, 'store'])
                .use([middleware.permission({ permissions: ['files.create'] })])
              router
                .get('/:id', [controllers.file.api.FilesShowApi, 'show'])
                .use([middleware.permission({ permissions: ['files.view'] })])
              router
                .put('/:id/move', [controllers.file.api.FilesApi, 'move'])
                .use([middleware.permission({ permissions: ['files.update'] })])
              router
                .delete('/:id', [controllers.file.api.FilesDeleteApi, 'destroy'])
                .use([middleware.permission({ permissions: ['files.delete'] })])
              router
                .put('/:id/alt', [controllers.file.api.FilesAltApi, 'upsertAlt'])
                .use([middleware.permission({ permissions: ['files.update'] })])
              router
                .delete('/:id/alt', [controllers.file.api.FilesAltApi, 'deleteAlt'])
                .use([middleware.permission({ permissions: ['files.update'] })])
            })
            .prefix('files')

          router
            .group(() => {
              router
                .get('/', [controllers.file.api.FoldersApi, 'index'])
                .use([middleware.permission({ permissions: ['folders.view'] })])
              router
                .post('/', [controllers.file.api.FoldersApi, 'store'])
                .use([middleware.permission({ permissions: ['folders.create'] })])
              router
                .get('/:id', [controllers.file.api.FoldersShowApi, 'show'])
                .use([middleware.permission({ permissions: ['folders.view'] })])
              router
                .get('/:id/children', [controllers.file.api.FoldersShowApi, 'children'])
                .use([middleware.permission({ permissions: ['folders.view'] })])
              router
                .put('/:id', [controllers.file.api.FoldersUpdateApi, 'update'])
                .use([middleware.permission({ permissions: ['folders.update'] })])
              router
                .delete('/:id', [controllers.file.api.FoldersDeleteApi, 'destroy'])
                .use([middleware.permission({ permissions: ['folders.delete'] })])
            })
            .prefix('folders')

          router
            .group(() => {
              router
                .get('/', [controllers.template.api.Templates, 'index'])
                .use([middleware.permission({ permissions: ['templates.view'] })])
              router
                .post('/', [controllers.template.api.Templates, 'store'])
                .use([middleware.permission({ permissions: ['templates.create'] })])
              router
                .put('/:id', [controllers.template.api.Templates, 'update'])
                .use([middleware.permission({ permissions: ['templates.update'] })])
              router
                .post('/from-page', [controllers.template.api.Templates, 'createFromPage'])
                .use([middleware.permission({ permissions: ['templates.create'] })])
            })
            .prefix('templates')

          router
            .group(() => {
              router
                .post('/operations', [controllers.page.api.BuilderOperations, 'execute'])
                .use([middleware.permission({ permissions: ['pages.update'] })])
              router
                .get('/presence/:translationId', [
                  controllers.page.api.BuilderOperations,
                  'presence',
                ])
                .use([middleware.permission({ permissions: ['pages.update'] })])
              router
                .post('/draft/:translationId', [
                  controllers.page.api.BuilderOperations,
                  'saveDraft',
                ])
                .use([middleware.permission({ permissions: ['pages.update'] })])
            })
            .prefix('builder')

          router
            .group(() => {
              router.post('theme', [controllers.preferences.api.Theme, 'execute'])
            })
            .prefix('preferences')

          router
            .get('/', [controllers.core.api.DashboardApi, 'index'])
            .prefix('dashboard')
            .use([middleware.permission({ permissions: ['admin.access'] })])

          router
            .group(() => {
              router
                .get('/', [controllers.log.api.LogsApi, 'index'])
                .use([middleware.permission({ permissions: ['logs.view'] })])
            })
            .prefix('logs')

          router
            .group(() => {
              router
                .get('/', [controllers.maintenance.api.MaintenanceApi, 'index'])
                .use([middleware.permission({ permissions: ['settings.maintenance'] })])
              router
                .put('/', [controllers.maintenance.api.MaintenanceApi, 'update'])
                .use([middleware.permission({ permissions: ['settings.maintenance'] })])
              router
                .put('/toggle', [controllers.maintenance.api.MaintenanceApi, 'toggle'])
                .use([middleware.permission({ permissions: ['settings.maintenance'] })])
            })
            .prefix('maintenance')

          router
            .get('permissions', [controllers.auth.api.PermissionsApi, 'index'])
            .use([middleware.permission({ permissions: ['roles.view'] })])
        })
        .prefix('admin')
        .as('admin')
        .use([middleware.auth({ guards: ['api'] })])
    })
    .prefix('api/v1')
    .as('api.v1')
}
