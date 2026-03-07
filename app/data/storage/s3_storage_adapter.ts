import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { createReadStream, createWriteStream } from 'node:fs'
import { stat, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { inject } from '@adonisjs/core'
import { type BackupMetadata, type StorageAdapter } from '#contracts/backup/storage_adapter'
import { LogService } from '#services/logging/log_service'

/**
 * Configuration required to connect to an S3 or S3-compatible object storage bucket.
 */
export interface S3Config {
  /** Name of the S3 bucket where backups are stored. */
  bucket: string

  /** AWS region of the bucket (e.g. `eu-west-3`). */
  region: string

  /**
   * Custom endpoint URL for S3-compatible providers
   * (e.g. `https://s3.wasabisys.com` for Wasabi, `http://localhost:9000` for MinIO).
   * Omit for standard AWS S3.
   */
  endpoint?: string

  /** AWS access key ID (or equivalent for S3-compatible providers). */
  accessKeyId: string

  /** AWS secret access key (or equivalent for S3-compatible providers). */
  secretAccessKey: string

  /**
   * Key prefix under which backups are stored within the bucket
   * (e.g. `backups/foundry`). Leave empty to store at the bucket root.
   */
  path: string
}

/**
 * {@link StorageAdapter} implementation that stores backup files in an S3 or
 * S3-compatible object storage bucket.
 *
 * Compatible with AWS S3, Wasabi, Backblaze B2, MinIO, and any provider
 * implementing the S3 API. A custom `endpoint` can be set in {@link S3Config}
 * to target non-AWS providers.
 *
 * Uploads use the AWS multipart upload API via `@aws-sdk/lib-storage` to
 * handle large files reliably. Downloads are streamed directly to disk.
 *
 * Free space is not a meaningful concept for object storage with no configured
 * quota — {@link getFreeSpace} always returns `null`.
 *
 * @example
 * const adapter = new S3StorageAdapter(
 *   {
 *     bucket: 'my-backups',
 *     region: 'eu-west-3',
 *     accessKeyId: 'ACCESS_KEY',
 *     secretAccessKey: 'SECRET_KEY',
 *     path: 'backups/foundry',
 *   },
 *   logService
 * )
 */
@inject()
export default class S3StorageAdapter implements StorageAdapter {
  readonly name = 's3'
  private client: S3Client

  /**
   * Creates a new `S3StorageAdapter` and initializes the underlying AWS S3 client.
   *
   * @param config - S3 connection and bucket settings.
   * @param logService - Application log service used to record storage operations.
   */
  constructor(
    private config: S3Config,
    private logService: LogService
  ) {
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint || undefined,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
  }

  /**
   * Verifies that the S3 bucket is reachable and accessible with the configured
   * credentials by issuing a lightweight `ListObjectsV2` request.
   *
   * @returns `true` if the bucket is accessible, `false` otherwise.
   *
   * @example
   * if (!(await adapter.isAvailable())) {
   *   throw new Error('S3 storage is unavailable')
   * }
   */
  async isAvailable(): Promise<boolean> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.config.bucket,
        MaxKeys: 1,
      })

      await this.client.send(command)
      return true
    } catch (error) {
      this.logService.error({
        message: 'S3 storage not available',
        context: { bucket: this.config.bucket, error: error.message },
      })
      return false
    }
  }

  /**
   * Uploads a local backup file to S3 using multipart upload.
   *
   * Uses `@aws-sdk/lib-storage` to automatically split large files into
   * parts and upload them in parallel, ensuring reliability for large archives.
   * The file is streamed from disk to avoid loading the entire archive into memory.
   *
   * @param localPath - Absolute path to the source backup file on the local filesystem.
   * @param remotePath - Filename or relative path appended to the configured key prefix.
   * @returns `true` if the upload completed successfully, `false` otherwise.
   *
   * @example
   * await adapter.upload('/tmp/backup.zip', 'backup-full-2024-01-15-120000.zip')
   */
  async upload(localPath: string, remotePath: string): Promise<boolean> {
    try {
      const fileStream = createReadStream(localPath)
      const fileStat = await stat(localPath)
      const key = this.getFullPath(remotePath)

      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.config.bucket,
          Key: key,
          Body: fileStream,
          ContentType: 'application/octet-stream',
          ContentLength: fileStat.size,
        },
      })

      await upload.done()

      this.logService.logBusiness('backup.s3.uploaded', {
        localPath,
        bucket: this.config.bucket,
        key,
      })

      return true
    } catch (error) {
      this.logService.error({
        message: 'Failed to upload backup to S3',
        context: { localPath, remotePath, bucket: this.config.bucket, error: error.message },
      })
      return false
    }
  }

  /**
   * Downloads a backup file from S3 and streams it to a local path.
   *
   * The destination directory is created recursively if it does not exist.
   * The response body is piped directly to disk to avoid buffering the
   * entire archive in memory.
   *
   * @param remotePath - Filename or relative path appended to the configured key prefix.
   * @param localPath - Absolute local path where the file should be written.
   * @returns `true` if the download completed successfully, `false` otherwise.
   *
   * @example
   * await adapter.download('backup-full-2024-01-15-120000.zip', '/tmp/restore.zip')
   */
  async download(remotePath: string, localPath: string): Promise<boolean> {
    try {
      const key = this.getFullPath(remotePath)

      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      })

      const response = await this.client.send(command)

      if (!response.Body) {
        throw new Error('Empty response body from S3')
      }

      await mkdir(dirname(localPath), { recursive: true })

      const writeStream = createWriteStream(localPath)
      await pipeline(response.Body as any, writeStream)

      this.logService.logBusiness('backup.s3.downloaded', {
        bucket: this.config.bucket,
        key,
        localPath,
      })

      return true
    } catch (error) {
      this.logService.error({
        message: 'Failed to download backup from S3',
        context: { remotePath, localPath, bucket: this.config.bucket, error: error.message },
      })
      return false
    }
  }

  /**
   * Deletes a backup file from the S3 bucket.
   *
   * @param remotePath - Filename or relative path appended to the configured key prefix.
   * @returns `true` if the file was deleted successfully, `false` otherwise.
   *
   * @example
   * await adapter.delete('backup-full-2024-01-15-120000.zip')
   */
  async delete(remotePath: string): Promise<boolean> {
    try {
      const key = this.getFullPath(remotePath)

      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      })

      await this.client.send(command)

      this.logService.logBusiness('backup.s3.deleted', {
        bucket: this.config.bucket,
        key,
      })

      return true
    } catch (error) {
      this.logService.error({
        message: 'Failed to delete backup from S3',
        context: { remotePath, bucket: this.config.bucket, error: error.message },
      })
      return false
    }
  }

  /**
   * Lists all backup objects stored under the configured key prefix and returns
   * metadata for files matching the backup filename pattern
   * `backup-(full|differential)-YYYY-MM-DD-HHmmss`.
   *
   * Non-matching keys are silently ignored. The `createdAt` field is derived
   * from the S3 object's `LastModified` timestamp.
   * Results are sorted by `createdAt` in descending order (most recent first).
   *
   * @returns An array of {@link BackupMetadata} objects. Returns an empty array
   *   if the bucket cannot be listed or contains no matching objects.
   *
   * @example
   * const backups = await adapter.list()
   * console.log(backups[0].filename) // most recent backup
   */
  async list(): Promise<BackupMetadata[]> {
    try {
      const prefix = this.config.path ? `${this.config.path}/` : ''
      const command = new ListObjectsV2Command({
        Bucket: this.config.bucket,
        Prefix: prefix,
      })

      const response = await this.client.send(command)
      const backups: BackupMetadata[] = []

      if (!response.Contents) return backups

      for (const object of response.Contents) {
        if (!object.Key || !object.LastModified || !object.Size) continue

        const filename = object.Key.replace(prefix, '')
        const match = filename.match(/backup-(full|differential)-(\d{4}-\d{2}-\d{2})-(\d{6})/)
        if (!match) continue

        backups.push({
          filename,
          type: match[1] as 'full' | 'differential',
          size: object.Size,
          createdAt: object.LastModified,
          path: object.Key,
        })
      }

      return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      this.logService.error({
        message: 'Failed to list backups from S3',
        context: { bucket: this.config.bucket, path: this.config.path, error: error.message },
      })
      return []
    }
  }

  /**
   * Checks whether a backup object exists in the S3 bucket using a `HeadObject`
   * request, which avoids downloading the object body.
   *
   * @param remotePath - Filename or relative path appended to the configured key prefix.
   * @returns `true` if the object exists, `false` otherwise (including on error).
   *
   * @example
   * if (await adapter.exists('backup-full-2024-01-15-120000.zip')) {
   *   await adapter.download('backup-full-2024-01-15-120000.zip', '/tmp/restore.zip')
   * }
   */
  async exists(remotePath: string): Promise<boolean> {
    try {
      const key = this.getFullPath(remotePath)

      const command = new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      })

      await this.client.send(command)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Always returns `null` — free space is not a meaningful concept for S3
   * object storage, which has no enforced capacity limit by default.
   *
   * @returns `null`.
   */
  async getFreeSpace(): Promise<number | null> {
    return null
  }

  /**
   * Builds the full S3 object key for a given filename by prepending the
   * configured key prefix.
   *
   * Returns the filename unchanged if no prefix is configured.
   *
   * @param filename - Filename or relative path to append.
   * @returns Full S3 object key (e.g. `backups/foundry/backup.zip`).
   */
  private getFullPath(filename: string): string {
    return this.config.path ? `${this.config.path}/${filename}` : filename
  }
}
