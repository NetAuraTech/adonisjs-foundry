import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import emitter from '@adonisjs/core/services/emitter'
import redis from '@adonisjs/redis/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/auth/user'
import Template from '#cms/models/template/template'
import Page from '#cms/models/page/page'
import PageTranslation from '#cms/models/page/page_translation'
import { MaintenanceService } from '#services/maintenance/maintenance_service'
import { createAdminUser } from '#tests/helpers/browser/create_admin_user'

async function resetSharedState() {
  await redis.flushdb()
  const service = await app.container.make(MaintenanceService)
  await service.setConfig({ enabled: false })
}

test.group('Admin REST API v1 — Templates', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(resetSharedState)
  group.each.setup(() => limiter.clear())
  group.each.setup(() => {
    emitter.fake()
    return () => emitter.restore()
  })
  group.each.teardown(() => limiter.clear())

  test('lists templates filtered by type', async ({ client, assert }) => {
    const admin = await createAdminUser({
      email: 'admin-templates-list@example.com',
      permissionSlugs: ['templates.view'],
    })
    const token = await User.accessTokens.create(admin)

    await Template.create({
      name: 'Page Hero',
      type: 'page',
      content: { blocks: [] },
      createdBy: null,
    })
    await Template.create({
      name: 'Block Button',
      type: 'block',
      blockType: 'button',
      content: { blocks: [] },
      createdBy: null,
    })

    const res = await client
      .get('/api/v1/admin/templates?type=page')
      .accept('json')
      .bearerToken(token.value!.release())

    res.assertStatus(200)
    const names = res.body().templates.map((t: any) => t.name)
    assert.isTrue(names.includes('Page Hero'))
    assert.isFalse(names.includes('Block Button'))
  })

  test('list templates returns 401 without token', async ({ client }) => {
    const res = await client.get('/api/v1/admin/templates').accept('json')
    res.assertStatus(401)
  })

  test('list templates returns 403 without templates.view', async ({ client }) => {
    const admin = await createAdminUser({
      email: 'noperm-templates@example.com',
      permissionSlugs: [],
    })
    const token = await User.accessTokens.create(admin)

    const res = await client
      .get('/api/v1/admin/templates')
      .accept('json')
      .bearerToken(token.value!.release())

    res.assertStatus(403)
  })

  test('creates a block template', async ({ client, assert }) => {
    const admin = await createAdminUser({
      email: 'admin-templates-create@example.com',
      permissionSlugs: ['templates.create'],
    })
    const token = await User.accessTokens.create(admin)

    const res = await client
      .post('/api/v1/admin/templates')
      .accept('json')
      .bearerToken(token.value!.release())
      .json({
        name: 'Button CTA',
        description: 'A call-to-action button',
        blockType: 'button',
        content: {
          blocks: [
            {
              id: 'b1',
              type: 'button',
              props: { text: 'Click me' },
              children: [],
            },
          ],
        },
      })

    res.assertStatus(201)
    assert.equal(res.body().template.name, 'Button CTA')
  })

  test('create returns 422 on invalid payload', async ({ client }) => {
    const admin = await createAdminUser({
      email: 'admin-templates-create-invalid@example.com',
      permissionSlugs: ['templates.create'],
    })
    const token = await User.accessTokens.create(admin)

    const res = await client
      .post('/api/v1/admin/templates')
      .accept('json')
      .bearerToken(token.value!.release())
      .json({ name: 'No content' })

    res.assertStatus(422)
  })

  test('updates a template', async ({ client, assert }) => {
    const admin = await createAdminUser({
      email: 'admin-templates-update@example.com',
      permissionSlugs: ['templates.update'],
    })
    const token = await User.accessTokens.create(admin)

    const template = await Template.create({
      name: 'Old Name',
      type: 'page',
      content: { blocks: [] },
      createdBy: null,
    })

    const res = await client
      .put(`/api/v1/admin/templates/${template.id}`)
      .accept('json')
      .bearerToken(token.value!.release())
      .json({ name: 'New Name' })

    res.assertStatus(200)
    assert.equal(res.body().template.name, 'New Name')
  })

  test('update returns 404 for unknown id', async ({ client }) => {
    const admin = await createAdminUser({
      email: 'admin-templates-update-404@example.com',
      permissionSlugs: ['templates.update'],
    })
    const token = await User.accessTokens.create(admin)

    const res = await client
      .put('/api/v1/admin/templates/999999')
      .accept('json')
      .bearerToken(token.value!.release())
      .json({ name: 'New' })

    res.assertStatus(404)
  })

  test('deletes a template', async ({ client, assert }) => {
    const admin = await createAdminUser({
      email: 'admin-templates-destroy@example.com',
      permissionSlugs: ['templates.delete'],
    })
    const token = await User.accessTokens.create(admin)

    const template = await Template.create({
      name: 'To Delete',
      type: 'page',
      content: { blocks: [] },
      createdBy: null,
    })

    const res = await client
      .delete(`/api/v1/admin/templates/${template.id}`)
      .accept('json')
      .bearerToken(token.value!.release())

    res.assertStatus(204)
    const found = await Template.find(template.id)
    assert.isNull(found)
  })

  test('delete returns 404 for unknown id', async ({ client }) => {
    const admin = await createAdminUser({
      email: 'admin-templates-destroy-404@example.com',
      permissionSlugs: ['templates.delete'],
    })
    const token = await User.accessTokens.create(admin)

    const res = await client
      .delete('/api/v1/admin/templates/999999')
      .accept('json')
      .bearerToken(token.value!.release())

    res.assertStatus(404)
  })

  test('delete returns 403 without templates.delete', async ({ client }) => {
    const admin = await createAdminUser({
      email: 'noperm-templates-destroy@example.com',
      permissionSlugs: ['templates.view'],
    })
    const token = await User.accessTokens.create(admin)

    const template = await Template.create({
      name: 'Blocked Delete',
      type: 'page',
      content: { blocks: [] },
      createdBy: null,
    })

    const res = await client
      .delete(`/api/v1/admin/templates/${template.id}`)
      .accept('json')
      .bearerToken(token.value!.release())

    res.assertStatus(403)
  })

  test('creates a template from a page', async ({ client, assert }) => {
    const admin = await createAdminUser({
      email: 'admin-templates-from-page@example.com',
      permissionSlugs: ['templates.create'],
    })
    const token = await User.accessTokens.create(admin)

    const page = await Page.create({ defaultLocale: 'en', createdBy: admin.id })
    await PageTranslation.create({
      pageId: page.id,
      locale: 'en',
      slug: `from-page-${page.id}`,
      title: 'From Page',
      content: { blocks: [] },
      status: 'draft' as any,
    })

    const res = await client
      .post('/api/v1/admin/templates/from-page')
      .accept('json')
      .bearerToken(token.value!.release())
      .json({ name: 'Page Snapshot', pageId: page.id, locale: 'en' })

    res.assertStatus(201)
    assert.equal(res.body().template.name, 'Page Snapshot')
  })

  test('from-page returns 404 for unknown page', async ({ client }) => {
    const admin = await createAdminUser({
      email: 'admin-templates-from-page-404@example.com',
      permissionSlugs: ['templates.create'],
    })
    const token = await User.accessTokens.create(admin)

    const res = await client
      .post('/api/v1/admin/templates/from-page')
      .accept('json')
      .bearerToken(token.value!.release())
      .json({ name: 'Page Snapshot', pageId: 999999, locale: 'en' })

    res.assertStatus(404)
  })
})

test.group('Admin REST API v1 — Builder', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(resetSharedState)
  group.each.setup(() => limiter.clear())
  group.each.setup(() => {
    emitter.fake()
    return () => emitter.restore()
  })
  group.each.teardown(() => limiter.clear())

  test('fetches presence for a translation', async ({ client, assert }) => {
    const admin = await createAdminUser({
      email: 'admin-builder-presence@example.com',
      permissionSlugs: ['pages.update'],
    })
    const token = await User.accessTokens.create(admin)

    const res = await client
      .get('/api/v1/admin/builder/presence/1')
      .accept('json')
      .bearerToken(token.value!.release())

    res.assertStatus(200)
    assert.isArray(res.body().sessions)
    assert.isArray(res.body().locks)
  })

  test('saves a draft for a translation', async ({ client }) => {
    const admin = await createAdminUser({
      email: 'admin-builder-draft@example.com',
      permissionSlugs: ['pages.update'],
    })
    const token = await User.accessTokens.create(admin)

    const res = await client
      .post('/api/v1/admin/builder/draft/1')
      .accept('json')
      .bearerToken(token.value!.release())
      .json({ content: { blocks: [] } })

    res.assertStatus(200)
  })

  test('builder returns 401 without token', async ({ client }) => {
    const res = await client.get('/api/v1/admin/builder/presence/1').accept('json')
    res.assertStatus(401)
  })
})

test.group('Admin REST API v1 — Theme preference', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(resetSharedState)
  group.each.setup(() => limiter.clear())
  group.each.setup(() => {
    emitter.fake()
    return () => emitter.restore()
  })
  group.each.teardown(() => limiter.clear())

  test('stores the theme preference', async ({ client }) => {
    const admin = await createAdminUser({
      email: 'admin-theme@example.com',
      permissionSlugs: [],
    })
    const token = await User.accessTokens.create(admin)

    const res = await client
      .post('/api/v1/admin/preferences/theme')
      .accept('json')
      .bearerToken(token.value!.release())
      .json({ theme: 'dark' })

    res.assertStatus(200)
  })

  test('theme returns 401 without token', async ({ client }) => {
    const res = await client
      .post('/api/v1/admin/preferences/theme')
      .accept('json')
      .json({ theme: 'dark' })
    res.assertStatus(401)
  })
})
