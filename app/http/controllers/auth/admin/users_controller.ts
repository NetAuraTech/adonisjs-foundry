import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DeleteUserAction } from '#actions/user/delete_user_action'
import { deleteValidator } from '#validators/user'
import { I18nService } from '#services/i18n_service'
import UsersResource from '#rest/users_resource'
import { handle } from '#rest/page_adapter'

@inject()
export default class UsersController {
  constructor(
    protected i18n: I18nService,
    protected deleteUserAction: DeleteUserAction,
    protected usersResource: UsersResource
  ) {}

  async render(ctx: HttpContext) {
    return handle(ctx, this.usersResource.endpoints.index)
  }

  async destroy(ctx: HttpContext) {
    const { response, params, session } = ctx

    const payload = await deleteValidator.validate(params)

    await this.deleteUserAction.execute({ id: payload.id })

    session.flash('success', this.i18n.translate('admin.users.deleted'))

    return response.redirect().toRoute('admin.users.render')
  }
}
