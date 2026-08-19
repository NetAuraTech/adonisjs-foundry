import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import UsersResource from '#rest/users'
import { handlePage } from '#rest/page_resource'

@inject()
export default class UsersUpdateController {
  constructor(protected usersResource: UsersResource) {}

  async render(ctx: HttpContext) {
    return handlePage(ctx, this.usersResource.endpoints.edit)
  }

  async execute(ctx: HttpContext) {
    return handlePage(ctx, this.usersResource.endpoints.update)
  }
}
