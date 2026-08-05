import { test } from '@japa/runner'
import { sanitizeBuilderOperation } from '#services/page/builder_sanitize'

/**
 * Unit tests for real-time builder operation sanitization (broadcast layer).
 * Pure functions — no database required.
 */
test.group('sanitizeBuilderOperation — UPDATE_PROPS', () => {
  test('sanitizes rich-text string fields (text)', ({ assert }) => {
    const result = sanitizeBuilderOperation('UPDATE_PROPS', {
      blockId: 'b1',
      props: { text: '<p>Hello</p><script>alert(1)</script>' },
    })
    const props = result.props as { text: string }
    assert.isFalse(props.text.includes('<script>'))
    assert.isTrue(props.text.includes('<p>Hello</p>'))
  })

  test('sanitizes video caption fields', ({ assert }) => {
    const result = sanitizeBuilderOperation('UPDATE_PROPS', {
      blockId: 'b1',
      props: { caption: '<em>Nice</em><script>alert(1)</script>' },
    })
    const props = result.props as { caption: string }
    assert.isFalse(props.caption.includes('<script>'))
    assert.isTrue(props.caption.includes('<em>'))
  })

  test('sanitizes quote attribution fields', ({ assert }) => {
    const result = sanitizeBuilderOperation('UPDATE_PROPS', {
      blockId: 'b1',
      props: { attribution: '<strong>Hamlet</strong><script>alert(1)</script>' },
    })
    const props = result.props as { attribution: string }
    assert.isFalse(props.attribution.includes('<script>'))
    assert.isTrue(props.attribution.includes('<strong>'))
  })

  test('sanitizes each entry of list items arrays', ({ assert }) => {
    const result = sanitizeBuilderOperation('UPDATE_PROPS', {
      blockId: 'b1',
      props: { items: ['<em>Safe</em>', '<script>alert(1)</script>Item'] },
    })
    const props = result.props as { items: string[] }
    assert.equal(props.items[0], '<em>Safe</em>')
    assert.isFalse(props.items[1].includes('<script>'))
    assert.isTrue(props.items[1].includes('Item'))
  })

  test('leaves plain fields like url untouched', ({ assert }) => {
    const result = sanitizeBuilderOperation('UPDATE_PROPS', {
      blockId: 'b1',
      props: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    })
    const props = result.props as { url: string }
    assert.equal(props.url, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  })
})

test.group('sanitizeBuilderOperation — ADD_BLOCK', () => {
  test('sanitizes rich-text props of the inserted block', ({ assert }) => {
    const result = sanitizeBuilderOperation('ADD_BLOCK', {
      block: {
        id: 'b1',
        type: 'quote',
        props: { text: 'Quote<script>alert(1)</script>', attribution: 'Me' },
      },
      parentId: 'root',
      index: 0,
    })
    const block = result.block as { props: { text: string; attribution: string } }
    assert.isFalse(block.props.text.includes('<script>'))
    assert.equal(block.props.attribution, 'Me')
  })
})
