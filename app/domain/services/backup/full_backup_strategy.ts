import backupConfig from '#config/backup'
import { type LogService } from '#services/logging/log_service'
import { BackupPipeline, type BackupPipelineOverrides } from '#services/backup/backup_pipeline'
import type { BackupResult, BackupContext } from '#services/backup/backup_strategy'

/**
 * FullBackupStrategy - Executes a full database backup.
 *
 * Pipeline: pg_dump (all tables) -> compress -> encrypt -> upload -> manifest.
 *
 * Every I/O step is delegated to the shared {@link BackupPipeline}; this
 * strategy only owns strategy-specific logic (listing the dumped tables for
 * the manifest).
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
 *   new FullBackupStrategy(context, logService)
 *
 * @example Test usage
 *   new FullBackupStrategy(context, logService, {
 *     _snapshotHelper: snapshotMock,
 *     _mkdir: mkdirStub,
 *   })
 */
export class FullBackupStrategy {
  private readonly pipeline: BackupPipeline

  constructor(context: BackupContext, logService: LogService, opts?: BackupPipelineOverrides) {
    this.pipeline = new BackupPipeline(context, logService, opts)
  }

  /**
   * Execute the full backup pipeline.
   */
  async execute(): Promise<BackupResult> {
    return this.pipeline.run(async (elapsed) => {
      const dumpPath = this.pipeline.dumpPath()
      await this.pipeline.dump(dumpPath)

      const { encryptedPath, size } = await this.pipeline.compressAndEncrypt(dumpPath)
      await this.pipeline.uploadBackup(encryptedPath)

      const tables = await this.getAllTables()
      await this.pipeline.writeManifest({ tables })

      return this.pipeline.successResult(size, elapsed())
    })
  }

  /**
   * List all tables in the `public` schema (persisted in the backup manifest).
   */
  private async getAllTables(): Promise<string[]> {
    const db = await import('@adonisjs/lucid/services/db')
    const connection = db.default.connection(backupConfig.database.connection)
    const result = await connection.rawQuery(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    )
    return result.rows.map((row: any) => row.tablename)
  }
}
