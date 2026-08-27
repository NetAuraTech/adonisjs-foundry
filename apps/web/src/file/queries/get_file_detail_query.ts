import CmsFile from '#file/models/file';

/**
 * Read-side query for a single file by primary key, preloading its alt
 * entries. Returns `null` when no file matches the id.
 */
export class GetFileDetailQuery {
	/**
	 * Execute the file detail query.
	 *
	 * @param id - The file primary key to retrieve.
	 * @returns The {@link CmsFile} with alts preloaded, or `null`.
	 */
	async execute(id: number): Promise<CmsFile | null> {
		return CmsFile.query().where('id', id).preload('alts').first();
	}
}
