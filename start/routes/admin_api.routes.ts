/*
|--------------------------------------------------------------------------
| Admin API routes
|--------------------------------------------------------------------------
|
| Settings API, builder operations, preview token, file API.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

export function registerAdminApiRoutes(): void {
  router
    .group(() => {
      router
        .group(() => {
          router
            .group(() => {
              router.post('theme', [controllers.preferences.api.Theme, 'execute'])
            })
            .prefix('preferences')
        })
        .prefix('settings')
        .use([middleware.auth()])

      router
        .group(() => {
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
              router
                .group(() => {
                  router
                    .get('/token', [controllers.page.admin.PagesPreview, 'token'])
                    .use([middleware.permission({ permissions: ['pages.update'] })])
                })
                .prefix('preview')
            })
            .prefix('page')
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
              router
                .get('/preview/token', [controllers.template.admin.TemplatesPreview, 'token'])
                .use([middleware.permission({ permissions: ['templates.view'] })])
            })
            .prefix('templates')
          router
            .group(() => {
              router
                .get('/', [controllers.file.api.File, 'list'])
                .use([middleware.permission({ permissions: ['files.view'] })])
              router
                .get('/:id', [controllers.file.api.File, 'find'])
                .use([middleware.permission({ permissions: ['files.view'] })])
              router
                .post('/upload', [controllers.file.api.File, 'upload'])
                .use([middleware.permission({ permissions: ['files.create'] })])
            })
            .prefix('files')
        })
        .prefix('admin')
        .as('admin')
        .use([middleware.auth()])
    })
    .prefix('api')
    .as('api')
}
