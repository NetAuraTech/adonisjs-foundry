import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { showFileValidator } from '#validators/file'
import { DeleteFolderAction } from '#actions/file_folder/delete_folder_action'
import { FileFolderRepository } from '#repositories/file/file_folder_repository'
import FileFolder from '#models/file/file_folder'
import RowNotFoundException from '#exceptions/core/row_not_found_exception'

@inject()
export default class FoldersDeleteApiController {
  constructor(
    protected deleteFolderAction: DeleteFolderAction,
    protected folderRepository: FileFolderRepository
  ) {}

  async destroy(ctx: HttpContext) {
    const { params, response } = ctx
    const { id } = await showFileValidator.validate(params)
    const folder = await this.folderRepository.findById(id)
    if (!folder) throw new RowNotFoundException(FileFolder)
    await this.deleteFolderAction.execute({ id })
    return response.noContent()
  }
}
