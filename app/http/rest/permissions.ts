import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import { ListAllPermissionsAction } from '#actions/permission/list_all_permissions_action'
import PermissionTransformer from '#transformers/permission_transformer'
import { type RestEndpoint, type AnyRestEndpoint, handleRest } from '#rest/rest_resource'

type PermissionListResult = Awaited<ReturnType<ListAllPermissionsAction['execute']>>

/**
 * Endpoint declarations for the permissions REST resource (read-only).
 */
export interface PermissionsEndpoints {
  index: RestEndpoint<undefined, unknown, PermissionListResult, PermissionListResult>
}

/**
 * Declarative permissions REST resource.
 *
 * Owns the read-only permissions endpoint declarations executed by the shared
 * {@link handleRest} pipeline; the `/api/v1/admin/permissions` controller
 * reduces to a one-line adapter over `handle()`.
 */
@inject()
export default class PermissionsResource {
  constructor(protected listAllPermissionsAction: ListAllPermissionsAction) {}

  readonly endpoints: PermissionsEndpoints = {
    index: {
      execute: () => this.listAllPermissionsAction.execute(),
      transform: (entity) => PermissionTransformer.transform(entity),
    },
  }

  /**
   * Dispatch a REST action to its declared endpoint.
   */
  async handle(route: keyof PermissionsEndpoints, ctx: HttpContext): Promise<void> {
    const endpoint = this.endpoints[route] as AnyRestEndpoint

    await handleRest(ctx, endpoint)
  }
}
