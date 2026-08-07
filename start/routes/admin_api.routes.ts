/*
|--------------------------------------------------------------------------
| Admin API routes
|--------------------------------------------------------------------------
|
| Settings API, file API.
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
