import { Identifier } from '#core/domain/identifier';

/**
 * Webhook-domain identifier types.
 *
 * Lucid models use numeric primary keys, so the identifier is a thin branded
 * wrapper around a number on the kernel {@link Identifier} base.
 */

/** Identifier of a {@link WebhookDelivery}. */
export class WebhookDeliveryIdentifier extends Identifier<number> {
	private constructor(value: number) {
		super(value);
	}

	/** Wraps a webhook delivery primary key as a {@link WebhookDeliveryIdentifier}. */
	static of(value: number): WebhookDeliveryIdentifier {
		return new WebhookDeliveryIdentifier(value);
	}
}
