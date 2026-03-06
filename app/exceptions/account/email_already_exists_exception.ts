import { Exception } from '@adonisjs/core/exceptions'

export default class EmailAlreadyExistsException extends Exception {
  static status = 409
  static code = 'E_EMAIL_EXISTS'

  constructor() {
    super('This email address is already in use by another account.', {
      status: EmailAlreadyExistsException.status,
      code: EmailAlreadyExistsException.code,
    })
  }
}
