import type { HttpContext } from '@adonisjs/core/http'
import { ErrorHandlerService } from '#services/logging/error_handler_service'
import { inject } from '@adonisjs/core'
import { UserService } from '#services/auth/user_service'
import { deleteValidator, listValidator } from '#validators/user'
import { RoleService } from '#services/auth/role_service'
import UserTransformer from '#transformers/user_transformer'
import RoleTransformer from '#transformers/role_transformer'
import { stripEmptyStrings } from '#helpers/core/strip_empty_strings'
import { extractPagination } from '#helpers/pagination/extract_pagination'

@inject()
export default class UsersController {
  constructor(
    protected errorHandler: ErrorHandlerService,
    protected userService: UserService,
    protected roleService: RoleService
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, request } = ctx

    try {
      const pagination = await extractPagination(request)

      const roles = await this.roleService.findAll()
      const allowed = roles.map((role) => String(role.id))

      const data = stripEmptyStrings(request.all())

      const payload = await listValidator(allowed).validate(data)

      const users = await this.userService.list(payload, pagination)

      return inertia.render('auth/cms/index', {
        users: UserTransformer.paginate(users.all(), users.getMeta()),
        roles: RoleTransformer.transform(roles),
        filters: payload,
      })
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }

  async destroy(ctx: HttpContext) {
    const { response, params, session, i18n } = ctx

    try {
      const payload = await deleteValidator.validate(params)

      await this.userService.delete(payload.id)

      session.flash('success', i18n.t('admin.users.deleted'))

      return response.redirect().toRoute('admin.users.render')
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }
}
