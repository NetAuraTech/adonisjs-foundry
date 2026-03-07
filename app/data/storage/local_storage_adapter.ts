import { mkdir, copyFile, unlink, stat, readdir, statfs } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { existsSync } from 'node:fs'
import { inject } from '@adonisjs/core'
import { type BackupMetadata, type StorageAdapter } from '#contracts/backup/storage_adapter'
import { LogService } from '#services/logging/log_service'

/**
 * {@link StorageAdapter} implementation that persists backup files on the local filesystem.
 *
 * Files are stored under a configurable `basePath` directory. The adapter
 * creates the directory automatically if it does not exist. Upload and download
 * operations are implemented as local file copies, making this adapter suitable
 * for single-server deployments or as a staging area before forwarding to a
 * remote adapter.
 *
 * Backup filenames must follow the pattern
 * `backup-(full|differential)-YYYY-MM-DD-HHmmss` to be recognized by {@link list}.
 * Files that do not match this pattern are silently ignored.
 *
 * @example
 * const adapter = new LocalStorageAdapter('/var/backups/foundry')
 * await adapter.upload('/tmp/backup.zip', 'backup-full-2024-01-15-120000.zip')
 */
@inject()
export default class LocalStorageAdapter implements StorageAdapter {
  readonly name = 'local'

  /**
   * @param basePath - Absolute path to the root directory where backups are stored.
   *   The directory is created recursively on first use if it does not already exist.
   * @param logService - Application log service used to record storage operations.
   */
  constructor(
    private basePath: string,
    private logService: LogService
  ) {}

  /**
   * Ensures the base storage directory exists and is writable.
   *
   * Attempts to create the directory (including any missing parent directories)
   * and returns `true` on success. Returns `false` if the directory cannot be
   * created or accessed.
   *
   * @returns `true` if local storage is available, `false` otherwise.
   *
   * @example
   * if (!(await adapter.isAvailable())) {
   *   throw new Error('Local storage is not available')
   * }
   */
  async isAvailable(): Promise<boolean> {
    try {
      await mkdir(this.basePath, { recursive: true })
      return true
    } catch (error) {
      this.logService.error({
        message: 'Local storage not available',
        context: { basePath: this.basePath, error: error.message },
      })
      return false
    }
  }

  /**
   * Copies a local backup file into the storage directory.
   *
   * The destination directory tree under `basePath` is created automatically
   * if it does not exist, allowing `remotePath` to include subdirectories
   * (e.g. `2024/01/backup.zip`).
   *
   * @param localPath - Absolute path to the source backup file.
   * @param remotePath - Relative destination path within `basePath`
   *   (e.g. `backup-full-2024-01-15-120000.zip`).
   * @returns `true` if the file was copied successfully, `false` otherwise.
   *
   * @example
   * await adapter.upload('/tmp/backup.zip', 'backup-full-2024-01-15-120000.zip')
   */
  async upload(localPath: string, remotePath: string): Promise<boolean> {
    try {
      const fullPath = join(this.basePath, remotePath)
      const dir = dirname(fullPath)

      await mkdir(dir, { recursive: true })
      await copyFile(localPath, fullPath)

      this.logService.logBusiness('backup.local.uploaded', { localPath, remotePath: fullPath })

      return true
    } catch (error) {
      this.logService.error({
        message: 'Failed to upload backup to local storage',
        context: { localPath, remotePath, error: error.message },
      })
      return false
    }
  }

  /**
   * Copies a backup file from the storage directory to a local destination path.
   *
   * The destination directory is created automatically if it does not exist.
   *
   * @param remotePath - Relative path of the backup within `basePath`.
   * @param localPath - Absolute local path where the file should be written.
   * @returns `true` if the file was copied successfully, `false` otherwise.
   *
   * @example
   * await adapter.download('backup-full-2024-01-15-120000.zip', '/tmp/restore.zip')
   */
  async download(remotePath: string, localPath: string): Promise<boolean> {
    try {
      const fullPath = join(this.basePath, remotePath)
      const dir = dirname(localPath)

      await mkdir(dir, { recursive: true })
      await copyFile(fullPath, localPath)

      this.logService.logBusiness('backup.local.downloaded', { remotePath: fullPath, localPath })

      return true
    } catch (error) {
      this.logService.error({
        message: 'Failed to download backup from local storage',
        context: { remotePath, localPath, error: error.message },
      })
      return false
    }
  }

  /**
   * Permanently removes a backup file from the storage directory.
   *
   * @param remotePath - Relative path of the backup to delete within `basePath`.
   * @returns `true` if the file was deleted, `false` if an error occurred
   *   (including the file not being found).
   *
   * @example
   * await adapter.delete('backup-full-2024-01-15-120000.zip')
   */
  async delete(remotePath: string): Promise<boolean> {
    try {
      const fullPath = join(this.basePath, remotePath)
      await unlink(fullPath)

      this.logService.logBusiness('backup.local.deleted', { remotePath: fullPath })

      return true
    } catch (error) {
      this.logService.error({
        message: 'Failed to delete backup from local storage',
        context: { remotePath, error: error.message },
      })
      return false
    }
  }

  /**
   * Scans the storage directory recursively and returns metadata for all
   * recognized backup files.
   *
   * Only files whose names match the pattern
   * `backup-(full|differential)-YYYY-MM-DD-HHmmss` are included.
   * Results are sorted by `createdAt` in descending order (most recent first).
   *
   * @returns An array of {@link BackupMetadata} objects. Returns an empty array
   *   if the directory cannot be read or contains no matching files.
   *
   * @example
   * const backups = await adapter.list()
   * console.log(backups[0].filename) // most recent backup
   */
  async list(): Promise<BackupMetadata[]> {
    try {
      const files = await this.scanDirectory(this.basePath)
      const backups: BackupMetadata[] = []

      for (const file of files) {
        const fullPath = join(this.basePath, file)
        const stats = await stat(fullPath)

        const match = file.match(/backup-(full|differential)-(\d{4}-\d{2}-\d{2})-(\d{6})/)
        if (!match) continue

        backups.push({
          filename: file,
          type: match[1] as 'full' | 'differential',
          size: stats.size,
          createdAt: this.parseFilenameDate(match[2], match[3]),
          path: fullPath,
        })
      }

      return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      this.logService.error({
        message: 'Failed to list backups from local storage',
        context: { basePath: this.basePath, error: error.message },
      })
      return []
    }
  }

  /**
   * Checks whether a backup file exists at the given relative path.
   *
   * Uses a synchronous existence check to avoid race conditions between
   * listing and accessing files.
   *
   * @param remotePath - Relative path of the backup within `basePath`.
   * @returns `true` if the file exists, `false` otherwise.
   *
   * @example
   * if (await adapter.exists('backup-full-2024-01-15-120000.zip')) {
   *   await adapter.download('backup-full-2024-01-15-120000.zip', '/tmp/restore.zip')
   * }
   */
  async exists(remotePath: string): Promise<boolean> {
    const fullPath = join(this.basePath, remotePath)
    return existsSync(fullPath)
  }

  /**
   * Returns the number of free bytes available on the filesystem partition
   * that hosts `basePath`.
   *
   * Uses `statfs` to compute available space as `bavail × bsize`.
   * Returns `null` if the filesystem statistics cannot be retrieved.
   *
   * @returns Free space in bytes, or `null` on failure.
   *
   * @example
   * const free = await adapter.getFreeSpace()
   * if (free !== null && free < MINIMUM_REQUIRED_BYTES) {
   *   throw new InsufficientStorageException()
   * }
   */
  async getFreeSpace(): Promise<number | null> {
    try {
      const stats = await statfs(this.basePath)
      return stats.bavail * stats.bsize
    } catch (error) {
      this.logService.error({
        message: 'Failed to get free space from local storage',
        context: { basePath: this.basePath, error: error.message },
      })
      return null
    }
  }

  /**
   * Recursively walks a directory and returns the relative paths of all files
   * whose names start with `backup-`.
   *
   * Subdirectory paths are prepended to filenames so that the returned paths
   * are relative to `basePath` and can be passed directly to {@link list}.
   *
   * @param dir - Absolute path of the directory to scan.
   * @returns An array of relative file paths matching the backup naming prefix.
   */
  private async scanDirectory(dir: string): Promise<string[]> {
    const files: string[] = []

    try {
      const entries = await readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (entry.isDirectory()) {
          const subFiles = await this.scanDirectory(fullPath)
          files.push(...subFiles.map((f) => join(entry.name, f)))
        } else if (entry.name.startsWith('backup-')) {
          files.push(entry.name)
        }
      }
    } catch (error) {
      this.logService.warn({
        message: 'Failed to scan directory',
        context: { dir, error: error.message },
      })
    }

    return files
  }

  /**
   * Reconstructs a `Date` object from the date and time fragments extracted
   * from a backup filename.
   *
   * @param date - Date segment in `YYYY-MM-DD` format.
   * @param time - Time segment as a 6-digit string `HHmmss` (e.g. `143022`).
   * @returns The corresponding `Date` in local time.
   *
   * @example
   * this.parseFilenameDate('2024-01-15', '143022') // 2024-01-15 14:30:22
   */
  private parseFilenameDate(date: string, time: string): Date {
    const [year, month, day] = date.split('-').map(Number)
    const hour = Number.parseInt(time.slice(0, 2))
    const minute = Number.parseInt(time.slice(2, 4))
    const second = Number.parseInt(time.slice(4, 6))

    return new Date(year, month - 1, day, hour, minute, second)
  }
}
