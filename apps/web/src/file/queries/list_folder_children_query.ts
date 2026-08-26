import FileFolder from '#file/models/file_folder';

/**
 * Read-side query for the direct children of a folder, ordered by name.
 */
export class ListFolderChildrenQuery {
	/**
	 * Execute the folder children query.
	 *
	 * @param parentId - The id of the folder whose children to retrieve.
	 * @returns The child folders ordered by name.
	 */
	async execute(parentId: number): Promise<FileFolder[]> {
		return FileFolder.query().where('parent_id', parentId).orderBy('name');
	}
}
