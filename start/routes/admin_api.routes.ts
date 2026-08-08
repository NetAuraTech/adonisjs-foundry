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
import { enabledAuthGuards } from '#config/auth'

/**
 * The JSON API accepts the session guard (browser) and, when enabled, the
 * access-token guard (mobile apps, scripts). Guards that are disabled in
 * `config/auth.ts` must never reach `authenticateUsing`, hence the
 * conditional list.
 */
const apiGuards = enabledAuthGuards.api ? (['web', 'api'] as const) : (['web'] as const)

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
        .use([middleware.auth({ guards: [...apiGuards] })])

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
        .use([middleware.auth({ guards: [...apiGuards] })])
    })
    .prefix('api')
    .as('api')
}
