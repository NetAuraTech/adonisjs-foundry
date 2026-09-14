import { inject } from '@adonisjs/core';
import { extractPagination } from '#transport/core/helpers/extract_pagination';
import { I18nService } from '#transport/core/helpers/i18n_service';
import { renderInertiaPage } from '#transport/core/helpers/inertia_render';
import { stripEmptyStrings } from '#transport/core/helpers/strip_empty_strings';
import { buildWebhookDeliveriesListPayload } from '#transport/webhook/helpers/i18n_payloads/deliveries_list';
import WebhookDeliveryTransformer from '#transport/webhook/transformers/webhook_delivery_transformer';
import { listWebhookDeliveriesValidator } from '#transport/webhook/validators/webhook';
import { ListWebhookDeliveriesAction } from '#webhook/actions/webhook/list_webhook_deliveries_action';
import type { HttpContext } from '@adonisjs/core/http';

/**
 * Webhook deliveries controller for the admin UI.
 * Renders the paginated, filterable inbound webhook delivery log.
 */
@inject()
export default class DeliveriesController {
	constructor(
		protected i18n: I18nService,
		protected listWebhookDeliveriesAction: ListWebhookDeliveriesAction,
	) {}

	/**
	 * Render the deliveries list page (Inertia).
	 */
	async render(ctx: HttpContext) {
		const { inertia, request } = ctx;

		const pagination = await extractPagination(request);
		const data = stripEmptyStrings(request.all());
		const payload = await listWebhookDeliveriesValidator.validate(data);

		const deliveries = await this.listWebhookDeliveriesAction.execute({
			...payload,
			...pagination,
		});

		return renderInertiaPage(inertia, 'webhook/admin/index', {
			deliveries: WebhookDeliveryTransformer.paginate(deliveries.all(), deliveries.getMeta()),
			filters: payload,
			translations: buildWebhookDeliveriesListPayload(this.i18n),
		});
	}
}
