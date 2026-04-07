import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { FileService } from '#services/file/file_service'
import {
  listFileValidator,
  showFileValidator,
  moveFileValidator,
  upsertAltValidator,
  deleteAltValidator,
} from '#validators/file'
import { stripEmptyStrings } from '#helpers/core/strip_empty_strings'
import { extractPagination } from '#helpers/pagination/extract_pagination'
import FileTransformer from '#transformers/file_transformer'
import { FileFolderService } from '#services/file/file_folder_service'
import FileFolderTransformer from '#transformers/file_folder_transformer'

@inject()
export default class FilesController {
  constructor(
    protected fileService: FileService,
    protected fileFolderService: FileFolderService
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, request } = ctx

    const pagination = await extractPagination(request)
    const data = stripEmptyStrings(request.all())
    const payload = await listFileValidator.validate(data)

    const files = await this.fileService.list(
      {
        folderId: payload.folder_id,
        mimeType: payload.mime_type,
        search: payload.search,
      },
      pagination
    )

    const folders = await this.fileFolderService.listRoots()

    return inertia.render('file/cms/index', {
      files: FileTransformer.paginate(files.all(), files.getMeta()),
      folders: FileFolderTransformer.transform(folders),
      filters: payload,
    })
  }

  async upload(ctx: HttpContext) {
    const { request, response, auth, session, i18n } = ctx

    const file = request.file('file')
    const folderId = request.input('folder_id', null)
    const user = auth.getUserOrFail()

    if (!file) {
      session.flash('error', i18n.t('file.no_file_provided'))
      return response.redirect().back()
    }

    await this.fileService.upload(file, folderId ? Number(folderId) : null, user.id)

    session.flash('success', i18n.t('file.uploaded'))

    return response.redirect().back()
  }

  async move(ctx: HttpContext) {
    const { params, request, response, session, i18n } = ctx

    const { id } = await showFileValidator.validate(params)
    const payload = await moveFileValidator.validate(request.all())

    await this.fileService.move(id, payload.folder_id ?? null)

    session.flash('success', i18n.t('file.moved'))

    return response.redirect().back()
  }

  async destroy(ctx: HttpContext) {
    const { params, response, session, i18n } = ctx

    const { id } = await showFileValidator.validate(params)

    await this.fileService.delete(id)

    session.flash('success', i18n.t('file.deleted'))

    return response.redirect().toRoute('admin.files.render')
  }

  async upsertAlt(ctx: HttpContext) {
    const { params, request, response, i18n } = ctx

    const { id } = await showFileValidator.validate(params)
    const payload = await upsertAltValidator.validate(request.all())

    await this.fileService.upsertAlt(id, payload.locale, payload.key, payload.value)

    return response.ok({ message: i18n.t('file.alt.updated') })
  }

  async deleteAlt(ctx: HttpContext) {
    const { params, request, response, i18n } = ctx

    const { id } = await showFileValidator.validate(params)
    const payload = await deleteAltValidator.validate(request.all())

    await this.fileService.deleteAlt(id, payload.locale, payload.key)

    return response.ok({ message: i18n.t('file.alt.deleted') })
  }
}
