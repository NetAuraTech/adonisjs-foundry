import type { HttpContext } from '@adonisjs/core/http'
import { UserService } from '#services/auth/user_service'
import { ErrorHandlerService } from '#services/logging/error_handler_service'
import { inject } from '@adonisjs/core'
import { createValidator } from '#validators/user'
import { RoleService } from '#services/auth/role_service'
import RoleTransformer from '#transformers/role_transformer'

@inject()
export default class UsersCreateController {
  constructor(
    protected userService: UserService,
    protected roleService: RoleService,
    protected errorHandler: ErrorHandlerService
  ) {}

  async render(ctx: HttpContext) {
    const { inertia } = ctx

    try {
      const roles = await this.roleService.findAll()

      return inertia.render('auth/cms/form', {
        roles: RoleTransformer.transform(roles),
      })
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }

  async execute(ctx: HttpContext) {
    const { request, response, session, i18n } = ctx

    try {
      const roles = await this.roleService.findAll()
      const allowed = roles.map((role) => String(role.id))

      const payload = await createValidator(allowed).validate(request.all())

      const user = await this.userService.create(payload)

      session.flash(
        'success',
        i18n.t('admin.users.created', { email: user.email, username: user.username })
      )

      return response.redirect().toRoute('admin.users_show.render', { id: user.id })
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }
}
