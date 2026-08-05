import { inject } from '@adonisjs/core'
import { FileFolderRepository } from '#repositories/file/file_folder_repository'
import { LogService } from '#services/logging/log_service'
import { withTransaction } from '#shared/utils/with_transaction'

interface DeleteFolderPayload {
  id: number
}

/**
 * Delete a folder and its contents.
 */
@inject()
export class DeleteFolderAction {
  constructor(
    protected folderRepository: FileFolderRepository,
    protected logService: LogService
  ) {}

  /**
   * Execute folder deletion.
   *
   * @param payload - Folder ID to delete.
   * @returns `true` when the folder is deleted successfully.
   */
  async execute(payload: DeleteFolderPayload): Promise<boolean> {
    const deleted = await withTransaction(async () => this.folderRepository.delete(payload.id))

    // Log only after the deletion actually succeeded.
    this.logService.logBusiness('folder.deleted', {}, { folderId: payload.id })
    return deleted
  }
}
