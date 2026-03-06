import { Exception } from '@adonisjs/core/exceptions'

export default class InvalidCurrentPasswordException extends Exception {
  static status = 400
  static code = 'E_INVALID_CURRENT_PASSWORD'

  constructor() {
    super('The current password is incorrect.', {
      status: InvalidCurrentPasswordException.status,
      code: InvalidCurrentPasswordException.code,
    })
  }
}
