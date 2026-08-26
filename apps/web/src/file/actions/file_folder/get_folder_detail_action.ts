import { inject } from '@adonisjs/core';
import RowNotFoundException from '#core/exceptions/row_not_found_exception';
import FileFolder from '#file/models/file_folder';
import { GetFolderDetailQuery } from '#file/queries/get_folder_detail_query';

interface GetFolderDetailPayload {
	id: number;
}

/**
 * Retrieve a single folder by primary key.
 */
@inject()
export class GetFolderDetailAction {
	constructor(protected getFolderDetailQuery: GetFolderDetailQuery) {}

	/**
	 * Execute folder detail lookup.
	 *
	 * @param payload - The folder ID to retrieve.
	 * @returns The {@link FileFolder}.
	 * @throws {RowNotFoundException} When no record exists for the given id.
	 *
	 * @example
	 * const folder = await getFolderDetailAction.execute({ id: 1 })
	 */
	async execute(payload: GetFolderDetailPayload): Promise<FileFolder> {
		const folder = await this.getFolderDetailQuery.execute(payload.id);

		if (!folder) {
			throw new RowNotFoundException(FileFolder);
		}

		return folder;
	}
}
