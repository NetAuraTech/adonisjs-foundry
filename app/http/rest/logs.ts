import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import type { Infer } from '@vinejs/vine/types'
import { ListLogEntriesAction } from '#actions/log/list_log_entries_action'
import { listLogsValidator } from '#validators/log'
import LogEntryTransformer from '#transformers/log_entry_transformer'
import { type RestEndpoint, type AnyRestEndpoint, handleRest } from '#rest/rest_resource'

type LogListPagination = Awaited<ReturnType<ListLogEntriesAction['execute']>>
type LogListPayload = Infer<typeof listLogsValidator>

/**
 * Endpoint declarations for the logs REST resource (read-only).
 */
export interface LogsEndpoints {
  index: RestEndpoint<undefined, LogListPayload, LogListPagination, LogListPagination>
}

/**
 * Declarative logs REST resource.
 *
 * Owns the read-only logs endpoint declarations executed by the shared
 * {@link handleRest} pipeline; the `/api/v1/admin/logs` controller reduces to
 * a one-line adapter over `handle()`.
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
  }

  /**
   * Dispatch a REST action to its declared endpoint.
   */
  async handle(route: keyof LogsEndpoints, ctx: HttpContext): Promise<void> {
    const endpoint = this.endpoints[route] as AnyRestEndpoint

    await handleRest(ctx, endpoint)
  }
}
