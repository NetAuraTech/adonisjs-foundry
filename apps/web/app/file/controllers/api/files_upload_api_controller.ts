import { inject } from '@adonisjs/core';
import FileTransformer from '#app/file/transformers/file_transformer';
import { UploadFileAction } from '#file/actions/file/upload_file_action';
import type { HttpContext } from '@adonisjs/core/http';

/**
 * POST /api/v1/admin/files — upload a file (multipart `file` field).
 */
@inject()
export default class FilesUploadApiController {
	constructor(protected uploadFileAction: UploadFileAction) {}

	async store(ctx: HttpContext) {
		const { request, response, auth, serialize } = ctx;
		const file = request.file('file');

		if (!file) {
			return response.badRequest({
				error: { code: 'E_NO_FILE', message: 'file field is required' },
			});
		}

		const result = await this.uploadFileAction.execute({
			file: file!,
			folderId: request.input('folder_id') ? Number(request.input('folder_id')) : null,
			uploadedBy: auth.getUserOrFail().id,
		});

		const serialized = await serialize(FileTransformer.transform(result));

		return response.created(serialized);
	}
}
