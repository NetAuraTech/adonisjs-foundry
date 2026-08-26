import FileFolder from '#file/models/file_folder';

/**
 * Read-side query for the root folders of the file tree (folders with no
 * parent), ordered by name.
 */
export class ListRootFoldersQuery {
	/**
	 * Execute the root folders query.
	 *
	 * @returns The root folders ordered by name.
	 */
	async execute(): Promise<FileFolder[]> {
		return FileFolder.query().whereNull('parent_id').orderBy('name');
	}
}
