import { inject } from '@adonisjs/core';
import { ListLogEntriesAction } from '#actions/log/list_log_entries_action';
import LogEntryTransformer from '#app/log/transformers/log_entry_transformer';
import { type RestEndpoint } from '#rest/rest_adapter';
import { listLogsValidator } from '#validators/log';
import type { Infer } from '@vinejs/vine/types';

type LogListPagination = Awaited<ReturnType<ListLogEntriesAction['execute']>>;
type LogListPayload = Infer<typeof listLogsValidator>;

/**
 * Endpoint declarations for the logs REST resource (read-only).
 */
export interface LogsEndpoints {
	index: RestEndpoint<undefined, LogListPayload, LogListPagination, LogListPagination>;
}

/**
 * Declarative logs REST resource.
 *
 * Owns the read-only logs endpoint declarations consumed by the REST
 * `handle` adapter (`#rest/rest_adapter`); the `/api/v1/admin/logs`
 * controller reduces to a one-line dispatch over `endpoints`.
 */
@inject()
export default class LogsResource {
	constructor(protected listLogEntriesAction: ListLogEntriesAction) {}

	readonly endpoints: LogsEndpoints = {
		index: {
			paginated: true,
			strip: true,
			validator: () => listLogsValidator,
			execute: (context, _prepared, payload) =>
				this.listLogEntriesAction.execute({ ...payload, ...context.pagination! }),
			transform: (entity) => LogEntryTransformer.paginate(entity.all(), entity.getMeta()),
		},
	};
}
