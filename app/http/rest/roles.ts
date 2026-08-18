import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import type { Infer } from '@vinejs/vine/types'
import type Role from '#models/auth/role'
import { ListRolesAction } from '#actions/role/list_roles_action'
import { GetRoleDetailAction } from '#actions/role/get_role_detail_action'
import { CreateRoleAction } from '#actions/role/create_role_action'
import { UpdateRoleAction } from '#actions/role/update_role_action'
import { DeleteRoleAction } from '#actions/role/delete_role_action'
import {
  listRolesValidator,
  createRoleValidator,
  updateRoleValidator,
  restRoleIdValidator,
} from '#validators/role'
import RoleTransformer from '#transformers/role_transformer'
import { type RestEndpoint, type AnyRestEndpoint, handleRest } from '#rest/rest_resource'

type RoleListPagination = Awaited<ReturnType<ListRolesAction['execute']>>
type RoleCreateResult = Awaited<ReturnType<CreateRoleAction['execute']>>
type RoleUpdateResult = Awaited<ReturnType<UpdateRoleAction['execute']>>
type RoleDeleteResult = Awaited<ReturnType<DeleteRoleAction['execute']>>

type RoleListPayload = Infer<typeof listRolesValidator>
type RoleCreatePayload = Infer<typeof createRoleValidator>
type RoleUpdatePayload = Infer<ReturnType<typeof updateRoleValidator>>

/**
 * Endpoint declarations for the roles REST resource.
 */
export interface RolesEndpoints {
  index: RestEndpoint<undefined, RoleListPayload, RoleListPagination, RoleListPagination>
  show: RestEndpoint<undefined, Infer<typeof restRoleIdValidator>, Role, Role>
  store: RestEndpoint<undefined, RoleCreatePayload, RoleCreateResult, Role>
  update: RestEndpoint<{ id: number }, RoleUpdatePayload, RoleUpdateResult, Role>
  destroy: RestEndpoint<
    undefined,
    Infer<typeof restRoleIdValidator>,
    RoleDeleteResult,
    RoleDeleteResult
  >
}

/**
 * Declarative roles REST resource.
 *
 * Owns the five REST endpoint declarations executed by the shared
 * {@link handleRest} pipeline; the `/api/v1/admin/roles` controllers reduce
 * to one-line adapters over `handle()`.
 */
@inject()
export default class RolesResource {
  constructor(
    protected listRolesAction: ListRolesAction,
    protected getRoleDetailAction: GetRoleDetailAction,
    protected createRoleAction: CreateRoleAction,
    protected updateRoleAction: UpdateRoleAction,
    protected deleteRoleAction: DeleteRoleAction
  ) {}

  readonly endpoints: RolesEndpoints = {
    index: {
      paginated: true,
      strip: true,
      validator: () => listRolesValidator,
      execute: (_context, _prepared, payload) =>
        this.listRolesAction.execute({
          search: payload.search,
          pagination: _context.pagination!,
        }),
      transform: (entity) => RoleTransformer.paginate(entity.all(), entity.getMeta()),
    },
    show: {
      input: (context) => context.params,
      validator: () => restRoleIdValidator,
      execute: (_context, _prepared, payload) =>
        this.getRoleDetailAction.execute({ id: payload.id }),
      transform: (entity) => RoleTransformer.transform(entity),
    },
    store: {
      status: 201,
      validator: () => createRoleValidator,
      execute: (_context, _prepared, payload) =>
        this.createRoleAction.execute({
          name: payload.name,
          slug: payload.slug,
          description: payload.description ?? null,
          permissionIds: payload.permission_ids,
        }),
      refetch: (_context, _prepared, _payload, created) =>
        this.getRoleDetailAction.execute({ id: created.id }),
      transform: (entity) => RoleTransformer.transform(entity),
    },
    update: {
      prepare: async (context) => {
        const { id } = await restRoleIdValidator.validate(context.params)

        return { id }
      },
      validator: (prepared) => updateRoleValidator(prepared.id),
      execute: (_context, prepared, payload) =>
        this.updateRoleAction.execute({
          id: prepared.id,
          name: payload.name,
          slug: payload.slug,
          description: payload.description ?? null,
          permissionIds: payload.permission_ids,
        }),
      refetch: (_context, prepared) => this.getRoleDetailAction.execute({ id: prepared.id }),
      transform: (entity) => RoleTransformer.transform(entity),
    },
    destroy: {
      status: 204,
      input: (context) => context.params,
      validator: () => restRoleIdValidator,
      execute: (_context, _prepared, payload) => this.deleteRoleAction.execute({ id: payload.id }),
    },
  }

  /**
   * Dispatch a REST action to its declared endpoint.
   */
  async handle(route: keyof RolesEndpoints, ctx: HttpContext): Promise<void> {
    const endpoint = this.endpoints[route] as AnyRestEndpoint

    await handleRest(ctx, endpoint)
  }
}
