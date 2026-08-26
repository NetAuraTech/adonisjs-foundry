import FileFolder from '#file/models/file_folder';

/**
 * Read-side query for a single folder by primary key. Returns `null` when no
 * folder matches the id.
 */
export class GetFolderDetailQuery {
	/**
	 * Execute the folder detail query.
	 *
	 * @param id - The folder primary key to retrieve.
	 * @returns The {@link FileFolder}, or `null`.
	 */
	async execute(id: number): Promise<FileFolder | null> {
		return FileFolder.query().where('id', id).first();
	}
}
