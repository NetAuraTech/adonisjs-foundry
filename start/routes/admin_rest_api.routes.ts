/*
|--------------------------------------------------------------------------
| Admin REST API v1 routes
|--------------------------------------------------------------------------
|
| Versioned admin REST surface under `/api/v1/admin/*`. Each resource is a
| thin controller reusing the existing domain actions, validators, and
| transformers — no business logic is duplicated with the Inertia admin.
|
| The CMS resources (`/api/v1/admin/pages`, `/templates`, `/builder`) are
| registered separately from `start/routes/cms_rest_api.routes.ts` behind the
| `cms` feature flag, so flavors that prune the page/template domain can
| delete that module (and never reference CMS controllers here).
|
| Registered only when the `adminApi` feature flag is on and the `api`
| access-token guard is enabled (see `config/auth.ts`).
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { permissions } from '#start/permissions'
import { controllers } from '#generated/controllers'
import features from '#config/features'
import { enabledAuthGuards } from '#config/auth'

/**
 * The admin JSON surface is shared: the in-repo admin UI (session guard) and
 * external API clients (access-token guard) consume the same endpoints.
 * Guards that are disabled in `config/auth.ts` must never reach
 * `authenticateUsing`, hence the conditional list.
 */
const apiGuards = enabledAuthGuards.api ? (['web', 'api'] as const) : (['web'] as const)

/**
 * Whether the admin JSON surface is exposed at all, driven by the `adminApi`
 * feature flag (the session-based admin UI and external API clients both
 * consume these endpoints, so the `api` guard is not required).
 */
export function adminRestApiEnabled(featuresList: { adminApi: boolean }): boolean {
  return featuresList.adminApi
}

export function registerAdminRestApiRoutes(): void {
  if (!adminRestApiEnabled(features)) return

  router
    .group(() => {
      router
        .group(() => {
          router
            .group(() => {
              router
                .get('/', [controllers.auth.api.UsersApi, 'index'])
                .use([middleware.permission({ permissions: [permissions.usersView] })])
              router
                .post('/', [controllers.auth.api.UsersCreateApi, 'store'])
                .use([middleware.permission({ permissions: [permissions.usersCreate] })])
              router
                .get('/:id', [controllers.auth.api.UsersShowApi, 'show'])
                .use([middleware.permission({ permissions: [permissions.usersView] })])
              router
                .put('/:id', [controllers.auth.api.UsersUpdateApi, 'update'])
                .use([middleware.permission({ permissions: [permissions.usersUpdate] })])
              router
                .delete('/:id', [controllers.auth.api.UsersDeleteApi, 'destroy'])
                .use([middleware.permission({ permissions: [permissions.usersDelete] })])
            })
            .prefix('users')

          router
            .group(() => {
              router
                .get('/', [controllers.auth.api.RolesApi, 'index'])
                .use([middleware.permission({ permissions: [permissions.rolesView] })])
              router
                .post('/', [controllers.auth.api.RolesCreateApi, 'store'])
                .use([middleware.permission({ permissions: [permissions.rolesCreate] })])
              router
                .get('/:id', [controllers.auth.api.RolesShowApi, 'show'])
                .use([middleware.permission({ permissions: [permissions.rolesView] })])
              router
                .put('/:id', [controllers.auth.api.RolesUpdateApi, 'update'])
                .use([middleware.permission({ permissions: [permissions.rolesUpdate] })])
              router
                .delete('/:id', [controllers.auth.api.RolesDeleteApi, 'destroy'])
                .use([middleware.permission({ permissions: [permissions.rolesDelete] })])
            })
            .prefix('roles')

          router
            .group(() => {
              router
                .get('/', [controllers.file.api.FilesApi, 'index'])
                .use([middleware.permission({ permissions: [permissions.filesView] })])
              router
                .post('/', [controllers.file.api.FilesUploadApi, 'store'])
                .use([middleware.permission({ permissions: [permissions.filesCreate] })])
              router
                .get('/:id', [controllers.file.api.FilesShowApi, 'show'])
                .use([middleware.permission({ permissions: [permissions.filesView] })])
              router
                .put('/:id/move', [controllers.file.api.FilesApi, 'move'])
                .use([middleware.permission({ permissions: [permissions.filesUpdate] })])
              router
                .delete('/:id', [controllers.file.api.FilesDeleteApi, 'destroy'])
                .use([middleware.permission({ permissions: [permissions.filesDelete] })])
              router
                .put('/:id/alt', [controllers.file.api.FilesAltApi, 'upsertAlt'])
                .use([middleware.permission({ permissions: [permissions.filesUpdate] })])
              router
                .delete('/:id/alt', [controllers.file.api.FilesAltApi, 'deleteAlt'])
                .use([middleware.permission({ permissions: [permissions.filesUpdate] })])
            })
            .prefix('files')

          router
            .group(() => {
              router
                .get('/', [controllers.file.api.FoldersApi, 'index'])
                .use([middleware.permission({ permissions: [permissions.foldersView] })])
              router
                .post('/', [controllers.file.api.FoldersApi, 'store'])
                .use([middleware.permission({ permissions: [permissions.foldersCreate] })])
              router
                .get('/:id', [controllers.file.api.FoldersShowApi, 'show'])
                .use([middleware.permission({ permissions: [permissions.foldersView] })])
              router
                .get('/:id/children', [controllers.file.api.FoldersShowApi, 'children'])
                .use([middleware.permission({ permissions: [permissions.foldersView] })])
              router
                .put('/:id', [controllers.file.api.FoldersUpdateApi, 'update'])
                .use([middleware.permission({ permissions: [permissions.foldersUpdate] })])
              router
                .delete('/:id', [controllers.file.api.FoldersDeleteApi, 'destroy'])
                .use([middleware.permission({ permissions: [permissions.foldersDelete] })])
            })
            .prefix('folders')

          router
            .group(() => {
              router.post('theme', [controllers.preferences.api.Theme, 'execute'])
            })
            .prefix('preferences')

          router
            .get('/', [controllers.core.api.DashboardApi, 'index'])
            .prefix('dashboard')
            .use([middleware.permission({ permissions: [permissions.adminAccess] })])

          router
            .group(() => {
              router
                .get('/', [controllers.log.api.LogsApi, 'index'])
                .use([middleware.permission({ permissions: [permissions.logsView] })])
            })
            .prefix('logs')

          router
            .group(() => {
              router
                .get('/', [controllers.maintenance.api.MaintenanceApi, 'index'])
                .use([middleware.permission({ permissions: [permissions.settingsMaintenance] })])
              router
                .put('/', [controllers.maintenance.api.MaintenanceApi, 'update'])
                .use([middleware.permission({ permissions: [permissions.settingsMaintenance] })])
              router
                .put('/toggle', [controllers.maintenance.api.MaintenanceApi, 'toggle'])
                .use([middleware.permission({ permissions: [permissions.settingsMaintenance] })])
            })
            .prefix('maintenance')

          router
            .get('permissions', [controllers.auth.api.PermissionsApi, 'index'])
            .use([middleware.permission({ permissions: [permissions.rolesView] })])
        })
        .prefix('admin')
        .as('admin')
        .use([middleware.auth({ guards: [...apiGuards] })])
    })
    .prefix('api/v1')
    .as('api.v1')
}
