import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { forgotPasswordValidator } from '#validators/auth'
import User from '#models/auth/user'
import { SendPasswordResetAction } from '#actions/password/send_password_reset_action'

/**
 * POST /api/v1/auth/forgot-password — request a password-reset email.
 * Always returns 200 (even for unknown emails) to avoid account enumeration.
 */
@inject()
export default class ForgotPasswordApiController {
  constructor(protected sendPasswordResetAction: SendPasswordResetAction) {}

  async store(ctx: HttpContext) {
    const { request, response } = ctx

    const payload = await forgotPasswordValidator.validate(request.all())

    const user = await User.findBy('email', payload.email)

    if (user) {
      await this.sendPasswordResetAction.execute({ user })
    }

    return response.ok({ message: 'reset_email_sent' })
  }
}
