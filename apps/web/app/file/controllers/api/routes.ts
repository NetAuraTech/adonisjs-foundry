/*
|--------------------------------------------------------------------------
| File API routes
|--------------------------------------------------------------------------
|
| Versioned REST API (access-token guard) for files and folders.
| Self-registers on import (see `app/file/routes.ts`), gated by the
| `adminApi` feature flag. Public URLs live under
| `/api/v1/admin/{files,folders}`; route names carry the
| `api.v1.admin.file` prefix.
|
*/

import router from '@adonisjs/core/services/router';
import vine from '@vinejs/vine';
import { enabledAuthGuards } from '#config/auth';
import features from '#config/features';
import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import { apiClientThrottle } from '#start/limiter';
import { permissions } from '#start/permissions';
import { maintenanceMiddleware } from '#transport/core/maintenance';
import { registerApiDoc, type ApiOperationDoc, type JsonSchema } from '#transport/core/openapi/api_docs_registry';
import { errorSchema, dataEnvelope } from '#transport/core/openapi/schemas';
import { filesEndpointsDocs } from '#transport/file/rest/files_resource';
import { foldersEndpointsDocs } from '#transport/file/rest/folders_resource';

/**
 * The admin JSON surface is shared: the in-repo admin UI (session guard) and
 * external API clients (access-token guard) consume the same endpoints.
 * Guards that are disabled in `config/auth.ts` must never reach
 * `authenticateUsing`, hence the conditional list.
 */
const apiGuards = enabledAuthGuards.api ? (['web', 'api'] as const) : (['web'] as const);

/**
 * The file-upload body: a multipart form with the required `file` field and
 * an optional target `folder_id`. The endpoint reads the multipart request
 * directly (no Vine validator), so this mirror documents its contract.
 */
const uploadFileBodyValidator = vine.create({
	file: vine.string().minLength(1),
	folder_id: vine.number().positive().optional(),
});

/** The file payload, as shaped by `FileTransformer` (lean admin/API shape). */
const fileSchema: JsonSchema = {
	type: 'object',
	properties: {
		id: { type: 'number' },
		filename: { type: 'string' },
		originalName: { type: 'string' },
		mimeType: { type: 'string' },
		folderId: { type: 'number', nullable: true },
		extension: { type: 'string' },
		url: { type: 'string' },
		type: { type: 'string' },
		alt: { type: 'string', nullable: true },
	},
};

/** Docs for the file-upload route (not a thin endpoint dispatch). */
const uploadFileDoc: ApiOperationDoc = {
	summary: 'Upload a file',
	description: 'Multipart form with a required `file` field and an optional `folder_id` target.',
	tags: ['Files'],
	request: [{ validator: uploadFileBodyValidator, in: 'body', contentType: 'multipart/form-data' }],
	responses: {
		'201': { description: 'The uploaded file.', schema: dataEnvelope(fileSchema) },
		'400': { description: 'The `file` field is missing.', schema: errorSchema },
	},
};

if (features.adminApi) {
	registerApiDoc('api.v1.admin.file.files.index', filesEndpointsDocs.index);
	registerApiDoc('api.v1.admin.file.files.store', uploadFileDoc);
	registerApiDoc('api.v1.admin.file.files.show', filesEndpointsDocs.show);
	registerApiDoc('api.v1.admin.file.files.move', filesEndpointsDocs.move);
	registerApiDoc('api.v1.admin.file.files.destroy', filesEndpointsDocs.destroy);
	registerApiDoc('api.v1.admin.file.files.upsert_alt', filesEndpointsDocs.upsertAlt);
	registerApiDoc('api.v1.admin.file.files.delete_alt', filesEndpointsDocs.deleteAlt);
	registerApiDoc('api.v1.admin.file.folders.index', foldersEndpointsDocs.index);
	registerApiDoc('api.v1.admin.file.folders.store', foldersEndpointsDocs.store);
	registerApiDoc('api.v1.admin.file.folders.show', foldersEndpointsDocs.show);
	registerApiDoc('api.v1.admin.file.folders.children', foldersEndpointsDocs.children);
	registerApiDoc('api.v1.admin.file.folders.update', foldersEndpointsDocs.update);
	registerApiDoc('api.v1.admin.file.folders.destroy', foldersEndpointsDocs.destroy);

	router
		.group(() => {
			router
				.group(() => {
					// Files
					router
						.group(() => {
							router
								.get('/', [controllers.file.api.FilesApi, 'index'])
								.as('file.files.index')
								.use([middleware.permission({ permissions: [permissions.files.view] })]);
							router
								.post('/', [controllers.file.api.FilesUploadApi, 'store'])
								.as('file.files.store')
								.use([middleware.permission({ permissions: [permissions.files.create] })]);
							router
								.get('/:id', [controllers.file.api.FilesShowApi, 'show'])
								.as('file.files.show')
								.use([middleware.permission({ permissions: [permissions.files.view] })]);
							router
								.put('/:id/move', [controllers.file.api.FilesApi, 'move'])
								.as('file.files.move')
								.use([middleware.permission({ permissions: [permissions.files.update] })]);
							router
								.delete('/:id', [controllers.file.api.FilesDeleteApi, 'destroy'])
								.as('file.files.destroy')
								.use([middleware.permission({ permissions: [permissions.files.delete] })]);
							router
								.put('/:id/alt', [controllers.file.api.FilesAltApi, 'upsertAlt'])
								.as('file.files.upsert_alt')
								.use([middleware.permission({ permissions: [permissions.files.update] })]);
							router
								.delete('/:id/alt', [controllers.file.api.FilesAltApi, 'deleteAlt'])
								.as('file.files.delete_alt')
								.use([middleware.permission({ permissions: [permissions.files.update] })]);
						})
						.prefix('files');

					// Folders
					router
						.group(() => {
							router
								.get('/', [controllers.file.api.FoldersApi, 'index'])
								.as('file.folders.index')
								.use([middleware.permission({ permissions: [permissions.folders.view] })]);
							router
								.post('/', [controllers.file.api.FoldersApi, 'store'])
								.as('file.folders.store')
								.use([middleware.permission({ permissions: [permissions.folders.create] })]);
							router
								.get('/:id', [controllers.file.api.FoldersShowApi, 'show'])
								.as('file.folders.show')
								.use([middleware.permission({ permissions: [permissions.folders.view] })]);
							router
								.get('/:id/children', [controllers.file.api.FoldersShowApi, 'children'])
								.as('file.folders.children')
								.use([middleware.permission({ permissions: [permissions.folders.view] })]);
							router
								.put('/:id', [controllers.file.api.FoldersUpdateApi, 'update'])
								.as('file.folders.update')
								.use([middleware.permission({ permissions: [permissions.folders.update] })]);
							router
								.delete('/:id', [controllers.file.api.FoldersDeleteApi, 'destroy'])
								.as('file.folders.destroy')
								.use([middleware.permission({ permissions: [permissions.folders.delete] })]);
						})
						.prefix('folders');
				})
				.prefix('admin')
				.as('admin')
				.use([...maintenanceMiddleware, middleware.auth({ guards: [...apiGuards] }), apiClientThrottle()]);
		})
		.prefix('api/v1')
		.as('api.v1');
}
