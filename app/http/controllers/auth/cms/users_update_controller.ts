import type { HttpContext } from '@adonisjs/core/http'
import { UserService } from '#services/auth/user_service'
import { ErrorHandlerService } from '#services/logging/error_handler_service'
import { inject } from '@adonisjs/core'
import { editValidator, updateValidator } from '#validators/user'
import { RoleService } from '#services/auth/role_service'
import UserTransformer from '#transformers/user_transformer'
import RoleTransformer from '#transformers/role_transformer'

@inject()
export default class UsersUpdateController {
  constructor(
    protected userService: UserService,
    protected roleService: RoleService,
    protected errorHandler: ErrorHandlerService
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, params } = ctx

    try {
      const payload = await editValidator.validate(params)

      const user = await this.userService.detail(payload.id)

      const roles = await this.roleService.findAll()

      return inertia.render('auth/cms/form', {
        user: UserTransformer.transform(user),
        roles: RoleTransformer.transform(roles),
      })
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }

  async execute(ctx: HttpContext) {
    const { params, request, response, session, i18n } = ctx

    try {
      const { id } = await editValidator.validate(params)

      const roles = await this.roleService.findAll()
      const allowed = roles.map((role) => String(role.id))

      const payload = await updateValidator(id, allowed).validate(request.all())

      const updated = await this.userService.update(id, payload)

      let flash = i18n.t('admin.users.updated')

      if (updated?.pendingEmail === payload.email) {
        flash = `${flash} ${i18n.t('admin.users.updated_email')}`
      }

      session.flash('success', flash)

      return response.redirect().toRoute('admin.users_show.render', { id })
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }
}
