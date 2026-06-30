import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { UpdateTemplateAction } from '#actions/template/update_template_action'
import Template from '#models/template/template'

test.group('UpdateTemplateAction', () => {
  test('execute() updates template fields', async ({ assert }) => {
    const action = await app.container.make(UpdateTemplateAction)

    const template = await Template.create({
      name: `Old Name ${Date.now()}`,
      type: 'page',
      content: { blocks: [] },
      createdBy: null,
    })

    const updated = await action.execute({ id: template.id, name: 'New Name' })
    assert.equal(updated.name, 'New Name')
  })
})
