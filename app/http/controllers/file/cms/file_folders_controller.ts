import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { createFolderValidator, updateFolderValidator, showFileValidator } from '#validators/file'
import FileFolderTransformer from '#transformers/file_folder_transformer'
import { ListRootFoldersAction } from '#actions/file_folder/list_root_folders_action'
import { CreateFolderAction } from '#actions/file_folder/create_folder_action'
import { RenameFolderAction } from '#actions/file_folder/rename_folder_action'
import { DeleteFolderAction } from '#actions/file_folder/delete_folder_action'

@inject()
export default class FileFoldersController {
  constructor(
    protected listRootFoldersAction: ListRootFoldersAction,
    protected createFolderAction: CreateFolderAction,
    protected renameFolderAction: RenameFolderAction,
    protected deleteFolderAction: DeleteFolderAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, i18n } = ctx

    const roots = await this.listRootFoldersAction.execute()

    return inertia.render('file/cms/folders', {
      roots: FileFolderTransformer.transform(roots),
      translations: {
        title: i18n.t('cms.folders.list.title'),
        action: i18n.t('cms.files.list.title'),
        browse: i18n.t('cms.folders.list.browse'),
        help: i18n.t('cms.folders.form.help'),
        name: {
          root: i18n.t('cms.folders.form.name.root'),
          sub: i18n.t('cms.folders.form.name.sub'),
        },
        empty: {
          value: i18n.t('cms.folders.list.empty.value'),
          help: i18n.t('cms.folders.list.empty.help'),
        },
        actions: {
          add: i18n.t('cms.folders.list.add'),
          create: i18n.t('cms.folders.form.create'),
          update: i18n.t('cms.folders.form.update'),
          cancel: i18n.t('cms.folders.form.cancel'),
          rename: i18n.t('cms.folders.list.rename'),
          delete: {
            value: i18n.t('cms.folders.delete.title', { folder: '{folder}' }),
            confirm: i18n.t('cms.folders.delete.confirm'),
          },
        },
      },
    })
  }

  async execute(ctx: HttpContext) {
    const { request, response, session, i18n } = ctx

    const payload = await createFolderValidator.validate(request.all())

    await this.createFolderAction.execute({
      name: payload.name,
      parentId: payload.parentId ?? null,
    })

    session.flash('success', i18n.t('file.folder.created'))

    return response.redirect().toRoute('admin.file_folders.render')
  }

  async update(ctx: HttpContext) {
    const { params, request, response, session, i18n } = ctx

    const { id } = await showFileValidator.validate(params)
    const payload = await updateFolderValidator.validate({ ...request.all(), id })

    await this.renameFolderAction.execute({ id, name: payload.name })

    session.flash('success', i18n.t('file.folder.updated'))

    return response.redirect().toRoute('admin.file_folders.render')
  }

  async destroy(ctx: HttpContext) {
    const { params, response, session, i18n } = ctx

    const { id } = await showFileValidator.validate(params)

    await this.deleteFolderAction.execute({ id })

    session.flash('success', i18n.t('file.folder.deleted'))

    return response.redirect().toRoute('admin.file_folders.render')
  }
}
