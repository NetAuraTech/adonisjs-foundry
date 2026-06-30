import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { RunBackupAction } from '#actions/backup/run_backup_action'
import drive from '@adonisjs/drive/services/main'
import backupConfig from '#config/backup'

test.group('RunBackupAction', (group) => {
  group.each.setup(() => {
    drive.fake(backupConfig.storage.disk as any)
  })

  group.each.teardown(() => {
    drive.restore(backupConfig.storage.disk as any)
  })

  test('execute() returns result with expected shape on failure', async ({ assert }) => {
    const action = await app.container.make(RunBackupAction)
    const result = await action.execute({ strategy: 'full' })

    assert.property(result, 'success')
    assert.property(result, 'filename')
    assert.property(result, 'type')
    assert.property(result, 'size')
    assert.property(result, 'duration')
    assert.property(result, 'storage')
  })
})
