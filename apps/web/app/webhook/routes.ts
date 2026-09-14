/*
|--------------------------------------------------------------------------
| Webhook routes
|--------------------------------------------------------------------------
|
| Webhook domain surface entry — mirrors `start/routes.ts`: each surface
| self-registers on import, co-located with the controllers it binds, and
| gates itself on its feature flag. The admin Inertia surface (session
| guard) and the versioned REST API (access-token guard) live under
| `controllers/`. The public inbound receiver (`POST /webhooks/:receiver`)
| is registered below, outside the maintenance/auth middleware, like the
| health routes.
|
*/

import '#transport/webhook/controllers/admin/routes';
import '#transport/webhook/controllers/api/routes';
import { registerWebhookReceiverRoutes } from '#transport/webhook/webhooks.routes';

// The inbound receiver sits outside the maintenance/auth middleware (external
// senders reach it directly); each receiver authenticates by HMAC signature
// on the route itself.
registerWebhookReceiverRoutes();
