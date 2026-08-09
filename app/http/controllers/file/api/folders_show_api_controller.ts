import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { showFileValidator } from '#validators/file'
import { ListFolderChildrenAction } from '#actions/file_folder/list_folder_children_action'
import { FileFolderRepository } from '#repositories/file/file_folder_repository'
import FileFolder from '#models/file/file_folder'
import RowNotFoundException from '#exceptions/core/row_not_found_exception'

@inject()
export default class FoldersShowApiController {
  constructor(
    protected listFolderChildrenAction: ListFolderChildrenAction,
    protected folderRepository: FileFolderRepository
  ) {}

  async show(ctx: HttpContext) {
    const { params } = ctx
    const { id } = await showFileValidator.validate(params)
    const folder = await this.folderRepository.findById(id)
    if (!folder) {
      throw new RowNotFoundException(FileFolder)
    }
    return {
      data: {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
      },
    }
  }

  async children(ctx: HttpContext) {
    const { params } = ctx
    const { id } = await showFileValidator.validate(params)
    const folder = await this.folderRepository.findById(id)
    if (!folder) {
      throw new RowNotFoundException(FileFolder)
    }
    const childFolders = await this.listFolderChildrenAction.execute({ parentId: id })
    return {
      data: childFolders.map((f) => ({
        id: f.id,
        name: f.name,
        parentId: f.parentId,
      })),
    }
  }
}
