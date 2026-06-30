import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class InvalidTemplateTypeException extends Exception {
  static status = 422
  static code = 'E_INVALID_TEMPLATE_TYPE'

  constructor() {
    super('Only page templates can be applied to a full page.', {
      status: InvalidTemplateTypeException.status,
      code: InvalidTemplateTypeException.code,
    })
  }

  async handle(error: this, ctx: HttpContext) {
    const { request, response, session, i18n } = ctx

    const message = i18n.t(`exceptions.${error.code}`)

    if (request.wantsJSON()) {
      return response.status(error.status).send({
        error: {
          code: error.code,
          message,
          ...(app.inDev && { stack: error.stack }),
        },
      })
    }

    session.flash('error', message)
    return response.redirect().back()
  }
}
