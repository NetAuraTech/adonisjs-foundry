import { test } from '@japa/runner'
import emitter from '@adonisjs/core/services/emitter'
import testUtils from '@adonisjs/core/services/test_utils'
import Template from '#cms/models/template/template'
import { createAdminUser, CMS_PERMISSIONS } from '#tests/helpers/create_admin_user'
import { parseInertiaPage } from '#tests/helpers/inertia_page'
import { resetSharedState } from '#tests/helpers/shared_state'

const blockContent: any = { blocks: [{ id: 'b1', type: 'section', props: {}, children: [] }] }

/**
 * Functional seam for the admin template edit/rename/delete flows. Replaces
 * the Playwright E2E (open the edit page, fill the form, confirm the delete
 * dialog) with the HTTP contract each route observes: the edit page renders
 * the template, the update endpoint persists name+description, and the delete
 * endpoint removes the template. These hit the admin (web-guard) routes
 * directly; the REST resource equivalents are covered in
 * `admin_rest_api_cms_extras.spec.ts`.
 */
test.group('Admin templates flows (edit / rename / delete)', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(resetSharedState)
  group.each.setup(() => {
    emitter.fake()
    return () => emitter.restore()
  })

  test('edit page renders the template', async ({ client, assert }) => {
    const admin = await createAdminUser({
      email: 'tpl-flow@example.com',
      permissionSlugs: CMS_PERMISSIONS,
    })
    const template = await Template.create({
      name: 'AdminFlow Template',
      type: 'page',
      blockType: null,
      description: null,
      content: blockContent,
      createdBy: admin.id,
    })

    const res = await client.get(`/admin/templates/${template.id}/edit`).loginAs(admin).send()

    res.assertStatus(200)
    const page = parseInertiaPage(res.text())
    assert.equal(page.props.template.name, 'AdminFlow Template')
  })

  test('renaming a template via the admin endpoint persists', async ({ client, assert }) => {
    const admin = await createAdminUser({
      email: 'tpl-flow-rename@example.com',
      permissionSlugs: CMS_PERMISSIONS,
    })
    const template = await Template.create({
      name: 'AdminFlow Template',
      type: 'page',
      blockType: null,
      description: null,
      content: blockContent,
      createdBy: admin.id,
    })

    const res = await client
      .post(`/admin/templates/${template.id}`)
      .redirects(0)
      .loginAs(admin)
      .withCsrfToken()
      .header('referer', `/admin/templates/${template.id}/edit`)
      .json({
        name: 'AdminFlow Renamed',
        description: 'Updated description',
        content: blockContent,
      })
      .send()

    res.assertStatus(302)

    const refreshed = await Template.find(template.id)
    assert.equal(refreshed!.name, 'AdminFlow Renamed')
    assert.equal(refreshed!.description, 'Updated description')
  })

  test('deleting a template via the admin endpoint removes it', async ({ client, assert }) => {
    const admin = await createAdminUser({
      email: 'tpl-flow-delete@example.com',
      permissionSlugs: CMS_PERMISSIONS,
    })
    const template = await Template.create({
      name: 'AdminFlow To Delete',
      type: 'page',
      blockType: null,
      description: null,
      content: blockContent,
      createdBy: admin.id,
    })

    const res = await client
      .delete(`/admin/templates/${template.id}`)
      .redirects(0)
      .loginAs(admin)
      .withCsrfToken()
      .header('referer', '/admin/templates')
      .send()

    res.assertStatus(302)

    assert.isNull(await Template.find(template.id))
  })
})
