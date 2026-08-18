/**
 * Shared backup types.
 *
 * The result and context contracts shared by the backup pipeline, the
 * backup engine, and the backup actions.
 */

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

/**
 * Context shared across the pipeline and helpers.
 * All external dependencies are passed in here to keep the pipeline
 * instantiable without DI.
 */
export interface BackupContext {
  tempDir: string
  filename: string
  strategyType: 'full' | 'differential'
}
