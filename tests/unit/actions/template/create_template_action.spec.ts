import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { CreateTemplateAction } from '#actions/template/create_template_action'

test.group('CreateTemplateAction', () => {
  test('execute() creates a new template', async ({ assert }) => {
    const action = await app.container.make(CreateTemplateAction)

    const template = await action.execute({
      name: `Created Template ${Date.now()}`,
      type: 'page',
      content: { blocks: [] },
      userId: 1,
    })

    assert.isNotNull(template.id)
    assert.equal(template.type, 'page')
  })
})
