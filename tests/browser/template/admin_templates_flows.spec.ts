import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createAdminUser, CMS_PERMISSIONS } from '#tests/helpers/browser/create_admin_user'
import { login } from '#tests/helpers/browser/login'
import { visitPage } from '#tests/helpers/browser/visit_page'
import { fillField } from '#tests/helpers/browser/fill_field'
import { waitForInertiaResponse } from '#tests/helpers/browser/wait_for_inertia_response'
import Template from '#cms/models/template/template'
import type { PageContent } from '#cms/types/page'

const blockContent: PageContent = {
  blocks: [{ id: 'b1', type: 'section', props: {}, children: [] }],
} as PageContent

test.group('Admin templates index flows', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('edit page renders, rename persists, and delete removes the template', async ({
    visit,
    route,
    assert,
  }) => {
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

    await login(route('auth.session.render'), visit, 'tpl-flow@example.com', 'TestPassword123!')

    const editPage = await visitPage(route('admin.templates.edit', { id: template.id }), visit)

    await editPage.getByRole('heading', { name: /Edit template:/ }).waitFor({ timeout: 10000 })
    const titleText = await editPage.getByRole('heading', { name: /Edit template:/ }).textContent()
    assert.isTrue(titleText?.includes('AdminFlow Template'))

    await fillField(editPage, 'input', 'name', 'AdminFlow Renamed')
    await fillField(editPage, 'textarea', 'description', 'Updated description')

    const updateResponse = await waitForInertiaResponse(editPage, '/admin/templates/', () =>
      editPage.getByRole('button', { name: /Save changes/i }).click()
    )
    assert.isTrue(updateResponse.ok())

    await editPage.getByText(/Template updated successfully/).waitFor({ timeout: 10000 })

    const refreshed = await Template.query().where('id', template.id).firstOrFail()
    assert.equal(refreshed.name, 'AdminFlow Renamed')
    assert.equal(refreshed.description, 'Updated description')

    const indexPage = await visitPage(route('admin.templates.render'), visit)
    await indexPage.getByText('AdminFlow Renamed').waitFor({ timeout: 10000 })

    const deleteButton = indexPage.getByRole('button', {
      name: /Delete the template: AdminFlow Renamed/i,
    })
    await deleteButton.waitFor({ timeout: 5000 })

    indexPage.on('dialog', (dialog) => dialog.accept())

    const deleteResponse = await waitForInertiaResponse(indexPage, '/admin/templates', () =>
      deleteButton.click()
    )
    assert.isTrue(deleteResponse.ok())

    await indexPage.getByText(/Template deleted successfully/).waitFor({ timeout: 10000 })

    const gone = await Template.query().where('id', template.id).first()
    assert.isNull(gone)
  })
})
