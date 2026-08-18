import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import type { Infer } from '@vinejs/vine/types'
import { ListRootFoldersAction } from '#actions/file_folder/list_root_folders_action'
import { CreateFolderAction } from '#actions/file_folder/create_folder_action'
import { GetFolderDetailAction } from '#actions/file_folder/get_folder_detail_action'
import { ListFolderChildrenAction } from '#actions/file_folder/list_folder_children_action'
import { RenameFolderAction } from '#actions/file_folder/rename_folder_action'
import { DeleteFolderAction } from '#actions/file_folder/delete_folder_action'
import { showFileValidator, createFolderValidator, updateFolderValidator } from '#validators/file'
import FileFolderTransformer from '#transformers/file_folder_transformer'
import { type RestEndpoint, type AnyRestEndpoint, handleRest } from '#rest/rest_resource'

type FolderListResult = Awaited<ReturnType<ListRootFoldersAction['execute']>>
type FolderDetail = Awaited<ReturnType<GetFolderDetailAction['execute']>>
type FolderChildren = Awaited<ReturnType<ListFolderChildrenAction['execute']>>
type FolderCreateResult = Awaited<ReturnType<CreateFolderAction['execute']>>
type FolderRenameResult = Awaited<ReturnType<RenameFolderAction['execute']>>
type FolderDeleteResult = Awaited<ReturnType<DeleteFolderAction['execute']>>

type FolderIdPayload = Infer<typeof showFileValidator>
type FolderCreatePayload = Infer<typeof createFolderValidator>
type FolderUpdatePayload = Infer<typeof updateFolderValidator>

/**
 * Endpoint declarations for the folders REST resource.
 */
export interface FoldersEndpoints {
  index: RestEndpoint<undefined, unknown, FolderListResult, FolderListResult>
  show: RestEndpoint<undefined, FolderIdPayload, FolderDetail, FolderDetail>
  children: RestEndpoint<{ id: number }, unknown, FolderChildren, FolderChildren>
  store: RestEndpoint<undefined, FolderCreatePayload, FolderCreateResult, FolderCreateResult>
  update: RestEndpoint<undefined, FolderUpdatePayload, FolderRenameResult, FolderRenameResult>
  destroy: RestEndpoint<undefined, FolderIdPayload, FolderDeleteResult, FolderDeleteResult>
}

/**
 * Declarative folders REST resource.
 *
 * Owns the folders endpoint declarations executed by the shared
 * {@link handleRest} pipeline; the `/api/v1/admin/folders` controllers reduce
 * to one-line adapters over `handle()`.
 */
@inject()
export default class FoldersResource {
  constructor(
    protected listRootFoldersAction: ListRootFoldersAction,
    protected createFolderAction: CreateFolderAction,
    protected getFolderDetailAction: GetFolderDetailAction,
    protected listFolderChildrenAction: ListFolderChildrenAction,
    protected renameFolderAction: RenameFolderAction,
    protected deleteFolderAction: DeleteFolderAction
  ) {}

  readonly endpoints: FoldersEndpoints = {
    index: {
      execute: () => this.listRootFoldersAction.execute(),
      transform: (entity) => FileFolderTransformer.transform(entity),
    },
    show: {
      input: (context) => context.params,
      validator: () => showFileValidator,
      execute: (_context, _prepared, payload) =>
        this.getFolderDetailAction.execute({ id: payload.id }),
      transform: (entity) => FileFolderTransformer.transform(entity),
    },
    children: {
      prepare: async (context) => {
        const { id } = await showFileValidator.validate(context.params)

        return { id }
      },
      execute: async (_context, prepared) => {
        await this.getFolderDetailAction.execute({ id: prepared.id })

        return this.listFolderChildrenAction.execute({ parentId: prepared.id })
      },
      transform: (entity) => FileFolderTransformer.transform(entity),
    },
    store: {
      status: 201,
      validator: () => createFolderValidator,
      execute: (_context, _prepared, payload) =>
        this.createFolderAction.execute({
          name: payload.name,
          parentId: payload.parentId ?? null,
        }),
      transform: (entity) => FileFolderTransformer.transform(entity),
    },
    update: {
      input: (context) => ({
        id: Number(context.params.id),
        name: context.request.input('name'),
      }),
      validator: () => updateFolderValidator,
      execute: (_context, _prepared, payload) =>
        this.renameFolderAction.execute({ id: payload.id, name: payload.name }),
      transform: (entity) => FileFolderTransformer.transform(entity),
    },
    destroy: {
      status: 204,
      input: (context) => context.params,
      validator: () => showFileValidator,
      execute: (_context, _prepared, payload) =>
        this.deleteFolderAction.execute({ id: payload.id }),
    },
  }

  /**
   * Dispatch a REST action to its declared endpoint.
   */
  async handle(route: keyof FoldersEndpoints, ctx: HttpContext): Promise<void> {
    const endpoint = this.endpoints[route] as AnyRestEndpoint

    await handleRest(ctx, endpoint)
  }
}
