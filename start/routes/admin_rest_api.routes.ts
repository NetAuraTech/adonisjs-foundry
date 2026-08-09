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
