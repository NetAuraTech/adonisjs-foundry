/*
|--------------------------------------------------------------------------
| Webhook receiver routes
|--------------------------------------------------------------------------
|
| Public inbound-webhook surface: `POST /webhooks/:receiver`. Registered
| outside the maintenance/auth middleware (like the health routes) so external
| senders reach it directly; each receiver is authenticated by its HMAC
| signature via the {@link WebhookSignatureMiddleware} applied on the route.
|
| Route registration convention: one route per receiver under the `/webhooks`
| prefix, named, applying the signature middleware and pointing at
| {@link WebhookReceiverController}. Adding a receiver is a single route line.
|
*/

import router from '@adonisjs/core/services/router';
import { controllers } from '#generated/controllers';

/**
 * The signature verifier, registered as a named middleware locally — in this
 * webhook transport file rather than in `start/kernel.ts` — so a flavor
 * without the webhook domain (which deletes `app/webhook` entirely) never
 * carries a reference to it. `router.named()` writes to the same registry the
 * kernel uses, so DI (the verifier's `LogService`) resolves as usual.
 */
const webhookSignature = router.named({
	webhookSignature: () => import('#transport/webhook/middleware/webhook_signature_middleware'),
});

export function registerWebhookReceiverRoutes() {
	router
		.post('/webhooks/:receiver', [controllers.webhook.WebhookReceiver, 'receive'])
		.use([webhookSignature.webhookSignature()])
		.as('webhook.receivers.receive');
}
