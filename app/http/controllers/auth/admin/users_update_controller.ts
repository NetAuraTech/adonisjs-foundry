import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import UsersResource from '#rest/users_resource'
import { handle } from '#rest/page_adapter'

@inject()
export default class UsersUpdateController {
  constructor(protected usersResource: UsersResource) {}

  async render(ctx: HttpContext) {
    return handle(ctx, this.usersResource.endpoints.edit)
  }

  async execute(ctx: HttpContext) {
    return handle(ctx, this.usersResource.endpoints.update)
  }
}
