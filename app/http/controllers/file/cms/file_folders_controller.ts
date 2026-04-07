import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { FileFolderService } from '#services/file/file_folder_service'
import { createFolderValidator, updateFolderValidator, showFileValidator } from '#validators/file'
import FileFolderTransformer from '#transformers/file_folder_transformer'

@inject()
export default class FileFoldersController {
  constructor(protected folderService: FileFolderService) {}

  async render(ctx: HttpContext) {
    const { inertia } = ctx

    const roots = await this.folderService.listRoots()

    return inertia.render('file/cms/folders', { roots: FileFolderTransformer.transform(roots) })
  }

  async execute(ctx: HttpContext) {
    const { request, response, session, i18n } = ctx

    const payload = await createFolderValidator.validate(request.all())

    await this.folderService.create(payload.name, payload.parentId ?? null)

    session.flash('success', i18n.t('file.folder.created'))

    return response.redirect().toRoute('admin.file_folders.render')
  }

  async update(ctx: HttpContext) {
    const { params, request, response, session, i18n } = ctx

    const { id } = await showFileValidator.validate(params)
    const payload = await updateFolderValidator.validate({ ...request.all(), id })

    await this.folderService.rename(id, payload.name)

    session.flash('success', i18n.t('file.folder.updated'))

    return response.redirect().toRoute('admin.file_folders.render')
  }

  async destroy(ctx: HttpContext) {
    const { params, response, session, i18n } = ctx

    const { id } = await showFileValidator.validate(params)

    await this.folderService.delete(id)

    session.flash('success', i18n.t('file.folder.deleted'))

    return response.redirect().toRoute('admin.file_folders.render')
  }
}
