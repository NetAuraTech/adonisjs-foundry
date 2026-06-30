import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { ListBackupsAction } from '#actions/backup/list_backups_action'
import drive from '@adonisjs/drive/services/main'
import backupConfig from '#config/backup'
import { mockDriveListing } from '#tests/helpers/mock-drive-listing'

test.group('ListBackupsAction', (group) => {
  group.each.setup(() => {
    drive.fake(backupConfig.storage.disk as any)
    const disk = drive.use(backupConfig.storage.disk) as any
    mockDriveListing(disk)
  })

  group.each.teardown(() => {
    drive.restore(backupConfig.storage.disk as any)
  })

  test('execute() returns empty array when no backups exist', async ({ assert }) => {
    const action = await app.container.make(ListBackupsAction)
    const result = await action.execute()
    assert.isArray(result)
    assert.lengthOf(result, 0)
  })

  test('execute() lists backup files sorted by date descending', async ({ assert }) => {
    const disk = drive.use(backupConfig.storage.disk) as any
    const prefix = backupConfig.storage.prefix

    await disk.put(`${prefix}/backup-full-2024-01-15-143022.sql.gz.enc`, 'dummy content')
    await disk.put(`${prefix}/backup-differential-2024-01-16-100000.sql`, 'dummy')

    const action = await app.container.make(ListBackupsAction)
    const result = await action.execute()

    assert.lengthOf(result, 2)
    assert.equal(result[0].type, 'differential')
    assert.equal(result[1].type, 'full')
  })

  test('execute() filters by type when specified', async ({ assert }) => {
    const disk = drive.use(backupConfig.storage.disk) as any
    const prefix = backupConfig.storage.prefix

    await disk.put(`${prefix}/backup-full-2024-01-15-143022.sql.gz.enc`, 'dummy')
    await disk.put(`${prefix}/backup-differential-2024-01-16-100000.sql`, 'dummy')

    const action = await app.container.make(ListBackupsAction)
    const result = await action.execute({ type: 'full' })

    assert.lengthOf(result, 1)
    assert.equal(result[0].type, 'full')
  })
})