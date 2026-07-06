import type { HttpContext } from '@adonisjs/core/http'
import { BaseHttpException } from '#exceptions/base_http_exception'

export default class UnauthorizedException extends BaseHttpException {
  static status = 401
  static code = 'E_UNAUTHORIZED'

  constructor() {
    super('You must be logged in to access this resource.')
  }

  protected redirectPath(response: HttpContext['response']) {
    return response.redirect().toRoute('auth.session.render')
  }
}
