import { inject } from '@adonisjs/core'
import RowNotFoundException from '#exceptions/core/row_not_found_exception'
import User from '#models/auth/user'
import { UserRepository } from '#repositories/auth/user_repository'
import { withTransaction } from '#shared/utils/with_transaction'

interface DeleteUserPayload {
  id: number
}

/**
 * Permanently delete a user by ID.
 */
@inject()
export class DeleteUserAction {
  constructor(protected userRepository: UserRepository) {}

  /**
   * Execute user deletion.
   *
   * @param payload - The user ID to delete.
   * @returns `true` when the user is deleted successfully.
   * @throws {RowNotFoundException} When the user does not exist.
   */
  async execute(payload: DeleteUserPayload): Promise<boolean> {
    const user = await this.userRepository.findById(payload.id)

    if (!user) {
      throw new RowNotFoundException(User)
    }

    return withTransaction(async () => this.userRepository.delete(payload.id))
  }
}
