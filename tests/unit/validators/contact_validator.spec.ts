import { test } from '@japa/runner'
import { contactValidator } from '#validators/contact'

/**
 * Unit tests for `contactValidator`.
 * No database required — pure schema validation.
 */
test.group('Contact validator', () => {
  const validPayload = {
    name: 'John Doe',
    message: 'Hello there!',
  }

  test('accepts a fully valid payload', async ({ assert }) => {
    const result = await contactValidator.validate(validPayload)
    assert.equal(result.pageId, 1)
    assert.equal(result.locale, 'en')
    assert.equal(result.recipientEmail, 'contact@example.com')
    assert.lengthOf(result.fields, 2)
  })

  // ─── fields ───────────────────────────────────────────────────────────────
  test('rejects a field value exceeding 2000 characters', async ({ assert }) => {
    await assert.rejects(() =>
      contactValidator.validate({
        ...validPayload,
        message: 'a'.repeat(2001),
      })
    )
  })

  test('trims field value', async ({ assert }) => {
    const result = await contactValidator.validate({
      ...validPayload,
      name: '  John  ',
    })
    assert.equal(result.name, 'John')
  })

  test('accepts multiple fields', async ({ assert }) => {
    const result = await contactValidator.validate({
      ...validPayload,
      name: 'Alice',
      email: 'alice@example.com',
      message: 'Hi there!',
    })
    assert.lengthOf(result.fields, 3)
  })
})
