import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import redis from '@adonisjs/redis/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import Template from '#cms/models/template/template'
import { FileFactory } from '#factories/file_factory'
import { MaintenanceService } from '#services/maintenance/maintenance_service'
import { createAdminUser, CMS_PERMISSIONS } from '#tests/helpers/create_admin_user'

async function resetSharedState() {
  await redis.flushdb()
  const service = await app.container.make(MaintenanceService)
  await service.setConfig({ enabled: false })
}

function parseInertiaPage(html: string) {
  const match = html.match(/data-page="([^"]+)"/)
  if (!match) throw new Error('No Inertia data-page attribute in response')
  const json = match[1]
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
  return JSON.parse(json)
}

const blockContent: any = { blocks: [] }

/**
 * Functional seam for Template thumbnail serialization. The admin templates
 * index renders each template's thumbnail through `TemplateTransformer`, which
 * exposes the preloaded thumbnail as `{ id, url }` (or `null`). Replaces the
 * Playwright E2E that asserted the rendered `<img>`: we assert the Inertia
 * payload the renderer consumes — `{ id, url }` pointing at the stored file
 * when a thumbnail is set, and `null` otherwise.
 */
test.group('Template thumbnail display', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(resetSharedState)

  test('serializes a thumbnail as { id, url } when set', async ({ client, assert }) => {
    const admin = await createAdminUser({
      email: 'tpl-thumb@example.com',
      permissionSlugs: CMS_PERMISSIONS,
    })
    const file = await FileFactory.create()
    const template = await Template.create({
      name: 'Thumbnail Template',
      type: 'page',
      blockType: null,
      description: null,
      content: blockContent,
      thumbnailId: file.id,
      createdBy: admin.id,
    })

    const res = await client.get('/admin/templates').loginAs(admin).send()

    res.assertStatus(200)
    const page = parseInertiaPage(res.text())
    const tpl = (page.props.templates as any[]).find((t) => t.id === template.id)

    assert.isDefined(tpl)
    assert.equal(tpl.thumbnail.id, file.id)
    assert.include(tpl.thumbnail.url, file.filename)
  })

  test('serializes the thumbnail as null when unset', async ({ client, assert }) => {
    const admin = await createAdminUser({
      email: 'tpl-no-thumb@example.com',
      permissionSlugs: CMS_PERMISSIONS,
    })
    await Template.create({
      name: 'No Thumbnail Template',
      type: 'page',
      blockType: null,
      description: null,
      content: blockContent,
      thumbnailId: null,
      createdBy: admin.id,
    })

    const res = await client.get('/admin/templates').loginAs(admin).send()

    res.assertStatus(200)
    const page = parseInertiaPage(res.text())
    const tpl = (page.props.templates as any[]).find((t) => t.name === 'No Thumbnail Template')

    assert.isDefined(tpl)
    assert.isNull(tpl.thumbnail)
  })
})
