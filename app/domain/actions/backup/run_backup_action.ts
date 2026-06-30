import { inject } from '@adonisjs/core'
import drive from '@adonisjs/drive/services/main'
import backupConfig from '#config/backup'
import { spawn, type ChildProcess } from 'node:child_process'
import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir, stat, unlink, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createGzip } from 'node:zlib'
import { pipeline } from 'node:stream/promises'
import { DateTime } from 'luxon'
import env from '#start/env'
import { LogService } from '#services/logging/log_service'
import { LogCategory } from '#types/logging'
import { createEncryptionHelper } from '#helpers/core/encryption'

export interface BackupResult {
  success: boolean
  filename: string
  type: 'full' | 'differential'
  size: number
  duration: number
  storage: string
  error?: string
}

export interface BackupManifest {
  type: 'full' | 'differential'
  createdAt: string
  tables: string[]
  fullBackupReference?: string
}

export interface BackupMetadata {
  filename: string
  type: 'full' | 'differential'
  size: number
  createdAt: Date
  path: string
}

interface RunBackupPayload {
  strategy?: 'full' | 'differential' | 'auto'
}
/**
 * Run a database backup (full or differential) with compression and encryption.
 *
 * Mirrors the strategy selection, dump, compress, encrypt, manifest, and upload
 * pipeline defined in {@link BackupService}.
 */
@inject()
export class RunBackupAction {
  private encryptionHelper = createEncryptionHelper(backupConfig.encryption.key.release())
  private tempDir = 'storage/temp/backups'

  constructor(protected logService: LogService) {}

  private getDisk() {
    return drive.use(backupConfig.storage.disk as Parameters<typeof drive.use>[0])
  }

  private buildPath(filename: string): string {
    return `${backupConfig.storage.prefix}/${filename}`
  }

  /**
   * Execute a backup run.
   *
   * @param payload - Optional strategy override. `'auto'` (default) selects full on the
   *   configured `fullBackupDay`, differential on all other days.
   * @returns A {@link BackupResult} describing the outcome.
   *
   * @example
   * await runBackupAction.execute({ strategy: 'full' })
   */
  async execute(payload?: RunBackupPayload): Promise<BackupResult> {
    const strategy = payload?.strategy ?? 'auto'
    const now = DateTime.now()

    const selectedStrategy: 'full' | 'differential' =
      strategy === 'auto'
        ? now.weekday === backupConfig.schedule.fullBackupDay
          ? 'full'
          : 'differential'
        : strategy

    return selectedStrategy === 'full' ? this.runFullBackup() : this.runDifferentialBackup()
  }

  private async runFullBackup(): Promise<BackupResult> {
    const startTime = Date.now()
    const filename = this.generateFilename('full')
    const tempPath = join(this.tempDir, filename)

    this.logService.info({
      message: 'Starting full backup',
      category: LogCategory.SYSTEM,
      metadata: { filename },
    })

    try {
      await mkdir(this.tempDir, { recursive: true })

      const dumpPath = tempPath.replace(/\.(gz\.enc|enc|gz)$/, '.sql')
      await this.createDatabaseDump(dumpPath)

      const compressedPath = await this.compressFile(dumpPath)
      await unlink(dumpPath)

      const encryptedPath = await this.encryptFile(compressedPath)

      const fileStats = await stat(encryptedPath)
      const size = fileStats.size

      const tables = await this.getAllTables()
      await this.createManifest(filename, {
        type: 'full',
        createdAt: new Date().toISOString(),
        tables,
      })

      await this.uploadToDrive(encryptedPath, filename)
      await unlink(encryptedPath)

      const duration = Date.now() - startTime

      this.logService.info({
        message: 'Backup completed successfully',
        category: LogCategory.SYSTEM,
        metadata: { filename, size, duration },
      })

      return {
        success: true,
        filename,
        type: 'full',
        size,
        duration,
        storage: backupConfig.storage.disk,
      }
    } catch (error) {
      const duration = Date.now() - startTime

      this.logService.error({
        message: 'Full backup failed',
        category: LogCategory.SYSTEM,
        error,
        context: { filename, duration },
      })

      return {
        success: false,
        filename,
        type: 'full',
        size: 0,
        duration,
        storage: backupConfig.storage.disk,
        error: error.message,
      }
    }
  }

  private async runDifferentialBackup(): Promise<BackupResult> {
    const startTime = Date.now()
    const filename = this.generateFilename('differential')
    const tempPath = join(this.tempDir, filename)

    this.logService.info({
      message: 'Starting differential backup',
      category: LogCategory.SYSTEM,
      metadata: { filename },
    })

    try {
      await mkdir(this.tempDir, { recursive: true })

      const lastFullBackup = await this.findLastFullBackup()
      if (!lastFullBackup) {
        this.logService.warn({
          message: 'No full backup found, running full backup instead',
          category: LogCategory.SYSTEM,
        })
        return this.runFullBackup()
      }

      const modifiedTables = await this.getModifiedTables(lastFullBackup.createdAt)

      if (modifiedTables.length === 0) {
        this.logService.info({
          message: 'No tables modified since last backup, skipping',
          category: LogCategory.SYSTEM,
        })
        return {
          success: true,
          filename: '',
          type: 'differential',
          size: 0,
          duration: Date.now() - startTime,
          storage: backupConfig.storage.disk,
        }
      }

      this.logService.info({
        message: 'Found modified tables',
        category: LogCategory.SYSTEM,
        metadata: { count: modifiedTables.length, tables: modifiedTables },
      })

      const dumpPath = tempPath.replace(/\.(gz\.enc|enc|gz)$/, '.sql')
      await this.createDifferentialDump(dumpPath, modifiedTables)

      const compressedPath = await this.compressFile(dumpPath)
      await unlink(dumpPath)

      const encryptedPath = await this.encryptFile(compressedPath)

      const fileStats = await stat(encryptedPath)
      const size = fileStats.size

      await this.createManifest(filename, {
        type: 'differential',
        createdAt: new Date().toISOString(),
        tables: modifiedTables,
        fullBackupReference: lastFullBackup.filename,
      })

      await this.uploadToDrive(encryptedPath, filename)
      await unlink(encryptedPath)

      const duration = Date.now() - startTime

      this.logService.info({
        message: 'Backup completed successfully',
        category: LogCategory.SYSTEM,
        metadata: { filename, size, duration },
      })

      return {
        success: true,
        filename,
        type: 'differential',
        size,
        duration,
        storage: backupConfig.storage.disk,
      }
    } catch (error) {
      const duration = Date.now() - startTime

      this.logService.error({
        message: 'Differential backup failed',
        category: LogCategory.SYSTEM,
        error,
        context: { filename, duration },
      })

      return {
        success: false,
        filename,
        type: 'differential',
        size: 0,
        duration,
        storage: backupConfig.storage.disk,
        error: error.message,
      }
    }
  }

  private async createDatabaseDump(outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-h',
        env.get('PG_HOST')!,
        '-p',
        String(env.get('PG_PORT') || 5432),
        '-U',
        env.get('PG_USER')!,
        '-d',
        env.get('PG_DB_NAME')!,
        '-F',
        'p',
        '-f',
        outputPath,
      ]

      const pgDump: ChildProcess = spawn('pg_dump', args, {
        env: { ...process.env, PGPASSWORD: env.get('PG_PASSWORD').release() },
      })

      let errorOutput = ''
      pgDump.stderr!.on('data', (data) => {
        errorOutput += data.toString()
      })
      pgDump.on('close', (code) => {
        code === 0
          ? resolve()
          : reject(new Error(`pg_dump failed with code ${code}: ${errorOutput}`))
      })
      pgDump.on('error', (error) => {
        reject(new Error(`Failed to start pg_dump: ${error.message}`))
      })
    })
  }

  private async createDifferentialDump(outputPath: string, tables: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-h',
        env.get('PG_HOST')!,
        '-p',
        String(env.get('PG_PORT') || 5432),
        '-U',
        env.get('PG_USER')!,
        '-d',
        env.get('PG_DB_NAME')!,
        '-F',
        'p',
        '-f',
        outputPath,
      ]

      for (const table of tables) {
        args.push('-t', table)
      }

      const pgDump: ChildProcess = spawn('pg_dump', args, {
        env: { ...process.env, PGPASSWORD: env.get('PG_PASSWORD').release() },
      })

      let errorOutput = ''
      pgDump.stderr!.on('data', (data) => {
        errorOutput += data.toString()
      })
      pgDump.on('close', (code) => {
        code === 0
          ? resolve()
          : reject(new Error(`pg_dump failed with code ${code}: ${errorOutput}`))
      })
      pgDump.on('error', (error) => {
        reject(new Error(`Failed to start pg_dump: ${error.message}`))
      })
    })
  }

  private async compressFile(inputPath: string): Promise<string> {
    const outputPath = `${inputPath}.gz`
    const input = createReadStream(inputPath)
    const output = createWriteStream(outputPath)
    const gzip = createGzip({ level: backupConfig.compression.level })
    await pipeline(input, gzip, output)
    return outputPath
  }

  private async encryptFile(inputPath: string): Promise<string> {
    if (!backupConfig.encryption.enabled) return inputPath
    const outputPath = `${inputPath}.enc`
    await this.encryptionHelper.encryptFile(inputPath, outputPath)
    await unlink(inputPath)
    return outputPath
  }

  private async uploadToDrive(localPath: string, filename: string): Promise<void> {
    const disk = this.getDisk()
    const remotePath = this.buildPath(filename)
    const contents = await readFile(localPath)
    await disk.put(remotePath, contents, { contentType: 'application/octet-stream' })
  }

  private generateFilename(type: 'full' | 'differential'): string {
    const now = DateTime.now()
    const date = now.toFormat('yyyy-MM-dd')
    const time = now.toFormat('HHmmss')

    let filename = `backup-${type}-${date}-${time}.sql`
    if (backupConfig.compression.enabled) filename += '.gz'
    if (backupConfig.encryption.enabled) filename += '.enc'

    return filename
  }

  private async createManifest(filename: string, data: BackupManifest): Promise<void> {
    const manifestFilename = filename.replace(/\.(sql|gz|enc)+$/, '.manifest.json')
    const manifestPath = join(this.tempDir, manifestFilename)

    await writeFile(manifestPath, JSON.stringify(data, null, 2))

    try {
      await this.uploadToDrive(manifestPath, manifestFilename)
    } catch (error) {
      this.logService.error({
        message: 'Failed to upload manifest',
        category: LogCategory.SYSTEM,
        error,
      })
    }

    await unlink(manifestPath)
  }

  private async getAllTables(): Promise<string[]> {
    const db = await import('@adonisjs/lucid/services/db')
    const connection = db.default.connection(backupConfig.database.connection)
    const result = await connection.rawQuery(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    )
    return result.rows.map((row: any) => row.tablename)
  }

  private async getModifiedTables(since: Date): Promise<string[]> {
    const db = await import('@adonisjs/lucid/services/db')
    const connection = db.default.connection(backupConfig.database.connection)

    const result = await connection.rawQuery(
      `
        SELECT
          schemaname || '.' || relname as table_name,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables
        WHERE
          schemaname = 'public'
          AND (
            last_vacuum > ? OR
            last_autovacuum > ? OR
            last_analyze > ? OR
            last_autoanalyze > ?
          )
        ORDER BY relname
      `,
      [since, since, since, since]
    )

    const modifiedFromStats = result.rows.map((row: any) => row.table_name.replace('public.', ''))

    const allTables = await this.getAllTables()
    const modifiedFromUpdatedAt: string[] = []

    for (const table of allTables) {
      if (backupConfig.differential.excludedTables.includes(table)) continue

      try {
        const hasUpdatedAt = await connection.rawQuery(
          `
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = ?
              AND column_name = 'updated_at'
          `,
          [table]
        )

        if (hasUpdatedAt.rows.length > 0) {
          const hasModified = await connection.rawQuery(
            `SELECT 1 FROM "${table}" WHERE updated_at > ? LIMIT 1`,
            [since]
          )
          if (hasModified.rows.length > 0) {
            modifiedFromUpdatedAt.push(table)
          }
        }
      } catch (error) {
        this.logService.warn({
          message: 'Failed to check table for modifications',
          category: LogCategory.SYSTEM,
          error,
          metadata: { table },
        })
      }
    }

    return [...new Set([...modifiedFromStats, ...modifiedFromUpdatedAt])]
  }

  private async findLastFullBackup(): Promise<BackupMetadata | null> {
    const backups = await this.listBackups()
    const fullBackups = backups.filter((b) => b.type === 'full')
    return fullBackups.length > 0 ? fullBackups[0] : null
  }

  private parseFilenameDate(date: string, time: string): Date {
    const [year, month, day] = date.split('-').map(Number)
    const hour = Number.parseInt(time.slice(0, 2))
    const minute = Number.parseInt(time.slice(2, 4))
    const second = Number.parseInt(time.slice(4, 6))
    return new Date(year, month - 1, day, hour, minute, second)
  }

  private async listBackups(): Promise<BackupMetadata[]> {
    try {
      const disk = this.getDisk()
      const prefix = `${backupConfig.storage.prefix}/`
      const { objects } = await disk.listAll(prefix)
      const backups: BackupMetadata[] = []

      for (const object of objects) {
        if (object.isDirectory) continue

        const filename = object.key.replace(prefix, '')
        const match = filename.match(/backup-(full|differential)-(\d{4}-\d{2}-\d{2})-(\d{6})/)
        if (!match) continue

        const meta = await disk.getMetaData(object.key)

        backups.push({
          filename,
          type: match[1] as 'full' | 'differential',
          size: meta.contentLength || 0,
          createdAt: meta.lastModified || this.parseFilenameDate(match[2], match[3]),
          path: object.key,
        })
      }

      return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      this.logService.error({
        message: 'Failed to list backups from Drive',
        category: LogCategory.SYSTEM,
        error,
        context: { disk: backupConfig.storage.disk },
      })
      return []
    }
  }
}
