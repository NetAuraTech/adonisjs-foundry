import backupConfig from '#config/backup'
import { type LogService } from '#services/logging/log_service'
import { LogCategory } from '#types/logging'
import { SnapshotHelper } from '#services/backup/snapshot_helper'
import { BackupPipeline, type BackupPipelineOverrides } from '#services/backup/backup_pipeline'
import type { BackupResult, BackupContext, BackupMetadata } from '#services/backup/backup_strategy'

/**
 * DifferentialBackupStrategy - Executes a differential database backup.
 *
 * Pipeline: find last full backup -> detect modified tables -> pg_dump (tables only)
 * -> compress -> encrypt -> manifest -> upload.
 *
 * Falls back to a full backup (run through the shared pipeline) if no full
 * backup exists. Skips entirely if no tables have been modified since the
 * last backup.
 *
 * I/O steps are delegated to the shared {@link BackupPipeline}; this
 * strategy keeps the differential decision logic: last full backup
 * discovery, modified table detection, fallback and skip.
 *
 * **Dependency injection for testability**
 *
 * The optional `opts` bag ({@link BackupPipelineOverrides}) accepts
 * dependencies prefixed with `_` to distinguish them from public API
 * parameters. In production, `opts` is never passed and each dependency
 * falls back to its real implementation. In tests, stubs replace the real
 * functions so no ESM-level mocking is needed.
 *
 * @example Production usage
 *   new DifferentialBackupStrategy(context, logService)
 *
 * @example Test usage
 *   new DifferentialBackupStrategy(context, logService, {
 *     _snapshotHelper: snapshotMock,
 *     _createDatabaseDump: dumpStub,
 *   })
 */
export class DifferentialBackupStrategy {
  private readonly pipeline: BackupPipeline

  /**
   * @param context - Backup execution context (temp dir, filename, strategy type).
   * @param logService - Application logging service.
   * @param opts - Optional dependency overrides for testing. Parameters prefixed
   * with `_` are internal — they replace real I/O with stubs in test environments.
   *   Forwarded to the full pipeline when the strategy falls back to a full
   *   backup.
   */
  constructor(
    private context: BackupContext,
    private logService: LogService,
    private readonly opts?: BackupPipelineOverrides
  ) {
    this.pipeline = new BackupPipeline(context, logService, opts)
  }

  /**
   * Execute the differential backup pipeline.
   */
  async execute(): Promise<BackupResult> {
    return this.pipeline.run(async (elapsed) => {
      // Find the last full backup to use as reference
      const lastFullBackup = await this.findLastFullBackup()
      if (!lastFullBackup) {
        this.logService.warn({
          message: 'No full backup found, running full backup instead',
          category: LogCategory.SYSTEM,
        })

        // Fall through to full backup logic — regenerate the filename to match
        const fullContext: BackupContext = {
          ...this.context,
          filename: SnapshotHelper.generateFilename('full'),
          strategyType: 'full',
        }
        return new BackupPipeline(fullContext, this.logService, this.opts).executeFullBackup()
      }

      // Get tables modified since the last backup
      const modifiedTables = await this.getModifiedTables(lastFullBackup.createdAt)

      if (modifiedTables.length === 0) {
        this.logService.info({
          message: 'No tables modified since last backup, skipping',
          category: LogCategory.SYSTEM,
        })
        return this.pipeline.noArtifactResult(elapsed())
      }

      this.logService.info({
        message: 'Found modified tables',
        category: LogCategory.SYSTEM,
        metadata: { count: modifiedTables.length, tables: modifiedTables },
      })

      const dumpPath = this.pipeline.dumpPath()
      await this.pipeline.dump(dumpPath, modifiedTables)

      const { encryptedPath, size } = await this.pipeline.compressAndEncrypt(dumpPath)
      await this.pipeline.writeManifest({
        type: 'differential',
        tables: modifiedTables,
        fullBackupReference: lastFullBackup.filename,
      })
      await this.pipeline.uploadBackup(encryptedPath)

      return this.pipeline.successResult(size, elapsed())
    })
  }

  private async findLastFullBackup(): Promise<BackupMetadata | null> {
    const backups = await this.listBackups()
    const fullBackups = backups.filter((b) => b.type === 'full')
    return fullBackups.length > 0 ? fullBackups[0] : null
  }

  private async listBackups(): Promise<BackupMetadata[]> {
    try {
      const objects = await this.pipeline.storageUploader.listBackups()
      const backups: BackupMetadata[] = []

      for (const object of objects) {
        if (object.isDirectory) continue

        const filename = object.key.replace(backupConfig.storage.prefix + '/', '')
        const match = filename.match(/backup-(full|differential)-(\d{4}-\d{2}-\d{2})-(\d{6})/)
        if (!match) continue

        const meta = await this.pipeline.storageUploader.getMetaData(object.key)

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

  private parseFilenameDate(date: string, time: string): Date {
    const [year, month, day] = date.split('-').map(Number)
    const hour = Number.parseInt(time.slice(0, 2))
    const minute = Number.parseInt(time.slice(2, 4))
    const second = Number.parseInt(time.slice(4, 6))
    return new Date(year, month - 1, day, hour, minute, second)
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

    const allTablesResult = await connection.rawQuery(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    )
    const allTables = allTablesResult.rows.map((row: any) => row.tablename)

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
}
