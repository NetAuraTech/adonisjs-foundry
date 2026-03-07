/**
 * Metadata describing a backup file, as stored or returned by a {@link StorageAdapter}.
 *
 * The `path` field is optional because its relevance depends on context:
 * it is typically present for local storage adapters and may be omitted
 * for remote adapters where only the `filename` key is meaningful.
 */
export interface BackupMetadata {
  /** Original filename of the backup archive (e.g. `backup-2024-01-15.zip`). */
  filename: string

  /**
   * Backup strategy used to produce this file.
   * - `full` — complete snapshot of the database and/or filesystem.
   * - `differential` — only the changes since the last full backup.
   */
  type: 'full' | 'differential'

  /** File size in bytes. */
  size: number

  /** Date and time at which the backup was created. */
  createdAt: Date

  /**
   * Absolute local path to the backup file.
   * Present when the backup is stored locally or has been downloaded.
   * Omitted for remote-only entries returned by cloud adapters.
   */
  path?: string
}

/**
 * Contract that every storage adapter must satisfy.
 *
 * A storage adapter abstracts the underlying persistence layer (local disk,
 * S3-compatible object storage, FTP, etc.) behind a uniform interface so that
 * the backup service can remain agnostic of where backups are ultimately stored.
 *
 * Implementations are expected to throw descriptive errors on unrecoverable
 * failures; boolean return values indicate the outcome of well-defined
 * operations only (upload, download, delete, exists).
 *
 * @example
 * class S3Adapter implements StorageAdapter {
 *   readonly name = 's3'
 *   // ...
 * }
 */
export interface StorageAdapter {
  /**
   * Human-readable identifier for the storage provider (e.g. `'local'`, `'s3'`, `'ftp'`).
   * Used in logs and error messages to distinguish between adapters.
   */
  readonly name: string

  /**
   * Verifies that the adapter is properly configured and that the underlying
   * storage is reachable.
   *
   * Should perform a lightweight connectivity check (e.g. a HEAD request or
   * a directory stat) without transferring any backup data.
   *
   * @returns `true` if the storage is available, `false` otherwise.
   *
   * @example
   * if (!(await adapter.isAvailable())) {
   *   throw new Error(`Storage adapter "${adapter.name}" is unavailable`)
   * }
   */
  isAvailable(): Promise<boolean>

  /**
   * Uploads a local backup file to the storage backend.
   *
   * @param localPath - Absolute path to the backup file on the local filesystem.
   * @param remotePath - Destination path or storage key (e.g. `backups/2024-01-15.zip`).
   * @returns `true` if the upload completed successfully, `false` otherwise.
   *
   * @example
   * const ok = await adapter.upload('/tmp/backup.zip', 'backups/backup.zip')
   */
  upload(localPath: string, remotePath: string): Promise<boolean>

  /**
   * Downloads a backup file from the storage backend to the local filesystem.
   *
   * @param remotePath - Remote path or storage key of the backup to retrieve.
   * @param localPath - Absolute local path where the file should be written.
   * @returns `true` if the download completed successfully, `false` otherwise.
   *
   * @example
   * const ok = await adapter.download('backups/backup.zip', '/tmp/backup.zip')
   */
  download(remotePath: string, localPath: string): Promise<boolean>

  /**
   * Deletes a backup file from the storage backend.
   *
   * @param remotePath - Remote path or storage key of the backup to delete.
   * @returns `true` if the file was deleted, `false` if it could not be found
   *   or removed.
   *
   * @example
   * await adapter.delete('backups/old-backup.zip')
   */
  delete(remotePath: string): Promise<boolean>

  /**
   * Lists all backups currently held in the storage backend.
   *
   * Implementations should return entries sorted by `createdAt` in descending
   * order (most recent first) where possible.
   *
   * @returns An array of {@link BackupMetadata} objects, one per backup file.
   *   Returns an empty array if no backups are stored.
   *
   * @example
   * const backups = await adapter.list()
   * const latest = backups[0]
   */
  list(): Promise<BackupMetadata[]>

  /**
   * Checks whether a specific backup file exists in the storage backend.
   *
   * @param remotePath - Remote path or storage key to check.
   * @returns `true` if the file exists, `false` otherwise.
   *
   * @example
   * if (await adapter.exists('backups/backup.zip')) {
   *   await adapter.download('backups/backup.zip', '/tmp/restore.zip')
   * }
   */
  exists(remotePath: string): Promise<boolean>

  /**
   * Returns the amount of free space available in the storage backend, in bytes.
   *
   * Returns `null` for adapters where free space is not a meaningful concept
   * (e.g. S3-compatible object storage with no configured quota) or cannot
   * be determined programmatically.
   *
   * @returns Free space in bytes, or `null` if not applicable.
   *
   * @example
   * const free = await adapter.getFreeSpace()
   * if (free !== null && free < MIN_REQUIRED_SPACE) {
   *   throw new InsufficientStorageException()
   * }
   */
  getFreeSpace(): Promise<number | null>
}
