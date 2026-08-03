import type { HttpContext } from '@adonisjs/core/http'
import { Exception } from '@adonisjs/core/exceptions'
import app from '@adonisjs/core/services/app'
import { I18nService } from '#services/i18n_service'
import { buildMaintenanceIndexPayload } from '#helpers/i18n_payloads/maintenance_index'

export default class MaintenanceException extends Exception {
  static status = 503
  static code = 'E_MAINTENANCE'

  constructor(
    message: string,
    public readonly retryAfter: number
  ) {
    super(message)
  }

  async handle(error: this, ctx: HttpContext) {
    const { request, response, inertia, i18n } = ctx

    if (request.wantsJSON() || request.url().startsWith('/api/')) {
      return response.status(503).send({
        error: {
          code: error.code,
          type: 'maintenance',
          message: error.message,
          retryAfter: error.retryAfter,
          ...(app.inDev && { stack: error.stack }),
        },
      })
    }

    const i18nService = new I18nService(i18n)

    // Render Inertia maintenance page — explicitly write to response because the exception
    // handler pipeline discards the return value from handle(); it only works for statusPages
    // renderers where ExceptionHandler internally calls response.send() with the result.
    const html = await inertia.render('maintenance/front/index', {
      message: error.message,
      retryAfter: error.retryAfter,
      redirectPath: request.url(),
      translations: buildMaintenanceIndexPayload(i18nService),
    })

    return response.status(503).type('html').send(html)
  }
}
