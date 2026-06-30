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

@inject()
export default class FilesController {
  constructor(
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
    const { inertia, request, i18n } = ctx

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
      translations: {
        title: i18n.t('cms.files.list.title'),
        action: {
          folders: i18n.t('cms.files.list.action.folders'),
          upload: i18n.t('cms.files.list.action.upload'),
        },
        name: i18n.t('cms.files.form.name.value'),
        type: i18n.t('cms.files.form.type.value'),
        size: i18n.t('cms.files.form.size.value'),
        uploaded_at: i18n.t('cms.files.form.uploaded_at.value'),
        upload: {
          value: i18n.t('cms.files.upload.submit'),
          help: i18n.t('cms.files.upload.help'),
          remove: i18n.t('cms.files.upload.remove'),
          max_size: i18n.t('cms.files.upload.max_size', { size: '{size}' }),
          try_again: i18n.t('cms.files.upload.try_again'),
          error: {
            size: i18n.t('cms.files.upload.error.size', { max: '{max}' }),
          },
        },
        actions: {
          value: i18n.t('cms.files.actions'),
          show: i18n.t('cms.files.show.title'),
          delete: {
            value: i18n.t('cms.files.delete.title', { filename: '{filename}' }),
            confirm: i18n.t('cms.files.delete.confirm'),
          },
        },
        folders: {
          all: i18n.t('cms.files.list.folders.all'),
        },
        search: {
          filter: i18n.t('cms.files.search.filter'),
          value: i18n.t('cms.files.search.value'),
          placeholder: i18n.t('cms.files.search.placeholder'),
          type: {
            value: i18n.t('cms.files.search.type.value'),
            options: {
              placeholder: i18n.t('cms.files.search.type.options.placeholder'),
              image: i18n.t('cms.files.search.type.options.image'),
              video: i18n.t('cms.files.search.type.options.video'),
              audio: i18n.t('cms.files.search.type.options.audio'),
              pdf: i18n.t('cms.files.search.type.options.pdf'),
            },
          },
        },
        alts: {
          title: i18n.t('cms.files.show.alts.title'),
          add: i18n.t('cms.files.show.alts.add'),
          edit: i18n.t('cms.files.show.alts.edit'),
          empty: i18n.t('cms.files.show.alts.empty'),
          close: i18n.t('cms.files.show.alts.close'),
          delete: {
            value: i18n.t('cms.files.show.alts.delete.value'),
            confirm: i18n.t('cms.files.show.alts.delete.confirm'),
          },
          form: {
            update: i18n.t('cms.files.show.alts.form.update'),
            submit: i18n.t('cms.files.show.alts.form.submit'),
            cancel: i18n.t('cms.files.show.alts.form.cancel'),
            locale: {
              value: i18n.t('cms.files.show.alts.form.locale.value'),
            },
            key: {
              value: i18n.t('cms.files.show.alts.form.key.value'),
              placeholder: i18n.t('cms.files.show.alts.form.key.placeholder'),
            },
            alt_text: {
              value: i18n.t('cms.files.show.alts.form.alt_text.value'),
              placeholder: i18n.t('cms.files.show.alts.form.alt_text.placeholder'),
            },
          },
        },
      },
    })
  }

  async show(ctx: HttpContext) {
    const { inertia, params, i18n } = ctx

    const { id } = await showFileValidator.validate(params)
    const file = await this.getFileDetailAction.execute({ id })

    return (inertia.render as any)('file/cms/show', {
      file: FileTransformer.transform(file),
      translations: {
        title: i18n.t('cms.files.show.title', { name: '{name}' }),
        actions: {
          back: i18n.t('cms.files.list.title'),
          delete: {
            value: i18n.t('cms.files.delete.title', { name: '{name}' }),
            confirm: i18n.t('cms.files.delete.confirm'),
          },
        },
        info: {
          name: i18n.t('cms.files.show.info.name'),
          type: i18n.t('cms.files.show.info.type'),
          size: i18n.t('cms.files.show.info.size'),
          uploaded_at: i18n.t('cms.files.show.info.uploaded_at'),
          value: i18n.t('cms.files.show.info.value'),
        },
        alts: {
          value: i18n.t('cms.files.show.alts.value'),
          add: i18n.t('cms.files.show.alts.add'),
          delete: {
            value: i18n.t('cms.files.show.alts.delete.value'),
            confirm: i18n.t('cms.files.show.alts.delete.confirm'),
          },
          form: {
            update: i18n.t('cms.files.show.alts.form.update'),
            submit: i18n.t('cms.files.show.alts.form.submit'),
            cancel: i18n.t('cms.files.show.alts.form.cancel'),
            locale: {
              value: i18n.t('cms.files.show.alts.form.locale.value'),
            },
            key: {
              value: i18n.t('cms.files.show.alts.form.key.value'),
              placeholder: i18n.t('cms.files.show.alts.form.key.placeholder'),
            },
            alt_text: {
              value: i18n.t('cms.files.show.alts.form.alt_text.value'),
              placeholder: i18n.t('cms.files.show.alts.form.alt_text.placeholder'),
            },
          },
        },
      },
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

    await this.uploadFileAction.execute({
      file,
      folderId: folderId ? Number(folderId) : null,
      uploadedBy: user.id,
    })

    session.flash('success', i18n.t('file.uploaded'))

    return response.redirect().back()
  }

  async move(ctx: HttpContext) {
    const { params, request, response, session, i18n } = ctx

    const { id } = await showFileValidator.validate(params)
    const payload = await moveFileValidator.validate(request.all())

    await this.moveFileAction.execute({ id, folderId: payload.folder_id ?? null })

    session.flash('success', i18n.t('file.moved'))

    return response.redirect().back()
  }

  async destroy(ctx: HttpContext) {
    const { params, response, session, i18n } = ctx

    const { id } = await showFileValidator.validate(params)

    await this.deleteFileAction.execute({ id })

    session.flash('success', i18n.t('file.deleted'))

    return response.redirect().toRoute('admin.files.render')
  }

  async upsertAlt(ctx: HttpContext) {
    const { params, request, response, i18n } = ctx

    const { id } = await showFileValidator.validate(params)
    const payload = await upsertAltValidator.validate(request.all())

    await this.upsertFileAltAction.execute({
      fileId: id,
      locale: payload.locale,
      key: payload.key,
      value: payload.value,
    })

    return response.ok({ message: i18n.t('file.alt.updated') })
  }

  async deleteAlt(ctx: HttpContext) {
    const { params, request, response, i18n } = ctx

    const { id } = await showFileValidator.validate(params)
    const payload = await deleteAltValidator.validate(request.all())

    await this.deleteFileAltAction.execute({ fileId: id, locale: payload.locale, key: payload.key })

    return response.ok({ message: i18n.t('file.alt.deleted') })
  }
}
