/*
|--------------------------------------------------------------------------
| Admin routes
|--------------------------------------------------------------------------
|
| Dashboard, users CRUD, files, file folders.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { permissions } from '#start/permissions'
import { controllers } from '#generated/controllers'

export function registerAdminRoutes(): void {
  router
    .group(() => {
      router
        .get('/', [controllers.core.admin.Dashboard, 'render'])
        .use([middleware.permission({ permissions: [permissions.adminAccess] })])

      router
        .group(() => {
          router
            .get('/', [controllers.auth.admin.Users, 'render'])
            .use([middleware.permission({ permissions: [permissions.usersView] })])

          router
            .group(() => {
              router.get('/', [controllers.auth.admin.UsersCreate, 'render'])
              router.post('/', [controllers.auth.admin.UsersCreate, 'execute'])
            })
            .prefix('create')
            .use([middleware.permission({ permissions: [permissions.usersCreate] })])

          router
            .group(() => {
              router
                .delete('/', [controllers.auth.admin.Users, 'destroy'])
                .use([middleware.permission({ permissions: [permissions.usersDelete] })])
              router
                .get('/', [controllers.auth.admin.UsersShow, 'render'])
                .use([middleware.permission({ permissions: [permissions.usersView] })])

              router
                .group(() => {
                  router.get('/', [controllers.auth.admin.UsersUpdate, 'render'])
                  router.post('/', [controllers.auth.admin.UsersUpdate, 'execute'])
                })
                .prefix('edit')
                .use([middleware.permission({ permissions: [permissions.usersUpdate] })])
            })
            .prefix(':id')
        })
        .prefix('users')

      router
        .group(() => {
          router
            .get('/', [controllers.auth.admin.Roles, 'render'])
            .use([middleware.permission({ permissions: [permissions.rolesView] })])

          router
            .group(() => {
              router.get('/', [controllers.auth.admin.RolesCreate, 'render'])
              router.post('/', [controllers.auth.admin.RolesCreate, 'execute'])
            })
            .prefix('create')
            .use([middleware.permission({ permissions: [permissions.rolesCreate] })])

          router
            .group(() => {
              router
                .delete('/', [controllers.auth.admin.Roles, 'destroy'])
                .use([middleware.permission({ permissions: [permissions.rolesDelete] })])
              router
                .get('/', [controllers.auth.admin.RolesShow, 'render'])
                .use([middleware.permission({ permissions: [permissions.rolesView] })])

              router
                .group(() => {
                  router.get('/', [controllers.auth.admin.RolesUpdate, 'render'])
                  router.post('/', [controllers.auth.admin.RolesUpdate, 'execute'])
                })
                .prefix('edit')
                .use([middleware.permission({ permissions: [permissions.rolesUpdate] })])
            })
            .prefix(':id')
        })
        .prefix('roles')

      router
        .group(() => {
          router
            .get('/', [controllers.auth.admin.Permissions, 'render'])
            .use([middleware.permission({ permissions: [permissions.permissionsView] })])

          router
            .group(() => {
              router.get('/', [controllers.auth.admin.PermissionsCreate, 'render'])
              router.post('/', [controllers.auth.admin.PermissionsCreate, 'execute'])
            })
            .prefix('create')
            .use([middleware.permission({ permissions: [permissions.permissionsCreate] })])

          router
            .group(() => {
              router
                .delete('/', [controllers.auth.admin.Permissions, 'destroy'])
                .use([middleware.permission({ permissions: [permissions.permissionsDelete] })])

              router
                .group(() => {
                  router.get('/', [controllers.auth.admin.PermissionsUpdate, 'render'])
                  router.post('/', [controllers.auth.admin.PermissionsUpdate, 'execute'])
                })
                .prefix('edit')
                .use([middleware.permission({ permissions: [permissions.permissionsUpdate] })])
            })
            .prefix(':id')
        })
        .prefix('permissions')

      router.group(() => {
        // Files
        router
          .group(() => {
            router
              .get('/', [controllers.file.admin.Files, 'render'])
              .use([middleware.permission({ permissions: [permissions.filesView] })])
            router
              .post('/upload', [controllers.file.admin.Files, 'upload'])
              .use([middleware.permission({ permissions: [permissions.filesCreate] })])
            router
              .post('/:id/move', [controllers.file.admin.Files, 'move'])
              .use([middleware.permission({ permissions: [permissions.filesUpdate] })])
            router
              .delete('/:id', [controllers.file.admin.Files, 'destroy'])
              .use([middleware.permission({ permissions: [permissions.filesDelete] })])
            router
              .post('/:id/alts', [controllers.file.admin.Files, 'upsertAlt'])
              .use([middleware.permission({ permissions: [permissions.filesUpdate] })])
            router
              .delete('/:id/alts', [controllers.file.admin.Files, 'deleteAlt'])
              .use([middleware.permission({ permissions: [permissions.filesUpdate] })])
          })
          .prefix('files')

        // File folders
        router
          .group(() => {
            router
              .get('/', [controllers.file.admin.FileFolders, 'render'])
              .use([middleware.permission({ permissions: [permissions.foldersView] })])
            router
              .post('/', [controllers.file.admin.FileFolders, 'execute'])
              .use([middleware.permission({ permissions: [permissions.foldersCreate] })])
            router
              .put('/:id', [controllers.file.admin.FileFolders, 'update'])
              .use([middleware.permission({ permissions: [permissions.foldersUpdate] })])
            router
              .delete('/:id', [controllers.file.admin.FileFolders, 'destroy'])
              .use([middleware.permission({ permissions: [permissions.foldersDelete] })])
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
              .use([middleware.permission({ permissions: [permissions.settingsMaintenance] })])
          })
          .use([middleware.auth({ guards: ['web'] })])

        // Logs
        router
          .group(() => {
            router
              .get('/', [controllers.log.admin.Logs, 'render'])
              .as('logs.render')
              .use([middleware.permission({ permissions: [permissions.logsView] })])
          })
          .prefix('logs')
          .use([middleware.auth({ guards: ['web'] })])
      })
    })
    .prefix('admin')
    .as('admin')
    .use([middleware.auth({ guards: ['web'] })])
}
