import { Exception } from '@adonisjs/core/exceptions'

export default class MaxAttemptsExceededException extends Exception {
  static status = 429
  static code = 'E_MAX_ATTEMPTS_EXCEEDED'

  constructor() {
    super('Maximum number of attempts exceeded. Please try again later.', {
      status: MaxAttemptsExceededException.status,
      code: MaxAttemptsExceededException.code,
    })
  }
}
