import { BaseHttpException } from '#exceptions/base_http_exception'
import type { HttpContext } from '@adonisjs/core/http'

export default class InvalidTokenException extends BaseHttpException {
  static status = 400
  static code = 'E_INVALID_TOKEN'

  constructor() {
    super('This link is invalid or has expired. Please request a new one.')
  }

  protected redirectPath(response: HttpContext['response']): ReturnType<typeof response.redirect> {
    return response.redirect().toRoute('auth.session.render')
  }
}
