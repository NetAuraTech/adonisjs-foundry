import type { HttpContext } from '@adonisjs/core/http'
import { UserService } from '#services/auth/user_service'
import { inject } from '@adonisjs/core'
import { showValidator } from '#validators/user'
import UserTransformer from '#transformers/user_transformer'
import { enabledProviders } from '#helpers/auth/oauth'
import { PermissionService } from '#services/auth/permission_service'
import PermissionTransformer from '#transformers/permission_transformer'

@inject()
export default class UsersShowsController {
  constructor(
    protected userService: UserService,
    protected permissionService: PermissionService
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, params } = ctx

    const payload = await showValidator.validate(params)

    const user = await this.userService.detail(payload.id)

    const permissions = await this.permissionService.findAll()

    return inertia.render('auth/cms/show', {
      user: UserTransformer.transform(user),
      providers: enabledProviders,
      permissions: PermissionTransformer.transform(permissions),
    })
  }
}
