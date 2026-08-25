/*
|--------------------------------------------------------------------------
| Identity routes
|--------------------------------------------------------------------------
|
| Identity domain surface: users, roles, and permissions. The admin Inertia
| UI (session guard) and the versioned REST API (access-token guard) are
| registered here, co-located with the domain. Routes self-register on import
| (see `start/routes.ts`), gated by the `admin` / `adminApi` feature flags.
|
| Public URLs are unchanged from the previous `auth` placement: the admin web
| routes live under `/admin/{users,roles,permissions}` and the API under
| `/api/v1/admin/{users,roles,permissions}`. Route names gain an `identity`
| segment to reflect the domain move (e.g. `admin.identity.users.render` becomes
| `admin.identity.users.render`, and `api.v1.admin.users_api.index` becomes
| `api.v1.admin.identity.users.index`).
|
*/

import features from '#config/features';
import { enabledAuthGuards } from '#config/auth';
import router from '@adonisjs/core/services/router';
import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import { permissions } from '#start/permissions';

/**
 * The admin JSON surface is shared: the in-repo admin UI (session guard) and
 * external API clients (access-token guard) consume the same endpoints.
 * Guards that are disabled in `config/auth.ts` must never reach
 * `authenticateUsing`, hence the conditional list.
 */
const apiGuards = enabledAuthGuards.api ? (['web', 'api'] as const) : (['web'] as const);

/**
 * Feature routes are wrapped with the maintenance middleware (when enabled)
 * before their auth guard, mirroring the previous `start/routes.ts` group.
 */
const maintenanceMiddleware = features.maintenance ? [middleware.maintenance()] : [];

if (features.admin) {
	router
		.group(() => {
			// Users
			router
				.group(() => {
					router
						.get('/', [controllers.identity.admin.Users, 'render'])
						.use([middleware.permission({ permissions: [permissions.users.view] })]);

					router
						.group(() => {
							router.get('/', [controllers.identity.admin.UsersCreate, 'render']);
							router.post('/', [controllers.identity.admin.UsersCreate, 'execute']);
						})
						.prefix('create')
						.use([middleware.permission({ permissions: [permissions.users.create] })]);

					router
						.group(() => {
							router
								.delete('/', [controllers.identity.admin.Users, 'destroy'])
								.use([middleware.permission({ permissions: [permissions.users.delete] })]);
							router
								.get('/', [controllers.identity.admin.UsersShow, 'render'])
								.use([middleware.permission({ permissions: [permissions.users.view] })]);

							router
								.group(() => {
									router.get('/', [controllers.identity.admin.UsersUpdate, 'render']);
									router.post('/', [controllers.identity.admin.UsersUpdate, 'execute']);
								})
								.prefix('edit')
								.use([middleware.permission({ permissions: [permissions.users.update] })]);
						})
						.prefix(':id');
				})
				.prefix('users');

			// Roles
			router
				.group(() => {
					router
						.get('/', [controllers.identity.admin.Roles, 'render'])
						.use([middleware.permission({ permissions: [permissions.roles.view] })]);

					router
						.group(() => {
							router.get('/', [controllers.identity.admin.RolesCreate, 'render']);
							router.post('/', [controllers.identity.admin.RolesCreate, 'execute']);
						})
						.prefix('create')
						.use([middleware.permission({ permissions: [permissions.roles.create] })]);

					router
						.group(() => {
							router
								.delete('/', [controllers.identity.admin.Roles, 'destroy'])
								.use([middleware.permission({ permissions: [permissions.roles.delete] })]);
							router
								.get('/', [controllers.identity.admin.RolesShow, 'render'])
								.use([middleware.permission({ permissions: [permissions.roles.view] })]);

							router
								.group(() => {
									router.get('/', [controllers.identity.admin.RolesUpdate, 'render']);
									router.post('/', [controllers.identity.admin.RolesUpdate, 'execute']);
								})
								.prefix('edit')
								.use([middleware.permission({ permissions: [permissions.roles.update] })]);
						})
						.prefix(':id');
				})
				.prefix('roles');

			// Permissions
			router
				.group(() => {
					router
						.get('/', [controllers.identity.admin.Permissions, 'render'])
						.use([middleware.permission({ permissions: [permissions.permissions.view] })]);

					router
						.group(() => {
							router.get('/', [controllers.identity.admin.PermissionsCreate, 'render']);
							router.post('/', [controllers.identity.admin.PermissionsCreate, 'execute']);
						})
						.prefix('create')
						.use([middleware.permission({ permissions: [permissions.permissions.create] })]);

					router
						.group(() => {
							router
								.delete('/', [controllers.identity.admin.Permissions, 'destroy'])
								.use([middleware.permission({ permissions: [permissions.permissions.delete] })]);

							router
								.group(() => {
									router.get('/', [controllers.identity.admin.PermissionsUpdate, 'render']);
									router.post('/', [controllers.identity.admin.PermissionsUpdate, 'execute']);
								})
								.prefix('edit')
								.use([middleware.permission({ permissions: [permissions.permissions.update] })]);
						})
						.prefix(':id');
				})
				.prefix('permissions');
		})
		.prefix('admin')
		.as('admin.identity')
		.use([
			...maintenanceMiddleware,
			middleware.auth({ guards: ['web'] }),
		]);
}

if (features.adminApi) {
	router
		.group(() => {
			router
				.group(() => {
					// Users
					router
						.group(() => {
							router
								.get('/', [controllers.identity.api.UsersApi, 'index'])
								.as('identity.users.index')
								.use([middleware.permission({ permissions: [permissions.users.view] })]);
							router
								.post('/', [controllers.identity.api.UsersCreateApi, 'store'])
								.as('identity.users.store')
								.use([middleware.permission({ permissions: [permissions.users.create] })]);
							router
								.get('/:id', [controllers.identity.api.UsersShowApi, 'show'])
								.as('identity.users.show')
								.use([middleware.permission({ permissions: [permissions.users.view] })]);
							router
								.put('/:id', [controllers.identity.api.UsersUpdateApi, 'update'])
								.as('identity.users.update')
								.use([middleware.permission({ permissions: [permissions.users.update] })]);
							router
								.delete('/:id', [controllers.identity.api.UsersDeleteApi, 'destroy'])
								.as('identity.users.destroy')
								.use([middleware.permission({ permissions: [permissions.users.delete] })]);
						})
						.prefix('users');

					// Roles
					router
						.group(() => {
							router
								.get('/', [controllers.identity.api.RolesApi, 'index'])
								.as('identity.roles.index')
								.use([middleware.permission({ permissions: [permissions.roles.view] })]);
							router
								.post('/', [controllers.identity.api.RolesCreateApi, 'store'])
								.as('identity.roles.store')
								.use([middleware.permission({ permissions: [permissions.roles.create] })]);
							router
								.get('/:id', [controllers.identity.api.RolesShowApi, 'show'])
								.as('identity.roles.show')
								.use([middleware.permission({ permissions: [permissions.roles.view] })]);
							router
								.put('/:id', [controllers.identity.api.RolesUpdateApi, 'update'])
								.as('identity.roles.update')
								.use([middleware.permission({ permissions: [permissions.roles.update] })]);
							router
								.delete('/:id', [controllers.identity.api.RolesDeleteApi, 'destroy'])
								.as('identity.roles.destroy')
								.use([middleware.permission({ permissions: [permissions.roles.delete] })]);
						})
						.prefix('roles');

					// Permissions
					router
						.get('permissions', [controllers.identity.api.PermissionsApi, 'index'])
						.as('identity.permissions.index')
						.use([middleware.permission({ permissions: [permissions.roles.view] })]);
				})
				.prefix('admin')
				.as('admin')
				.use([...maintenanceMiddleware, middleware.auth({ guards: [...apiGuards] })]);
		})
		.prefix('api/v1')
		.as('api.v1');
}
