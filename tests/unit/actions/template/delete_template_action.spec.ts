import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { DeleteTemplateAction } from '#actions/template/delete_template_action'
import Template from '#models/template/template'

test.group('DeleteTemplateAction', () => {
  test('execute() deletes the template', async ({ assert }) => {
    const action = await app.container.make(DeleteTemplateAction)

    const template = await Template.create({
      name: `Delete Template ${Date.now()}`,
      type: 'page',
      content: { blocks: [] },
      createdBy: null,
    })

    await action.execute({ id: template.id })

    const found = await Template.find(template.id)
    assert.isNull(found)
  })
})
