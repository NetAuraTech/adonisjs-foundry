import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { UploadFileAction } from '#actions/file/upload_file_action'
import FileTransformer from '#transformers/file_transformer'

@inject()
export default class FilesUploadApiController {
  constructor(protected uploadFileAction: UploadFileAction) {}

  async store(ctx: HttpContext) {
    const { request, response, auth, serialize } = ctx
    const file = request.file('file')

    if (!file) {
      return response.badRequest({ message: 'No file uploaded' })
    }

    const result = await this.uploadFileAction.execute({
      file: file!,
      folderId: request.input('folder_id') ? Number(request.input('folder_id')) : null,
      uploadedBy: auth.getUserOrFail().id,
    })

    const serialized = await serialize(FileTransformer.transform(result))

    return response.created(serialized)
  }
}
