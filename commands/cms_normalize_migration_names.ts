import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * One-time fixup for the CMS module extraction (ADR-0001, phase 2).
 *
 * Lucid derives the tracked migration name from the file path
 * (`<migrations.path>/<file>`), so moving the five CMS migrations from
 * `database/migrations/` to `database/migrations/cms/` changes their tracked
 * names and Lucid would re-run them on pre-existing databases (and crash on
 * already-existing tables). This command renames the stored `adonis_schema`
 * rows in place, keeping the recorded history aligned with the new locations.
 *
 * Idempotent: rows already renamed are matched by their new name and skipped.
 * Fresh databases never need this command — the migrations simply run from
 * their new location. Safe to delete once every long-lived database has been
 * normalized.
 *
 * @example
 * node ace cms:normalize-migration-names
 * node ace cms:normalize-migration-names --connection=pg
 */
export default class CmsNormalizeMigrationNames extends BaseCommand {
  static commandName = 'cms:normalize-migration-names'
  static description =
    'Rename stored adonis_schema rows for the CMS migrations moved to database/migrations/cms (one-time, idempotent)'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
  }

  /**
   * The five CMS migrations moved to `database/migrations/cms/`. Tracked names
   * are `<configured path>/<file>` — only the path segment changes.
   */
  static movedMigrations = [
    '1774296907862_create_pages_table',
    '1774296935625_create_page_translations_table',
    '1774296966328_create_page_revisions_table',
    '1774296994505_create_templates_table',
    '1776085257070_alter_pages_table',
  ]

  @flags.string({
    description: 'The database connection to normalize (defaults to the primary one)',
  })
  declare connection: string

  async run() {
    const db = await this.app.container.make('lucid.db')
    const connection = db.connection(this.connection || undefined)
    const tableName =
      db.getRawConnection(connection.connectionName)?.config.migrations?.tableName ??
      'adonis_schema'

    const hasTable = await connection.schema.hasTable(tableName)
    if (!hasTable) {
      this.logger.info(
        `No "${tableName}" table on connection "${connection.connectionName}" — fresh database, nothing to normalize.`
      )
      return
    }

    let renamed = 0
    for (const migration of CmsNormalizeMigrationNames.movedMigrations) {
      const from = `database/migrations/${migration}`
      const to = `database/migrations/cms/${migration}`
      // Lucid types `update()` loosely on raw connections; knex returns an affected-row count
      const affected = (await connection
        .from(tableName)
        .where({ name: from })
        .update({ name: to })) as unknown as number
      if (affected > 0) {
        renamed += affected
        this.logger.info(`renamed: ${from} -> ${to}`)
      }
    }

    if (renamed === 0) {
      this.logger.success(
        `Nothing to do on connection "${connection.connectionName}" — already normalized or no CMS migration history.`
      )
    } else {
      this.logger.success(
        `Normalized ${renamed} migration name(s) on connection "${connection.connectionName}".`
      )
    }
  }
}
