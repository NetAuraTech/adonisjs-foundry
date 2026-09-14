import type { PaginationFilters } from '#types/pagination';

/**
 * Lifecycle of an incoming webhook delivery, from first receipt to the
 * outcome of its queued processing.
 */
export enum WebhookDeliveryStatus {
	RECEIVED = 'received',
	PROCESSED = 'processed',
	FAILED = 'failed',
}

/**
 * Persistence input for a single row of the `webhook_deliveries` table.
 *
 * The full payload is intentionally not stored: only its SHA-256 digest is
 * kept for audit, and the payload itself rides along in the processing job.
 */
export interface CreateWebhookDeliveryInput {
	receiver: string;
	deliveryId: string;
	status: WebhookDeliveryStatus;
	payloadDigest: string;
	contentType?: string | null;
	ip?: string | null;
	userAgent?: string | null;
}

/**
 * A verified inbound webhook request, ready to be recorded and dispatched.
 */
export interface IncomingWebhookInput {
	receiver: string;
	deliveryId: string;
	/** The exact raw request body (used for the digest and the HMAC). */
	rawBody: string;
	/** The parsed JSON payload handed to the processing job. */
	payload: unknown;
	contentType?: string | null;
	ip?: string | null;
	userAgent?: string | null;
}

/**
 * Payload carried by the {@link ProcessWebhookDeliveryJob}.
 *
 * Everything the worker needs to process the delivery without re-deriving it:
 * the delivery's primary key (to update its status), the receiver it belongs
 * to, and the parsed payload the receiver handler consumes.
 */
export interface ProcessWebhookDeliveryPayload {
	deliveryId: number;
	receiver: string;
	payload: unknown;
}

/**
 * Filters accepted by the admin delivery log and by the repository's
 * paginated listing. All filters are optional and combine with AND.
 */
export interface WebhookDeliveryListFilters extends PaginationFilters {
	/** Exact receiver match (e.g. `demo`, `stripe`). */
	receiver?: string;
	/** Exact delivery status match (`received`, `processed`, `failed`). */
	status?: WebhookDeliveryStatus;
	/** Case-insensitive substring match on the delivery id. */
	search?: string;
}
