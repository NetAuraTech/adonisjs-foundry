import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ErrorHandlerService } from '#services/logging/error_handler_service'

@inject()
export default class DashboardController {
  constructor(protected errorHandler: ErrorHandlerService) {}

  async render(ctx: HttpContext) {
    const { inertia } = ctx

    try {
      return inertia.render('core/cms/dashboard', {})
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }
}
