import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class MissingRevisionException extends Exception {
  static status = 404
  static code = 'E_MISSING_REVISION'

  constructor(private revisionId: number) {
    super(`Revision ${revisionId} not found.`, {
      status: MissingRevisionException.status,
      code: MissingRevisionException.code,
    })
  }

  async handle(error: this, ctx: HttpContext) {
    const { request, response, session, i18n } = ctx

    const message = i18n.t(`exceptions.${error.code}`, {
      revisionId: error.revisionId,
    })

    if (request.wantsJSON()) {
      return response.status(error.status).send({
        error: {
          code: error.code,
          message: message,
          details: {
            revisionId: error.revisionId,
          },
          ...(app.inDev && { stack: error.stack }),
        },
      })
    }

    session.flash('error', message)
    return response.redirect().back()
  }
}
