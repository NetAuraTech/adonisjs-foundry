import drive from '@adonisjs/drive/services/main';
import { BackupMetadata } from '#backup/domain/backup';
import backupConfig from '#config/backup';
import { BaseQuery } from '#core/queries/base_query';

/**
 * Read-side query listing the backup artifacts stored on the configured disk,
 * newest first.
 *
 * Storage failures are swallowed as an empty list so callers degrade to
 * "no backups" instead of erroring on an unavailable disk.
 */
export class ListBackupsQuery extends BaseQuery {
	/**
	 * Execute the backup listing query.
	 *
	 * @returns An array of {@link BackupMetadata} sorted newest first, or an
	 *   empty array when the disk is unavailable or holds no backups.
	 *
	 * @example
	 * const backups = await listBackupsQuery.execute()
	 */
	async execute(): Promise<BackupMetadata[]> {
		try {
			const disk = drive.use(backupConfig.storage.disk as Parameters<typeof drive.use>[0]);
			const prefix = `${backupConfig.storage.prefix}/`;
			const { objects } = await disk.listAll(prefix);
			const backups: BackupMetadata[] = [];

			for (const object of objects) {
				if (object.isDirectory) continue;

				const filename = object.key.replace(prefix, '');
				const meta = await disk.getMetaData(object.key);
				const backup = BackupMetadata.fromStorageObject(filename, meta, object.key);
				if (!backup) continue;

				backups.push(backup);
			}

			return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
		} catch {
			return [];
		}
	}
}
