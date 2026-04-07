import { test } from '@japa/runner'
import { contactValidator } from '#validators/contact'

/**
 * Unit tests for `contactValidator`.
 * No database required — pure schema validation.
 */
test.group('Contact validator', () => {
  const validPayload = {
    pageId: 1,
    locale: 'en',
    recipientEmail: 'contact@example.com',
    fields: [
      { name: 'name', value: 'John Doe' },
      { name: 'message', value: 'Hello there!' },
    ],
  }

  test('accepts a fully valid payload', async ({ assert }) => {
    const result = await contactValidator.validate(validPayload)
    assert.equal(result.pageId, 1)
    assert.equal(result.locale, 'en')
    assert.equal(result.recipientEmail, 'contact@example.com')
    assert.lengthOf(result.fields, 2)
  })

  test('accepts an empty fields array', async ({ assert }) => {
    const result = await contactValidator.validate({ ...validPayload, fields: [] })
    assert.deepEqual(result.fields, [])
  })

  // ─── pageId ───────────────────────────────────────────────────────────────

  test('rejects missing pageId', async ({ assert }) => {
    const { pageId, ...rest } = validPayload
    await assert.rejects(() => contactValidator.validate(rest))
  })

  test('rejects non-positive pageId', async ({ assert }) => {
    await assert.rejects(() => contactValidator.validate({ ...validPayload, pageId: 0 }))
    await assert.rejects(() => contactValidator.validate({ ...validPayload, pageId: -1 }))
  })

  // ─── locale ───────────────────────────────────────────────────────────────

  test('rejects missing locale', async ({ assert }) => {
    const { locale, ...rest } = validPayload
    await assert.rejects(() => contactValidator.validate(rest))
  })

  test('trims locale whitespace', async ({ assert }) => {
    const result = await contactValidator.validate({ ...validPayload, locale: '  en  ' })
    assert.equal(result.locale, 'en')
  })

  test('rejects locale longer than 10 characters', async ({ assert }) => {
    await assert.rejects(() =>
      contactValidator.validate({ ...validPayload, locale: 'en-US-extra-long' })
    )
  })

  // ─── recipientEmail ───────────────────────────────────────────────────────

  test('rejects missing recipientEmail', async ({ assert }) => {
    const { recipientEmail, ...rest } = validPayload
    await assert.rejects(() => contactValidator.validate(rest))
  })

  test('rejects an invalid email address', async ({ assert }) => {
    await assert.rejects(() =>
      contactValidator.validate({ ...validPayload, recipientEmail: 'not-an-email' })
    )
    await assert.rejects(() =>
      contactValidator.validate({ ...validPayload, recipientEmail: 'missing@' })
    )
  })

  test('rejects email longer than 254 characters', async ({ assert }) => {
    const long = `${'a'.repeat(245)}@example.com`
    await assert.rejects(() => contactValidator.validate({ ...validPayload, recipientEmail: long }))
  })

  test('trims recipientEmail whitespace', async ({ assert }) => {
    const result = await contactValidator.validate({
      ...validPayload,
      recipientEmail: '  contact@example.com  ',
    })
    assert.equal(result.recipientEmail, 'contact@example.com')
  })

  // ─── fields ───────────────────────────────────────────────────────────────

  test('rejects missing fields array', async ({ assert }) => {
    const { fields, ...rest } = validPayload
    await assert.rejects(() => contactValidator.validate(rest))
  })

  test('rejects a field missing name', async ({ assert }) => {
    await assert.rejects(() =>
      contactValidator.validate({
        ...validPayload,
        fields: [{ value: 'hello' }],
      })
    )
  })

  test('rejects a field missing value', async ({ assert }) => {
    await assert.rejects(() =>
      contactValidator.validate({
        ...validPayload,
        fields: [{ name: 'email' }],
      })
    )
  })

  test('rejects a field value exceeding 2000 characters', async ({ assert }) => {
    await assert.rejects(() =>
      contactValidator.validate({
        ...validPayload,
        fields: [{ name: 'message', value: 'a'.repeat(2001) }],
      })
    )
  })

  test('trims field name and value', async ({ assert }) => {
    const result = await contactValidator.validate({
      ...validPayload,
      fields: [{ name: '  name  ', value: '  John  ' }],
    })
    assert.equal(result.fields[0].name, 'name')
    assert.equal(result.fields[0].value, 'John')
  })

  test('accepts multiple fields', async ({ assert }) => {
    const result = await contactValidator.validate({
      ...validPayload,
      fields: [
        { name: 'name', value: 'Alice' },
        { name: 'email', value: 'alice@example.com' },
        { name: 'message', value: 'Hi there!' },
      ],
    })
    assert.lengthOf(result.fields, 3)
  })
})
