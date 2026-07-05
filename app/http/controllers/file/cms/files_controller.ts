import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
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
import FileFolderTransformer from '#transformers/file_folder_transformer'
import { ListFilesAction } from '#actions/file/list_files_action'
import { GetFileDetailAction } from '#actions/file/get_file_detail_action'
import { UploadFileAction } from '#actions/file/upload_file_action'
import { MoveFileAction } from '#actions/file/move_file_action'
import { DeleteFileAction } from '#actions/file/delete_file_action'
import { UpsertFileAltAction } from '#actions/file/upsert_file_alt_action'
import { DeleteFileAltAction } from '#actions/file/delete_file_alt_action'
import { ListRootFoldersAction } from '#actions/file_folder/list_root_folders_action'
import { I18nService } from '#services/i18n_service'

@inject()
export default class FilesController {
  constructor(
    protected i18n: I18nService,
    protected listFilesAction: ListFilesAction,
    protected getFileDetailAction: GetFileDetailAction,
    protected uploadFileAction: UploadFileAction,
    protected moveFileAction: MoveFileAction,
    protected deleteFileAction: DeleteFileAction,
    protected upsertFileAltAction: UpsertFileAltAction,
    protected deleteFileAltAction: DeleteFileAltAction,
    protected listRootFoldersAction: ListRootFoldersAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, request } = ctx

    const pagination = await extractPagination(request)
    const data = stripEmptyStrings(request.all())
    const payload = await listFileValidator.validate(data)

    const files = await this.listFilesAction.execute({
      folderId: payload.folder_id,
      mimeType: payload.mime_type,
      search: payload.search,
      pagination,
    })

    const folders = await this.listRootFoldersAction.execute()

    return inertia.render('file/cms/index', {
      files: FileTransformer.paginate(files.all(), files.getMeta()),
      folders: FileFolderTransformer.transform(folders),
      filters: payload,
      translations: this.i18n.buildPayload({
        title: 'cms.files.list.title',
        action: {
          folders: 'cms.files.list.action.folders',
          upload: 'cms.files.list.action.upload',
        },
        name: 'cms.files.form.name.value',
        type: 'cms.files.form.type.value',
        size: 'cms.files.form.size.value',
        uploaded_at: 'cms.files.form.uploaded_at.value',
        upload: {
          value: 'cms.files.upload.submit',
          help: 'cms.files.upload.help',
          remove: 'cms.files.upload.remove',
          max_size: this.i18n.translate('cms.files.upload.max_size', { size: '{size}' }),
          try_again: 'cms.files.upload.try_again',
          error: {
            size: this.i18n.translate('cms.files.upload.error.size', { max: '{max}' }),
          },
        },
        actions: {
          value: 'cms.files.actions',
          show: 'cms.files.show.title',
          delete: {
            value: this.i18n.translate('cms.files.delete.title', { filename: '{filename}' }),
            confirm: 'cms.files.delete.confirm',
          },
        },
        folders: {
          all: 'cms.files.list.folders.all',
        },
        search: {
          filter: 'cms.files.search.filter',
          value: 'cms.files.search.value',
          placeholder: 'cms.files.search.placeholder',
          type: {
            value: 'cms.files.search.type.value',
            options: {
              placeholder: 'cms.files.search.type.options.placeholder',
              image: 'cms.files.search.type.options.image',
              video: 'cms.files.search.type.options.video',
              audio: 'cms.files.search.type.options.audio',
              pdf: 'cms.files.search.type.options.pdf',
            },
          },
        },
        alts: {
          title: 'cms.files.show.alts.title',
          add: 'cms.files.show.alts.add',
          edit: 'cms.files.show.alts.edit',
          empty: 'cms.files.show.alts.empty',
          close: 'cms.files.show.alts.close',
          delete: {
            value: 'cms.files.show.alts.delete.value',
            confirm: 'cms.files.show.alts.delete.confirm',
          },
          form: {
            update: 'cms.files.show.alts.form.update',
            submit: 'cms.files.show.alts.form.submit',
            cancel: 'cms.files.show.alts.form.cancel',
            locale: {
              value: 'cms.files.show.alts.form.locale.value',
            },
            key: {
              value: 'cms.files.show.alts.form.key.value',
              placeholder: 'cms.files.show.alts.form.key.placeholder',
            },
            alt_text: {
              value: 'cms.files.show.alts.form.alt_text.value',
              placeholder: 'cms.files.show.alts.form.alt_text.placeholder',
            },
          },
        },
      }),
    })
  }

  async show(ctx: HttpContext) {
    const { inertia, params } = ctx

    const { id } = await showFileValidator.validate(params)
    const file = await this.getFileDetailAction.execute({ id })

    return (inertia.render as any)('file/cms/show', {
      file: FileTransformer.transform(file),
      translations: this.i18n.buildPayload({
        title: this.i18n.entry('cms.files.show.title', { name: '{name}' }),
        actions: {
          back: 'cms.files.list.title',
          delete: {
            value: this.i18n.entry('cms.files.delete.title', { name: '{name}' }),
            confirm: 'cms.files.delete.confirm',
          },
        },
        info: {
          name: 'cms.files.show.info.name',
          type: 'cms.files.show.info.type',
          size: 'cms.files.show.info.size',
          uploaded_at: 'cms.files.show.info.uploaded_at',
          value: 'cms.files.show.info.value',
        },
        alts: {
          value: 'cms.files.show.alts.value',
          add: 'cms.files.show.alts.add',
          delete: {
            confirm: 'cms.files.show.alts.delete.confirm',
          },
          form: {
            update: 'cms.files.show.alts.form.update',
            submit: 'cms.files.show.alts.form.submit',
            cancel: 'cms.files.show.alts.form.cancel',
            locale: {
              value: 'cms.files.show.alts.form.locale.value',
            },
            key: {
              value: 'cms.files.show.alts.form.key.value',
              placeholder: 'cms.files.show.alts.form.key.placeholder',
            },
            alt_text: {
              value: 'cms.files.show.alts.form.alt_text.value',
              placeholder: 'cms.files.show.alts.form.alt_text.placeholder',
            },
          },
        },
      }),
    })
  }

  async upload(ctx: HttpContext) {
    const { request, response, auth, session } = ctx

    const file = request.file('file')
    const folderId = request.input('folder_id', null)
    const user = auth.getUserOrFail()

    if (!file) {
      session.flash('error', this.i18n.translate('file.no_file_provided'))
      return response.redirect().back()
    }

    await this.uploadFileAction.execute({
      file,
      folderId: folderId ? Number(folderId) : null,
      uploadedBy: user.id,
    })

    session.flash('success', this.i18n.translate('file.uploaded'))

    return response.redirect().back()
  }

  async move(ctx: HttpContext) {
    const { params, request, response, session } = ctx

    const { id } = await showFileValidator.validate(params)
    const payload = await moveFileValidator.validate(request.all())

    await this.moveFileAction.execute({ id, folderId: payload.folder_id ?? null })

    session.flash('success', this.i18n.translate('file.moved'))

    return response.redirect().back()
  }

  async destroy(ctx: HttpContext) {
    const { params, response, session } = ctx

    const { id } = await showFileValidator.validate(params)

    await this.deleteFileAction.execute({ id })

    session.flash('success', this.i18n.translate('file.deleted'))

    return response.redirect().toRoute('admin.files.render')
  }

  async upsertAlt(ctx: HttpContext) {
    const { params, request, response } = ctx

    const { id } = await showFileValidator.validate(params)
    const payload = await upsertAltValidator.validate(request.all())

    await this.upsertFileAltAction.execute({
      fileId: id,
      locale: payload.locale,
      key: payload.key,
      value: payload.value,
    })

    return response.ok({ message: this.i18n.translate('file.alt.updated') })
  }

  async deleteAlt(ctx: HttpContext) {
    const { params, request, response } = ctx

    const { id } = await showFileValidator.validate(params)
    const payload = await deleteAltValidator.validate(request.all())

    await this.deleteFileAltAction.execute({ fileId: id, locale: payload.locale, key: payload.key })

    return response.ok({ message: this.i18n.translate('file.alt.deleted') })
  }
}
