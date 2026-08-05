import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import { createAdminUser, CMS_PERMISSIONS } from '#tests/helpers/browser/create_admin_user'
import { login } from '#tests/helpers/browser/login'
import { waitForBuilderReady } from '#tests/helpers/browser/wait_for_builder_ready'
import { PageFactory } from '#database/factories/page_factory'
import PageTranslation from '#models/page/page_translation'
import type { PageContent } from '#types/page'

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

/**
 * E2E coverage for the five new builder block types (video, carousel, list,
 * quote, iframe): they can be inserted through the builder UI and they render
 * on the public page.
 */
test.group('Builder — new block types', (group) => {
  group.each.setup(async () => await testUtils.db().truncate())

  test('video and carousel blocks can be added through the picker and saved', async ({
    visit,
    route,
    assert,
  }) => {
    await createAdminUser({ email: 'new-blocks@example.com', permissionSlugs: CMS_PERMISSIONS })

    const page = await PageFactory.with('translations', 1, (translation) =>
      translation.merge({
        locale: 'en',
        slug: 'new-blocks-target',
        status: 'published',
        publishedAt: DateTime.now(),
      })
    ).create()
    const translation = await PageTranslation.findByOrFail({ pageId: page.id, locale: 'en' })

    await login(route('auth.session.render'), visit, 'new-blocks@example.com', 'TestPassword123!')

    const editor = await visit(route('admin.pages_update.render', { id: page.id }), {
      waitUntil: 'commit',
    })
    await waitForBuilderReady(editor)

    // Insert a video block through the picker and set its URL in the editor.
    const addButton = editor.getByTitle('Add block')
    await addButton.waitFor({ state: 'visible', timeout: 20000 })
    await addButton.click()
    await editor.getByRole('button', { name: 'Video' }).click()
    await editor.locator('#url').fill(YOUTUBE_URL)

    // Insert a carousel block through the picker.
    await editor.getByTitle('Add block').click()
    await editor.getByRole('button', { name: 'Carousel' }).click()

    // Persist the builder state.
    await editor.getByRole('button', { name: 'Save', exact: true }).click()
    await editor
      .waitForResponse((res) => res.url().includes('/edit') && res.request().method() === 'POST', {
        timeout: 15000,
      })
      .catch(() => {})

    await translation.refresh()
    const blocks = (translation.content as PageContent).blocks
    const types = blocks.map((b) => b.type)
    assert.includeMembers(types, ['video', 'carousel'])

    const video = blocks.find((b) => b.type === 'video')
    assert.equal((video?.props as { url?: string }).url, YOUTUBE_URL)
  })

  test('the five new block types render on the public page', async ({ visit, assert }) => {
    const slug = 'new-blocks-public'
    const content: PageContent = {
      blocks: [
        {
          id: 'b-video-embed',
          type: 'video',
          props: { url: YOUTUBE_URL, caption: 'Intro video', aspect: { default: '16:9' } },
        },
        {
          id: 'b-carousel',
          type: 'carousel',
          props: { aspect: { default: '16:9' }, showArrows: true, showDots: true },
          children: [
            { id: 'b-slide-1', type: 'paragraph', props: { text: 'Slide one body' } },
            { id: 'b-slide-2', type: 'paragraph', props: { text: 'Slide two body' } },
          ],
        },
        {
          id: 'b-list',
          type: 'list',
          props: { ordered: false, items: ['First bullet', 'Second bullet'] },
        },
        {
          id: 'b-quote',
          type: 'quote',
          props: { text: 'To be or not to be', attribution: 'Shakespeare', variant: 'default' },
        },
        {
          id: 'b-iframe',
          type: 'iframe',
          props: { url: 'https://www.google.com/maps/embed?pb=abc', title: 'Office map' },
        },
      ],
    } as PageContent

    await PageFactory.with('translations', 1, (translation) =>
      translation.merge({
        locale: 'en',
        slug,
        status: 'published',
        publishedAt: DateTime.now(),
        content,
      })
    ).create()

    const publicPage = await visit(`/en/${slug}`, { waitUntil: 'domcontentloaded' })

    // Video embed → sandboxed iframe pointing at the YouTube embed player.
    await publicPage.waitForSelector('iframe[src*="youtube-nocookie.com/embed/dQw4w9WgXcQ"]', {
      timeout: 15000,
    })
    // Caption
    await publicPage.waitForSelector('text=Intro video', { timeout: 15000 })

    // Carousel → first slide visible, navigation dots present (2 slides).
    await publicPage.waitForSelector('text=Slide one body', { timeout: 15000 })
    const dots = await publicPage.locator('button[aria-label^="Go to slide"]').count()
    assert.equal(dots, 2)

    // List.
    await publicPage.waitForSelector('text=First bullet', { timeout: 15000 })

    // Quote.
    await publicPage.waitForSelector('text=To be or not to be', { timeout: 15000 })
    await publicPage.waitForSelector('text=Shakespeare', { timeout: 15000 })

    // Iframe (allowlisted host kept by the resolver).
    await publicPage.waitForSelector('iframe[src*="google.com/maps/embed"]', { timeout: 15000 })
  })
})
