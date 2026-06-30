import { inject } from '@adonisjs/core'
import User from '#models/auth/user'
import hash from '@adonisjs/core/services/hash'
import { LogService } from '#services/logging/log_service'
import { withTransaction } from '#shared/utils/with_transaction'
import InvalidCurrentPasswordException from '#exceptions/auth/invalid_current_password_exception'

interface DeleteUserAccountPayload {
  user: User
  password: string
}

/**
 * Permanently delete the authenticated user account after password verification.
 */
@inject()
export class DeleteUserAccountAction {
  constructor(protected logService: LogService) {}

  /**
   * Execute account deletion.
   *
   * @param payload - Authenticated user and their current password for confirmation.
   * @returns `true` when deletion succeeds.
   * @throws {InvalidCurrentPasswordException} If the password does not match.
   */
  async execute(payload: DeleteUserAccountPayload): Promise<boolean> {
    const isPasswordValid = await hash.verify(payload.user.password!, payload.password)

    if (!isPasswordValid) {
      this.logService.logSecurity('Failed account deletion attempt - invalid password', {
        userId: payload.user.id,
        userEmail: payload.user.email,
      })
      throw new InvalidCurrentPasswordException()
    }

    this.logService.logBusiness(
      'account.deleted',
      { userId: payload.user.id, userEmail: payload.user.email },
      { deletedAt: new Date().toISOString() }
    )

    await withTransaction(async () => {
      await payload.user.delete()
    })
    return true
  }
}
