import { createClient, type WebDAVClient, type FileStat, type DiskQuota } from 'webdav'
import { createReadStream, createWriteStream } from 'node:fs'
import { stat, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { inject } from '@adonisjs/core'
import { type BackupMetadata, type StorageAdapter } from '#contracts/backup/storage_adapter'
import { LogService } from '#services/logging/log_service'

/**
 * Configuration required to connect to a Nextcloud (or compatible WebDAV) server.
 */
export interface NextcloudConfig {
  /** Base URL of the Nextcloud instance (e.g. `https://cloud.example.com`). */
  url: string

  /** Nextcloud username used for WebDAV authentication. */
  username: string

  /** Nextcloud password or app token used for WebDAV authentication. */
  password: string

  /**
   * Remote directory path where backups are stored, relative to the user's
   * Nextcloud root (e.g. `/Backups/Foundry`).
   */
  path: string
}

/**
 * {@link StorageAdapter} implementation that stores backup files on a Nextcloud
 * server via the WebDAV protocol.
 *
 * Compatible with Nextcloud, ownCloud, and any standard WebDAV server.
 * The WebDAV endpoint is automatically derived from the provided base URL using
 * the Nextcloud convention (`/remote.php/dav/files/{username}`).
 *
 * Uploads use streaming to avoid loading the entire backup archive into memory.
 * Free space is retrieved via the WebDAV quota API when available; returns `null`
 * on servers that do not expose quota information.
 *
 * @example
 * const adapter = new NextcloudStorageAdapter(
 *   {
 *     url: 'https://cloud.example.com',
 *     username: 'admin',
 *     password: 'app-token',
 *     path: '/Backups/Foundry',
 *   },
 *   logService
 * )
 */
@inject()
export default class NextcloudStorageAdapter implements StorageAdapter {
  readonly name = 'nextcloud'
  private client: WebDAVClient

  /**
   * Creates a new `NextcloudStorageAdapter` and initializes the underlying
   * WebDAV client.
   *
   * A trailing slash on `config.url` is stripped automatically before the
   * WebDAV endpoint path is appended.
   *
   * @param config - Nextcloud connection and path settings.
   * @param logService - Application log service used to record storage operations.
   */
  constructor(
    private config: NextcloudConfig,
    private logService: LogService
  ) {
    const baseUrl = config.url.endsWith('/') ? config.url.slice(0, -1) : config.url
    const davUrl = `${baseUrl}/remote.php/dav/files/${config.username}`

    this.client = createClient(davUrl, {
      username: config.username,
      password: config.password,
    })
  }

  /**
   * Verifies that the Nextcloud server is reachable and that the configured
   * backup directory exists, creating it recursively if it does not.
   *
   * @returns `true` if the server is accessible and the directory is ready,
   *   `false` if the connection or directory creation fails.
   *
   * @example
   * if (!(await adapter.isAvailable())) {
   *   throw new Error('Nextcloud storage is unavailable')
   * }
   */
  async isAvailable(): Promise<boolean> {
    try {
      const exists = await this.client.exists(this.config.path)

      if (!exists) {
        await this.client.createDirectory(this.config.path, { recursive: true })
      }

      return true
    } catch (error) {
      this.logService.error({
        message: 'Nextcloud storage not available',
        context: { path: this.config.path, error: error.message },
      })
      return false
    }
  }

  /**
   * Streams a local backup file to Nextcloud via WebDAV `PUT`.
   *
   * The remote directory is created recursively if it does not exist.
   * The file is streamed directly from disk to avoid loading the entire
   * archive into memory. Any existing file at the same remote path is
   * overwritten.
   *
   * @param localPath - Absolute path to the source backup file on the local filesystem.
   * @param remotePath - Filename or relative path within the configured backup directory.
   * @returns `true` if the upload completed successfully, `false` otherwise.
   *
   * @example
   * await adapter.upload('/tmp/backup.zip', 'backup-full-2024-01-15-120000.zip')
   */
  async upload(localPath: string, remotePath: string): Promise<boolean> {
    try {
      const fileStream = createReadStream(localPath)
      const fileStat = await stat(localPath)
      const fullPath = this.getFullPath(remotePath)

      const dir = dirname(fullPath)
      const dirExists = await this.client.exists(dir)
      if (!dirExists) {
        await this.client.createDirectory(dir, { recursive: true })
      }

      await this.client.putFileContents(fullPath, fileStream, {
        contentLength: fileStat.size,
        overwrite: true,
      })

      this.logService.logBusiness('backup.nextcloud.uploaded', { localPath, remotePath: fullPath })

      return true
    } catch (error) {
      this.logService.error({
        message: 'Failed to upload backup to Nextcloud',
        context: { localPath, remotePath, error: error.message },
      })
      return false
    }
  }

  /**
   * Streams a backup file from Nextcloud to a local path via WebDAV `GET`.
   *
   * The destination directory is created recursively if it does not exist.
   * The file is written to disk using a stream pipeline to avoid buffering
   * the entire archive in memory.
   *
   * @param remotePath - Filename or relative path within the configured backup directory.
   * @param localPath - Absolute local path where the file should be written.
   * @returns `true` if the download completed successfully, `false` otherwise.
   *
   * @example
   * await adapter.download('backup-full-2024-01-15-120000.zip', '/tmp/restore.zip')
   */
  async download(remotePath: string, localPath: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(remotePath)
      const fileStream = this.client.createReadStream(fullPath)

      await mkdir(dirname(localPath), { recursive: true })

      const writeStream = createWriteStream(localPath)
      await pipeline(fileStream, writeStream)

      this.logService.logBusiness('backup.nextcloud.downloaded', {
        remotePath: fullPath,
        localPath,
      })

      return true
    } catch (error) {
      this.logService.error({
        message: 'Failed to download backup from Nextcloud',
        context: { remotePath, localPath, error: error.message },
      })
      return false
    }
  }

  /**
   * Deletes a backup file from Nextcloud via WebDAV `DELETE`.
   *
   * @param remotePath - Filename or relative path within the configured backup directory.
   * @returns `true` if the file was deleted successfully, `false` otherwise.
   *
   * @example
   * await adapter.delete('backup-full-2024-01-15-120000.zip')
   */
  async delete(remotePath: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(remotePath)
      await this.client.deleteFile(fullPath)

      this.logService.logBusiness('backup.nextcloud.deleted', { remotePath: fullPath })

      return true
    } catch (error) {
      this.logService.error({
        message: 'Failed to delete backup from Nextcloud',
        context: { remotePath, error: error.message },
      })
      return false
    }
  }

  /**
   * Recursively lists all files in the configured backup directory and returns
   * metadata for files matching the backup filename pattern
   * `backup-(full|differential)-YYYY-MM-DD-HHmmss`.
   *
   * Non-matching files and subdirectories are silently ignored.
   * The `createdAt` field is derived from the WebDAV `lastmod` property.
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
      const contents = await this.client.getDirectoryContents(this.config.path, { deep: true })
      const backups: BackupMetadata[] = []

      for (const item of contents as FileStat[]) {
        if (item.type !== 'file') continue

        const filename = item.basename
        const match = filename.match(/backup-(full|differential)-(\d{4}-\d{2}-\d{2})-(\d{6})/)
        if (!match) continue

        backups.push({
          filename,
          type: match[1] as 'full' | 'differential',
          size: item.size,
          createdAt: new Date(item.lastmod),
          path: item.filename,
        })
      }

      return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      this.logService.error({
        message: 'Failed to list backups from Nextcloud',
        context: { path: this.config.path, error: error.message },
      })
      return []
    }
  }

  /**
   * Checks whether a backup file exists at the given remote path.
   *
   * @param remotePath - Filename or relative path within the configured backup directory.
   * @returns `true` if the file exists, `false` otherwise (including on error).
   *
   * @example
   * if (await adapter.exists('backup-full-2024-01-15-120000.zip')) {
   *   await adapter.download('backup-full-2024-01-15-120000.zip', '/tmp/restore.zip')
   * }
   */
  async exists(remotePath: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(remotePath)
      return await this.client.exists(fullPath)
    } catch (error) {
      return false
    }
  }

  /**
   * Returns the available quota in bytes as reported by the Nextcloud WebDAV
   * quota API.
   *
   * Returns `null` if the server does not expose quota information, if the
   * available value is not a finite number (e.g. unlimited storage), or if the
   * request fails.
   *
   * @returns Available space in bytes, or `null` if not determinable.
   *
   * @example
   * const free = await adapter.getFreeSpace()
   * if (free !== null && free < MINIMUM_REQUIRED_BYTES) {
   *   throw new InsufficientStorageException()
   * }
   */
  async getFreeSpace(): Promise<number | null> {
    try {
      const quota = (await this.client.getQuota()) as DiskQuota
      if (quota && typeof quota.available === 'number') {
        return quota.available
      }
      return null
    } catch (error) {
      this.logService.warn({
        message: 'Failed to get free space from Nextcloud',
        context: { path: this.config.path, error: error.message },
      })
      return null
    }
  }

  /**
   * Builds the full WebDAV path for a given filename by joining it with
   * the configured backup directory path.
   *
   * Consecutive slashes are collapsed to prevent malformed paths when
   * `config.path` already ends with a slash.
   *
   * @param filename - Filename or relative path to append.
   * @returns Normalized full path (e.g. `/Backups/Foundry/backup.zip`).
   */
  private getFullPath(filename: string): string {
    return `${this.config.path}/${filename}`.replace(/\/+/g, '/')
  }
}
