import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { GetTemplateDetailAction } from '#actions/template/get_template_detail_action'
import Template from '#models/template/template'

test.group('GetTemplateDetailAction', () => {
  test('execute() returns the template', async ({ assert }) => {
    const action = await app.container.make(GetTemplateDetailAction)

    const template = await Template.create({
      name: `Detail Template ${Date.now()}`,
      type: 'page',
      content: { blocks: [] },
      createdBy: null,
    })

    const result = await action.execute({ id: template.id })
    assert.equal(result.id, template.id)
  })

  test('execute() throws when template not found', async ({ assert }) => {
    const action = await app.container.make(GetTemplateDetailAction)

    await assert.rejects(async () => {
      await action.execute({ id: 999999 })
    })
  })
})
