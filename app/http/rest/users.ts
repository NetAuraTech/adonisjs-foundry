import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import { type Infer } from '@vinejs/vine/types'
import type User from '#models/auth/user'
import { ListUsersAction } from '#actions/user/list_users_action'
import { GetUserDetailAction } from '#actions/user/get_user_detail_action'
import { CreateUserAction } from '#actions/user/create_user_action'
import { UpdateUserAction } from '#actions/user/update_user_action'
import { DeleteUserAction } from '#actions/user/delete_user_action'
import { ListAllRolesAction } from '#actions/role/list_all_roles_action'
import { listValidator, createValidator, updateValidator, restIdValidator } from '#validators/user'
import UserTransformer from '#transformers/user_transformer'
import { roleIdsToAllowlist } from '#helpers/auth/load_user_role'
import { type RestEndpoint, type AnyRestEndpoint, handleRest } from '#rest/rest_resource'

type UserListPagination = Awaited<ReturnType<ListUsersAction['execute']>>
type UserCreateResult = Awaited<ReturnType<CreateUserAction['execute']>>
type UserUpdateResult = Awaited<ReturnType<UpdateUserAction['execute']>>
type UserDeleteResult = Awaited<ReturnType<DeleteUserAction['execute']>>

/**
 * Endpoint declarations for the users REST resource.
 *
 * Each member is a {@link RestEndpoint} instantiation: `Prepared` is the
 * value produced by the `prepare` step, `Payload` is inferred from the Vine
 * validator, `Result` is the domain action return and `Entity` is what the
 * transformer consumes.
 */
export interface UsersEndpoints {
  index: RestEndpoint<
    { allowed: string[] },
    Infer<ReturnType<typeof listValidator>>,
    UserListPagination,
    UserListPagination
  >
  show: RestEndpoint<undefined, Infer<typeof restIdValidator>, User, User>
  store: RestEndpoint<
    { allowed: string[] },
    Infer<ReturnType<typeof createValidator>>,
    UserCreateResult,
    User
  >
  update: RestEndpoint<
    { id: number; allowed: string[] },
    Infer<ReturnType<typeof updateValidator>>,
    UserUpdateResult,
    User
  >
  destroy: RestEndpoint<
    undefined,
    Infer<typeof restIdValidator>,
    UserDeleteResult,
    UserDeleteResult
  >
}

/**
 * Declarative users REST resource.
 *
 * Owns the five REST endpoint declarations executed by the shared
 * {@link handleRest} pipeline; the `/api/v1/admin/users` controllers reduce
 * to one-line adapters over `handle()`.
 */
@inject()
export default class UsersResource {
  constructor(
    protected listUsersAction: ListUsersAction,
    protected listAllRolesAction: ListAllRolesAction,
    protected getUserDetailAction: GetUserDetailAction,
    protected createUserAction: CreateUserAction,
    protected updateUserAction: UpdateUserAction,
    protected deleteUserAction: DeleteUserAction
  ) {}

  readonly endpoints: UsersEndpoints = {
    index: {
      paginated: true,
      strip: true,
      prepare: async () => {
        const roles = await this.listAllRolesAction.execute()

        return { allowed: roleIdsToAllowlist(roles) }
      },
      validator: (prepared) => listValidator(prepared.allowed),
      execute: (context, _prepared, payload) =>
        this.listUsersAction.execute({
          search: payload.search,
          role: payload.role,
          pagination: context.pagination!,
        }),
      transform: (entity) => UserTransformer.paginate(entity.all(), entity.getMeta()),
    },
    show: {
      input: (context) => context.params,
      validator: () => restIdValidator,
      execute: (_context, _prepared, payload) =>
        this.getUserDetailAction.execute({ id: payload.id }),
      transform: (entity) => UserTransformer.transform(entity),
    },
    store: {
      status: 201,
      prepare: async () => {
        const roles = await this.listAllRolesAction.execute()

        return { allowed: roleIdsToAllowlist(roles) }
      },
      validator: (prepared) => createValidator(prepared.allowed),
      execute: (_context, _prepared, payload) =>
        this.createUserAction.execute({
          email: payload.email,
          roleId: payload.role_id ? Number(payload.role_id) : undefined,
        }),
      refetch: (_context, _prepared, _payload, created) =>
        this.getUserDetailAction.execute({ id: created.id }),
      transform: (entity) => UserTransformer.transform(entity),
    },
    update: {
      prepare: async (context) => {
        const { id } = await restIdValidator.validate(context.params)
        const roles = await this.listAllRolesAction.execute()

        return { id, allowed: roleIdsToAllowlist(roles) }
      },
      validator: (prepared) => updateValidator(prepared.id, prepared.allowed),
      execute: (_context, prepared, payload) =>
        this.updateUserAction.execute({
          id: prepared.id,
          email: payload.email,
          username: payload.username,
          roleId: payload.role_id ? Number(payload.role_id) : undefined,
        }),
      refetch: (_context, prepared) => this.getUserDetailAction.execute({ id: prepared.id }),
      transform: (entity) => UserTransformer.transform(entity),
    },
    destroy: {
      status: 204,
      input: (context) => context.params,
      validator: () => restIdValidator,
      execute: (_context, _prepared, payload) => this.deleteUserAction.execute({ id: payload.id }),
    },
  }

  /**
   * Dispatch a REST action to its declared endpoint.
   *
   * @param route - The REST action name (`index`, `show`, `store`, `update`,
   *                `destroy`).
   * @param ctx - The AdonisJS HTTP context.
   * @returns Resolves once the response has been sent.
   *
   * @example
   * await usersResource.handle('show', ctx)
   */
  async handle(route: keyof UsersEndpoints, ctx: HttpContext): Promise<void> {
    const endpoint = this.endpoints[route] as AnyRestEndpoint

    await handleRest(ctx, endpoint)
  }
}
