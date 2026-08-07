import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { CreateTemplateAction } from '#cms/domain/actions/template/create_template_action'
import { UserFactory } from '#database/factories/user_factory'

test.group('CreateTemplateAction', () => {
  test('execute() creates a new template', async ({ assert }) => {
    const action = await app.container.make(CreateTemplateAction)
    const user = await UserFactory.create()

    const template = await action.execute({
      name: `Created Template ${Date.now()}`,
      type: 'page',
      content: { blocks: [] },
      userId: user.id,
    })

    assert.isNotNull(template.id)
    assert.equal(template.type, 'page')
  })
})
