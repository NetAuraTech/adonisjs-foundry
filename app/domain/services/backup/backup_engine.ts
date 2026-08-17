import { DateTime } from 'luxon'
import backupConfig from '#config/backup'
import { type LogService } from '#services/logging/log_service'
import { SnapshotHelper } from '#services/backup/snapshot_helper'
import { BackupPipeline } from '#services/backup/backup_pipeline'
import type { BackupResult, BackupContext } from '#services/backup/backup_strategy'

/**
 * BackupEngine — Orchestrates backup execution by selecting the appropriate
 * execution path, building the context, and delegating to it: full backups
 * run through the shared {@link BackupPipeline} directly, differential
 * backups through their strategy.
 *
 * Non-DI class: imported and instantiated directly, no @inject().
 */
export class BackupEngine {
  private readonly context: BackupContext

  constructor(
    private readonly strategyType: 'full' | 'differential' | 'auto',
    private readonly tempDir: string,
    private readonly logService: LogService
  ) {
    const resolvedType = this.resolveStrategy()
    this.context = {
      tempDir: this.tempDir,
      filename: SnapshotHelper.generateFilename(resolvedType),
      strategyType: resolvedType,
    }
  }

  /**
   * Execute the backup through the selected path: the shared pipeline for
   * full backups, the differential strategy otherwise.
   */
  async execute(): Promise<BackupResult> {
    if (this.context.strategyType === 'full') {
      return new BackupPipeline(this.context, this.logService).executeFullBackup()
    }

    const { DifferentialBackupStrategy } =
      await import('#services/backup/differential_backup_strategy')
    return new DifferentialBackupStrategy(this.context, this.logService).execute()
  }

  /**
   * Resolve the actual strategy type. If 'auto', use the configured full backup day.
   * Config uses JS getDay() semantics (0=Sunday), Luxon uses weekday (1=Sunday).
   */
  private resolveStrategy(): 'full' | 'differential' {
    if (this.strategyType !== 'auto') return this.strategyType

    const now = DateTime.now()
    // Convert Luxon weekday (1=Sun) to JS getDay () (0=Sun) for comparison with config
    const jsDayOfWeek = now.weekday === 7 ? 0 : now.weekday
    return jsDayOfWeek === backupConfig.schedule.fullBackupDay ? 'full' : 'differential'
  }
}
