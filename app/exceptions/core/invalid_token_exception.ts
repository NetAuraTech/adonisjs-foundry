import { BaseHttpException } from '#exceptions/base_http_exception'

export default class InvalidTokenException extends BaseHttpException {
  static status = 400
  static code = 'E_INVALID_TOKEN'

  constructor() {
    super('This link is invalid or has expired. Please request a new one.')
  }
}
