import CmsFile from '#file/models/file';
import FileAlt from '#file/models/file_alt';

/**
 * Read-side query for the alt entries of a file, ordered by locale then key.
 * Returns `null` when no file matches the id.
 */
export class ListFileAltsQuery {
	/**
	 * Execute the file alts query.
	 *
	 * @param fileId - The file whose alt entries to retrieve.
	 * @returns The ordered alt entries, or `null` when the file does not exist.
	 */
	async execute(fileId: number): Promise<FileAlt[] | null> {
		const file = await CmsFile.find(fileId);

		if (!file) {
			return null;
		}

		return FileAlt.query().where('file_id', fileId).orderBy('locale').orderBy('key');
	}
}
