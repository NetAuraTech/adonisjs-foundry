import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { createFolderValidator } from '#validators/file'
import { ListRootFoldersAction } from '#actions/file_folder/list_root_folders_action'
import { CreateFolderAction } from '#actions/file_folder/create_folder_action'

@inject()
export default class FoldersApiController {
  constructor(
    protected listRootFoldersAction: ListRootFoldersAction,
    protected createFolderAction: CreateFolderAction
  ) {}

  async index({ response }: HttpContext) {
    const roots = await this.listRootFoldersAction.execute()
    return response.json({
      data: roots.map((f) => ({
        id: f.id,
        name: f.name,
        parentId: f.parentId,
      })),
    })
  }

  async store(ctx: HttpContext) {
    const { request, response } = ctx
    const payload = await createFolderValidator.validate(request.all())
    const folder = await this.createFolderAction.execute({
      name: payload.name,
      parentId: payload.parentId ?? null,
    })
    return response.created({
      data: { id: folder.id, name: folder.name, parentId: folder.parentId },
    })
  }
}
