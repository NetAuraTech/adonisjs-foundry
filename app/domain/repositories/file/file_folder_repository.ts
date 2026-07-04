import { transactionContext } from '#shared/context/transaction_context'
import FileFolder from '#models/file/file_folder'
import { BaseRepository } from '#repositories/base_repository'

/**
 * Handles all database operations for the {@link FileFolder} model.
 *
 * Manages folder hierarchy files inside a folder are NOT deleted when the
 * folder is removed; they are moved to root via the SET NULL FK constraint.
 */
export class FileFolderRepository extends BaseRepository {
  /**
   * Finds a folder by its primary key.
   *
   * @param id - The folder's primary key.
   * @returns The matching {@link FileFolder}, or `null` if not found.
   *
   * @example
   * const folder = await fileFolderRepository.findById(1)
   */
  async findById(id: number): Promise<FileFolder | null> {
    return FileFolder.query(this.client()).where('id', id).first()
  }

  /**
   * Returns all root-level folders (no parent), sorted alphabetically.
   *
   * @returns An array of top-level {@link FileFolder} records.
   *
   * @example
   * const roots = await fileFolderRepository.listRoots()
   */
  async listRoots(): Promise<FileFolder[]> {
    return FileFolder.query(this.client())
      .apply((s) => s.roots())
      .orderBy('name', 'asc')
  }

  /**
   * Returns the direct children of a given folder, sorted alphabetically.
   *
   * @param parentId - The primary key of the parent folder.
   * @returns An array of child {@link FileFolder} records.
   *
   * @example
   * const children = await fileFolderRepository.listChildren(5)
   */
  async listChildren(parentId: number): Promise<FileFolder[]> {
    return FileFolder.query(this.client()).where('parent_id', parentId).orderBy('name', 'asc')
  }

  /**
   * Creates and persists a new folder.
   *
   * @param data - The folder data including name and optional parent ID.
   * @returns The newly created {@link FileFolder}.
   *
   * @example
   * const folder = await fileFolderRepository.create({ name: 'Documents' })
   */
  async create(data: { name: string; parentId?: number | null }): Promise<FileFolder> {
    return FileFolder.create(
      {
        name: data.name,
        parentId: data.parentId ?? null,
      },
      this.client()
    )
  }

  /**
   * Updates an existing folder.
   *
   * @param folder - The {@link FileFolder} instance to update.
   * @param data - Partial fields to merge into the folder.
   * @returns The updated {@link FileFolder}.
   *
   * @example
   * const updated = await fileFolderRepository.update(folder, { name: 'New Name' })
   */
  async update(
    folder: FileFolder,
    data: Partial<{ name: string; parentId: number | null }>
  ): Promise<FileFolder> {
    folder.merge(data as any)
    await transactionContext.merge(folder)
    await folder.save()
    return folder
  }

  /**
   * Deletes a folder. Files inside are NOT deleted � they are moved to root
   * (folder_id set to null) via the SET NULL FK constraint.
   * Child folders are also set to root via the same constraint.
   *
   * @param id - The primary key of the folder to delete.
   *
   * @example
   * await fileFolderRepository.delete(3)
   */
  async delete(id: number): Promise<boolean> {
    const folder = await FileFolder.query(this.client()).where('id', id).firstOrFail()
    await folder.delete()
    return true
  }
}
