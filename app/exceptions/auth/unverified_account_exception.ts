import { Exception } from '@adonisjs/core/exceptions'

export default class UnverifiedAccountException extends Exception {
  email: string
  static status = 403
  static code = 'E_UNVERIFIED_ACCOUNT'

  constructor(email: string) {
    super(
      'This account has not yet been verified. Please verify your email address before continuing.',
      {
        status: UnverifiedAccountException.status,
        code: UnverifiedAccountException.code,
      }
    )
    this.email = email
  }
}
