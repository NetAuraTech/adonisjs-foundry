import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Page from '#models/page/page'
import PageTranslation from '#models/page/page_translation'
import type { PageContent } from '#types/page'

/**
 * CMS Page seeder.
 *
 * Creates a small set of realistic pages covering all block types so you
 * can verify the renderer end-to-end without building an editor first.
 *
 * Run with:
 *   node ace db:seed --files database/seeders/cms/page_seeder.ts
 *
 * Pages created:
 *   - Home page         (hero + rich_text + button_cta)          → /home
 *   - About page        (section > title + rich_text)            → /about
 *   - Contact page      (section > title + contact_form)         → /contact
 *   - Grid showcase     (section > grid > [image, image])        → /grid-demo
 *   - Typography demo   (section > [title × 4 + separator × 3 + rich_text]) → /typography
 */
export default class extends BaseSeeder {
  async run() {
    // ─── Home page ────────────────────────────────────────────────────────────

    const homePage = await Page.updateOrCreate(
      { defaultLocale: 'en' },
      { defaultLocale: 'en', metaImageId: null, createdBy: null }
    )

    const homeContent: PageContent = {
      blocks: [
        {
          id: 'hero-1',
          type: 'hero',
          props: {
            title: 'Welcome to Foundry',
            subtitle: 'A powerful headless CMS built on AdonisJS.',
            cta: { label: 'Get started', href: '/about', variant: 'primary' },
            image: null,
            align: 'center',
            background: 'primary-mid',
            minHeight: 'lg',
          },
        },
        {
          id: 'rich-1',
          type: 'rich_text',
          props: {
            content:
              '<p>Foundry gives your team a flexible, composable page builder. Drag blocks, publish in seconds.</p>',
            align: 'center',
          },
        },
        {
          id: 'cta-1',
          type: 'button_cta',
          props: {
            label: 'Browse the docs',
            href: 'https://docs.example.com',
            variant: 'accent',
            size: 'lg',
            align: 'center',
            openInNewTab: true,
            icon: '',
          },
        },
      ],
    }

    await PageTranslation.updateOrCreate(
      { pageId: homePage.id, locale: 'en' },
      {
        pageId: homePage.id,
        locale: 'en',
        slug: 'home',
        title: 'Home',
        metaTitle: 'Home — Foundry CMS',
        metaDescription: 'Welcome to Foundry, a composable CMS built on AdonisJS.',
        content: homeContent,
        status: 'published',
      }
    )

    await PageTranslation.updateOrCreate(
      { pageId: homePage.id, locale: 'fr' },
      {
        pageId: homePage.id,
        locale: 'fr',
        slug: 'accueil',
        title: 'Accueil',
        metaTitle: 'Accueil — Foundry CMS',
        metaDescription: 'Bienvenue sur Foundry, un CMS composable basé sur AdonisJS.',
        content: {
          blocks: [
            {
              id: 'hero-1-fr',
              type: 'hero',
              props: {
                title: 'Bienvenue sur Foundry',
                subtitle: 'Un CMS headless puissant construit avec AdonisJS.',
                cta: { label: 'Démarrer', href: '/fr/a-propos', variant: 'primary' },
                image: null,
                align: 'center',
                background: 'primary-mid',
                minHeight: 'lg',
              },
            },
          ],
        },
        status: 'published',
      }
    )

    // ─── About page ───────────────────────────────────────────────────────────

    const aboutPage = await Page.create({ defaultLocale: 'en', metaImageId: null, createdBy: null })

    const aboutContent: PageContent = {
      blocks: [
        {
          id: 'section-about',
          type: 'section',
          props: {
            background: 'canvas',
            paddingY: { default: 'lg', md: 'xl' },
            paddingX: { default: 'md', md: 'lg' },
            maxWidth: 'xl',
            rounded: false,
          },
          children: [
            {
              id: 'title-about',
              type: 'title',
              props: { text: 'About Foundry', level: 1, align: 'left', color: 'default' },
            },
            {
              id: 'sep-about',
              type: 'separator',
              props: { style: 'solid', spacing: 'md', color: 'default' },
            },
            {
              id: 'rich-about',
              type: 'rich_text',
              props: {
                content:
                  '<p>Foundry is an open-source CMS framework built on top of AdonisJS v7. It provides a batteries-included page builder, a flexible media library, and a powerful permission system.</p><p>Everything is fully type-safe from the database to the React renderer.</p>',
                align: 'left',
              },
            },
          ],
        },
      ],
    }

    await PageTranslation.create({
      pageId: aboutPage.id,
      locale: 'en',
      slug: 'about',
      title: 'About',
      metaTitle: 'About — Foundry CMS',
      metaDescription: 'Learn more about the Foundry CMS project.',
      content: aboutContent,
      status: 'published',
    })

    // ─── Contact page ─────────────────────────────────────────────────────────

    const contactPage = await Page.create({
      defaultLocale: 'en',
      metaImageId: null,
      createdBy: null,
    })

    const contactContent: PageContent = {
      blocks: [
        {
          id: 'section-contact',
          type: 'section',
          props: {
            background: 'surface',
            paddingY: { default: 'lg' },
            paddingX: { default: 'md', md: 'lg' },
            maxWidth: 'lg',
            rounded: true,
          },
          children: [
            {
              id: 'title-contact',
              type: 'title',
              props: { text: 'Get in touch', level: 2, align: 'center', color: 'default' },
            },
            {
              id: 'rich-contact',
              type: 'rich_text',
              props: {
                content:
                  "<p>Fill in the form below and we'll get back to you as soon as possible.</p>",
                align: 'center',
              },
            },
            {
              id: 'form-contact',
              type: 'contact_form',
              props: {
                title: null,
                recipientEmail: 'hello@example.com',
                submitLabel: 'Send message',
                successMessage: 'Thank you! We will reply shortly.',
                fields: [
                  {
                    name: 'name',
                    label: 'Your name',
                    type: 'text',
                    required: true,
                  },
                  {
                    name: 'email',
                    label: 'Your email',
                    type: 'email',
                    required: true,
                  },
                  {
                    name: 'subject',
                    label: 'Subject',
                    type: 'text',
                    required: false,
                  },
                  {
                    name: 'message',
                    label: 'Message',
                    type: 'textarea',
                    required: true,
                  },
                ],
              },
            },
          ],
        },
      ],
    }

    await PageTranslation.create({
      pageId: contactPage.id,
      locale: 'en',
      slug: 'contact',
      title: 'Contact',
      metaTitle: 'Contact — Foundry CMS',
      metaDescription: 'Get in touch with the Foundry team.',
      content: contactContent,
      status: 'published',
    })

    // ─── Grid showcase ────────────────────────────────────────────────────────

    const gridPage = await Page.create({ defaultLocale: 'en', metaImageId: null, createdBy: null })

    const gridContent: PageContent = {
      blocks: [
        {
          id: 'section-grid',
          type: 'section',
          props: {
            background: 'canvas',
            paddingY: { default: 'lg' },
            paddingX: { default: 'md' },
            maxWidth: '2xl',
            rounded: false,
          },
          children: [
            {
              id: 'title-grid',
              type: 'title',
              props: { text: 'Grid demo', level: 2, align: 'center', color: 'default' },
            },
            {
              id: 'grid-1',
              type: 'grid',
              props: {
                cols: { default: 1, md: 2, lg: 3 },
                gap: { default: 'md' },
              },
              children: [
                {
                  id: 'rich-a',
                  type: 'rich_text',
                  props: {
                    content: '<p><strong>Column 1</strong> — This is the first grid cell.</p>',
                    align: 'left',
                  },
                },
                {
                  id: 'rich-b',
                  type: 'rich_text',
                  props: {
                    content: '<p><strong>Column 2</strong> — This is the second grid cell.</p>',
                    align: 'left',
                  },
                },
                {
                  id: 'rich-c',
                  type: 'rich_text',
                  props: {
                    content: '<p><strong>Column 3</strong> — This is the third grid cell.</p>',
                    align: 'left',
                  },
                },
              ],
            },
          ],
        },
      ],
    }

    await PageTranslation.create({
      pageId: gridPage.id,
      locale: 'en',
      slug: 'grid-demo',
      title: 'Grid Demo',
      metaTitle: null,
      metaDescription: null,
      content: gridContent,
      status: 'published',
    })

    // ─── Typography demo ──────────────────────────────────────────────────────

    const typoPage = await Page.create({ defaultLocale: 'en', metaImageId: null, createdBy: null })

    const typoContent: PageContent = {
      blocks: [
        {
          id: 'section-typo',
          type: 'section',
          props: {
            background: 'canvas',
            paddingY: { default: 'lg' },
            paddingX: { default: 'md', md: 'lg' },
            maxWidth: 'xl',
            rounded: false,
          },
          children: [
            {
              id: 'h1',
              type: 'title',
              props: { text: 'Heading 1', level: 1, align: 'left', color: 'default' },
            },
            {
              id: 'sep1',
              type: 'separator',
              props: { style: 'solid', spacing: 'sm', color: 'default' },
            },
            {
              id: 'h2',
              type: 'title',
              props: { text: 'Heading 2', level: 2, align: 'left', color: 'muted' },
            },
            {
              id: 'sep2',
              type: 'separator',
              props: { style: 'dashed', spacing: 'sm', color: 'default' },
            },
            {
              id: 'h3',
              type: 'title',
              props: { text: 'Heading 3', level: 3, align: 'left', color: 'primary' },
            },
            {
              id: 'sep3',
              type: 'separator',
              props: { style: 'dotted', spacing: 'sm', color: 'default' },
            },
            {
              id: 'h4',
              type: 'title',
              props: { text: 'Heading 4', level: 4, align: 'left', color: 'accent' },
            },
            {
              id: 'rich-typo',
              type: 'rich_text',
              props: {
                content:
                  '<p>This is a <strong>bold</strong>, <em>italic</em>, and <u>underlined</u> paragraph. Here is a <a href="#">link</a>.</p><blockquote><p>A blockquote looks like this.</p></blockquote><pre><code>const greeting = "Hello, world!"</code></pre><ul><li>List item one</li><li>List item two</li><li>List item three</li></ul>',
                align: 'left',
              },
            },
            {
              id: 'cta-typo',
              type: 'button_cta',
              props: {
                label: 'Primary CTA',
                href: '#',
                variant: 'primary',
                size: 'md',
                align: 'left',
                openInNewTab: false,
                icon: '',
              },
            },
          ],
        },
      ],
    }

    await PageTranslation.create({
      pageId: typoPage.id,
      locale: 'en',
      slug: 'typography',
      title: 'Typography Demo',
      metaTitle: null,
      metaDescription: null,
      content: typoContent,
      status: 'published',
    })

    console.log('✅ CMS pages seeded successfully')
    console.log('   Pages available at:')
    console.log('   → /home           (hero + rich_text + button_cta)')
    console.log('   → /about          (section > title + separator + rich_text)')
    console.log('   → /contact        (section > title + contact_form)')
    console.log('   → /grid-demo      (section > grid 3 cols)')
    console.log('   → /typography     (all typography blocks)')
    console.log('   → /fr/accueil     (FR translation of home)')
  }
}
