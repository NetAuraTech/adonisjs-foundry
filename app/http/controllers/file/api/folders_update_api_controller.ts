import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { updateFolderValidator } from '#validators/file'
import { RenameFolderAction } from '#actions/file_folder/rename_folder_action'

@inject()
export default class FoldersUpdateApiController {
  constructor(protected renameFolderAction: RenameFolderAction) {}

  async update(ctx: HttpContext) {
    const { params, request, response } = ctx
    const payload = await updateFolderValidator.validate({
      id: Number(params.id),
      name: request.input('name'),
    })
    const folder = await this.renameFolderAction.execute({ id: payload.id, name: payload.name })
    return response.json({
      data: { id: folder.id, name: folder.name, parentId: folder.parentId },
    })
  }
}
