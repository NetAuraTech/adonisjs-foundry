/*
|--------------------------------------------------------------------------
| Webhook admin routes
|--------------------------------------------------------------------------
|
| Inertia admin surface (session guard) for the inbound webhook delivery log.
| Self-registers on import (see `app/webhook/routes.ts`), gated by the
| `admin` feature flag. Public URL lives under `/admin/webhooks/deliveries`;
| route names carry the `admin.webhook` prefix.
|
*/

import router from '@adonisjs/core/services/router';
import features from '#config/features';
import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import { permissions } from '#start/permissions';
import { maintenanceMiddleware } from '#transport/core/maintenance';

if (features.admin) {
	router
		.group(() => {
			// Deliveries
			router
				.group(() => {
					router
						.get('/', [controllers.webhook.admin.Deliveries, 'render'])
						.use([middleware.permission({ permissions: [permissions.webhooks.view] })]);
				})
				.prefix('deliveries');
		})
		.prefix('admin/webhooks')
		.as('admin.webhook')
		.use([...maintenanceMiddleware, middleware.auth({ guards: ['web'] })]);
}
