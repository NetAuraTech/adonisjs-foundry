import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Template from '#models/template/template'
import type { PageContent } from '#types/page'

/**
 * CMS Template seeder.
 *
 * Creates a set of reusable templates covering both types:
 *   - `page`  → full page layouts applied to a translation's entire block tree
 *   - `block` → single block presets inserted at a specific position
 *
 * Run with:
 *   node ace db:seed --files database/seeders/cms/template_seeder.ts
 *
 * Templates created:
 *   Page templates:
 *     - Landing page          (hero + section + grid 3 cols + CTA)
 *     - Article               (section > title + separator + rich_text)
 *     - Contact page          (section > title + rich_text + contact_form)
 *     - Coming soon           (hero full-screen + separator + CTA)
 *
 *   Block templates:
 *     - Hero (centered)       hero block preset
 *     - Hero (left-aligned)   hero block preset
 *     - 2-column grid         grid preset
 *     - 3-column grid         grid preset
 *     - Feature section       section > grid 3 cols
 *     - Testimonial           section > rich_text (blockquote style)
 *     - CTA banner            section (primary bg) > title + button
 *     - Simple separator      separator preset
 */
export default class extends BaseSeeder {
  async run() {
    // ─── Page templates ───────────────────────────────────────────────────────

    await Template.updateOrCreate(
      { name: 'Landing page' },
      {
        name: 'Landing page',
        description: 'Hero banner, a 3-column feature grid, and a CTA section.',
        type: 'page',
        blockType: null,
        thumbnailId: null,
        createdBy: null,
        content: {
          blocks: [
            {
              id: 'hero',
              type: 'hero',
              props: {
                title: 'Your headline here',
                subtitle: 'A short supporting sentence that reinforces the value proposition.',
                cta: { label: 'Get started', href: '#', variant: 'primary' },
                image: null,
                align: 'center',
                background: 'primary-mid',
                minHeight: 'lg',
              },
            },
            {
              id: 'features-section',
              type: 'section',
              props: {
                background: 'canvas',
                paddingY: { default: 'xl' },
                paddingX: { default: 'md', md: 'lg' },
                maxWidth: '2xl',
                rounded: false,
              },
              children: [
                {
                  id: 'features-title',
                  type: 'title',
                  props: { text: 'Why choose us', level: 2, align: 'center', color: 'default' },
                },
                {
                  id: 'features-grid',
                  type: 'grid',
                  props: {
                    cols: { default: 1, md: 3 },
                    gap: { default: 'lg' },
                  },
                  children: [
                    {
                      id: 'feature-1',
                      type: 'rich_text',
                      props: {
                        content:
                          '<h3>Feature one</h3><p>Explain the first key benefit clearly and concisely.</p>',
                        align: 'left',
                      },
                    },
                    {
                      id: 'feature-2',
                      type: 'rich_text',
                      props: {
                        content:
                          '<h3>Feature two</h3><p>Explain the second key benefit clearly and concisely.</p>',
                        align: 'left',
                      },
                    },
                    {
                      id: 'feature-3',
                      type: 'rich_text',
                      props: {
                        content:
                          '<h3>Feature three</h3><p>Explain the third key benefit clearly and concisely.</p>',
                        align: 'left',
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: 'cta-section',
              type: 'section',
              props: {
                background: 'primary-soft',
                paddingY: { default: 'lg' },
                paddingX: { default: 'md' },
                maxWidth: 'xl',
                rounded: true,
              },
              children: [
                {
                  id: 'cta-title',
                  type: 'title',
                  props: {
                    text: 'Ready to get started?',
                    level: 2,
                    align: 'center',
                    color: 'primary',
                  },
                },
                {
                  id: 'cta-btn',
                  type: 'button_cta',
                  props: {
                    label: 'Start now',
                    href: '#',
                    variant: 'primary',
                    size: 'lg',
                    align: 'center',
                    openInNewTab: false,
                    icon: '',
                  },
                },
              ],
            },
          ],
        } satisfies PageContent,
      }
    )

    await Template.updateOrCreate(
      { name: 'Article' },
      {
        name: 'Article',
        description: 'Minimal single-column layout for blog posts or documentation pages.',
        type: 'page',
        blockType: null,
        thumbnailId: null,
        createdBy: null,
        content: {
          blocks: [
            {
              id: 'article-section',
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
                  id: 'article-title',
                  type: 'title',
                  props: { text: 'Article title', level: 1, align: 'left', color: 'default' },
                },
                {
                  id: 'article-meta',
                  type: 'rich_text',
                  props: {
                    content: '<p><em>Published on January 1, 2025 · 5 min read</em></p>',
                    align: 'left',
                  },
                },
                {
                  id: 'article-sep',
                  type: 'separator',
                  props: { style: 'solid', spacing: 'md', color: 'default' },
                },
                {
                  id: 'article-body',
                  type: 'rich_text',
                  props: {
                    content:
                      '<p>Start writing your article here. You can use <strong>bold</strong>, <em>italic</em>, <a href="#">links</a>, and all standard formatting.</p><h2>A sub-heading</h2><p>Continue with the next section of your content.</p><blockquote><p>A memorable quote or key takeaway from your article.</p></blockquote>',
                    align: 'left',
                  },
                },
              ],
            },
          ],
        } satisfies PageContent,
      }
    )

    await Template.updateOrCreate(
      { name: 'Contact page' },
      {
        name: 'Contact page',
        description: 'Title, intro paragraph, and a ready-to-use contact form.',
        type: 'page',
        blockType: null,
        thumbnailId: null,
        createdBy: null,
        content: {
          blocks: [
            {
              id: 'contact-section',
              type: 'section',
              props: {
                background: 'canvas',
                paddingY: { default: 'lg', md: 'xl' },
                paddingX: { default: 'md', md: 'lg' },
                maxWidth: 'lg',
                rounded: false,
              },
              children: [
                {
                  id: 'contact-title',
                  type: 'title',
                  props: { text: 'Get in touch', level: 1, align: 'center', color: 'default' },
                },
                {
                  id: 'contact-intro',
                  type: 'rich_text',
                  props: {
                    content:
                      "<p>Fill in the form below and we'll get back to you as soon as possible.</p>",
                    align: 'center',
                  },
                },
                {
                  id: 'contact-sep',
                  type: 'separator',
                  props: { style: 'solid', spacing: 'md', color: 'default' },
                },
                {
                  id: 'contact-form',
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
        } satisfies PageContent,
      }
    )

    await Template.updateOrCreate(
      { name: 'Coming soon' },
      {
        name: 'Coming soon',
        description: 'Full-screen hero with a teaser message and a CTA.',
        type: 'page',
        blockType: null,
        thumbnailId: null,
        createdBy: null,
        content: {
          blocks: [
            {
              id: 'coming-hero',
              type: 'hero',
              props: {
                title: 'Something exciting is coming',
                subtitle: "We're working hard to bring you something great. Stay tuned.",
                cta: { label: 'Notify me', href: '#', variant: 'secondary' },
                image: null,
                align: 'center',
                background: 'primary-deep',
                minHeight: 'screen',
              },
            },
          ],
        } satisfies PageContent,
      }
    )

    // ─── Block templates ──────────────────────────────────────────────────────

    await Template.updateOrCreate(
      { name: 'Hero — centered' },
      {
        name: 'Hero — centered',
        description: 'Large centred hero with title, subtitle and a primary CTA button.',
        type: 'block',
        blockType: 'hero',
        thumbnailId: null,
        createdBy: null,
        content: {
          blocks: [
            {
              id: 'hero-centered',
              type: 'hero',
              props: {
                title: 'Your headline here',
                subtitle: 'A short supporting sentence.',
                cta: { label: 'Learn more', href: '#', variant: 'primary' },
                image: null,
                align: 'center',
                background: 'canvas',
                minHeight: 'md',
              },
            },
          ],
        } satisfies PageContent,
      }
    )

    await Template.updateOrCreate(
      { name: 'Hero — left aligned' },
      {
        name: 'Hero — left aligned',
        description: 'Left-aligned hero with a primary background — great for product intros.',
        type: 'block',
        blockType: 'hero',
        thumbnailId: null,
        createdBy: null,
        content: {
          blocks: [
            {
              id: 'hero-left',
              type: 'hero',
              props: {
                title: 'Built for teams that move fast',
                subtitle: "Everything you need, nothing you don't.",
                cta: { label: 'Get started', href: '#', variant: 'primary' },
                image: null,
                align: 'left',
                background: 'primary-mid',
                minHeight: 'lg',
              },
            },
          ],
        } satisfies PageContent,
      }
    )

    await Template.updateOrCreate(
      { name: '2-column grid' },
      {
        name: '2-column grid',
        description: 'Two equal columns, responsive (stacks on mobile).',
        type: 'block',
        blockType: 'grid',
        thumbnailId: null,
        createdBy: null,
        content: {
          blocks: [
            {
              id: 'grid-2col',
              type: 'grid',
              props: {
                cols: { default: 1, md: 2 },
                gap: { default: 'md' },
              },
              children: [
                {
                  id: 'col-1',
                  type: 'rich_text',
                  props: { content: '<p>Left column content.</p>', align: 'left' },
                },
                {
                  id: 'col-2',
                  type: 'rich_text',
                  props: { content: '<p>Right column content.</p>', align: 'left' },
                },
              ],
            },
          ],
        } satisfies PageContent,
      }
    )

    await Template.updateOrCreate(
      { name: '3-column grid' },
      {
        name: '3-column grid',
        description: 'Three equal columns (stacks to 1 on mobile, 2 on tablet).',
        type: 'block',
        blockType: 'grid',
        thumbnailId: null,
        createdBy: null,
        content: {
          blocks: [
            {
              id: 'grid-3col',
              type: 'grid',
              props: {
                cols: { default: 1, md: 2, lg: 3 },
                gap: { default: 'md' },
              },
              children: [
                {
                  id: 'col-a',
                  type: 'rich_text',
                  props: { content: '<p>Column 1.</p>', align: 'left' },
                },
                {
                  id: 'col-b',
                  type: 'rich_text',
                  props: { content: '<p>Column 2.</p>', align: 'left' },
                },
                {
                  id: 'col-c',
                  type: 'rich_text',
                  props: { content: '<p>Column 3.</p>', align: 'left' },
                },
              ],
            },
          ],
        } satisfies PageContent,
      }
    )

    await Template.updateOrCreate(
      { name: 'Feature section' },
      {
        name: 'Feature section',
        description: 'Section with a heading and a 3-column feature grid below it.',
        type: 'block',
        blockType: 'section',
        thumbnailId: null,
        createdBy: null,
        content: {
          blocks: [
            {
              id: 'feature-section',
              type: 'section',
              props: {
                background: 'canvas',
                paddingY: { default: 'xl' },
                paddingX: { default: 'md', md: 'lg' },
                maxWidth: '2xl',
                rounded: false,
              },
              children: [
                {
                  id: 'feature-heading',
                  type: 'title',
                  props: { text: 'Our features', level: 2, align: 'center', color: 'default' },
                },
                {
                  id: 'feature-sub',
                  type: 'rich_text',
                  props: {
                    content:
                      '<p>A short supporting paragraph explaining what makes you different.</p>',
                    align: 'center',
                  },
                },
                {
                  id: 'feature-sep',
                  type: 'separator',
                  props: { style: 'none', spacing: 'sm', color: 'transparent' },
                },
                {
                  id: 'feature-grid',
                  type: 'grid',
                  props: {
                    cols: { default: 1, md: 3 },
                    gap: { default: 'lg' },
                  },
                  children: [
                    {
                      id: 'feat-a',
                      type: 'rich_text',
                      props: {
                        content: '<h3>⚡ Fast</h3><p>Built for speed from the ground up.</p>',
                        align: 'left',
                      },
                    },
                    {
                      id: 'feat-b',
                      type: 'rich_text',
                      props: {
                        content:
                          '<h3>🔒 Secure</h3><p>Security best practices applied by default.</p>',
                        align: 'left',
                      },
                    },
                    {
                      id: 'feat-c',
                      type: 'rich_text',
                      props: {
                        content:
                          '<h3>🧩 Flexible</h3><p>Composable blocks for any layout you need.</p>',
                        align: 'left',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        } satisfies PageContent,
      }
    )

    await Template.updateOrCreate(
      { name: 'CTA banner' },
      {
        name: 'CTA banner',
        description: 'Primary-coloured section with a bold heading and a centred CTA button.',
        type: 'block',
        blockType: 'section',
        thumbnailId: null,
        createdBy: null,
        content: {
          blocks: [
            {
              id: 'cta-banner',
              type: 'section',
              props: {
                background: 'primary-mid',
                paddingY: { default: 'lg' },
                paddingX: { default: 'md' },
                maxWidth: 'xl',
                rounded: true,
              },
              children: [
                {
                  id: 'cta-banner-title',
                  type: 'title',
                  props: {
                    text: 'Ready to get started?',
                    level: 2,
                    align: 'center',
                    color: 'default',
                  },
                },
                {
                  id: 'cta-banner-sub',
                  type: 'rich_text',
                  props: {
                    content: '<p>Join thousands of teams already using our product.</p>',
                    align: 'center',
                  },
                },
                {
                  id: 'cta-banner-btn',
                  type: 'button_cta',
                  props: {
                    label: 'Start for free',
                    href: '#',
                    variant: 'accent',
                    size: 'lg',
                    align: 'center',
                    openInNewTab: false,
                    icon: '',
                  },
                },
              ],
            },
          ],
        } satisfies PageContent,
      }
    )

    await Template.updateOrCreate(
      { name: 'Testimonial' },
      {
        name: 'Testimonial',
        description: 'Surface-background section with a blockquote and author attribution.',
        type: 'block',
        blockType: 'section',
        thumbnailId: null,
        createdBy: null,
        content: {
          blocks: [
            {
              id: 'testimonial-section',
              type: 'section',
              props: {
                background: 'surface',
                paddingY: { default: 'lg' },
                paddingX: { default: 'md', md: 'xl' },
                maxWidth: 'lg',
                rounded: true,
              },
              children: [
                {
                  id: 'testimonial-text',
                  type: 'rich_text',
                  props: {
                    content:
                      '<blockquote><p>"This product completely changed how our team works. We ship faster and with more confidence than ever before."</p></blockquote><p><strong>Jane Doe</strong> · CEO at Acme Corp</p>',
                    align: 'center',
                  },
                },
              ],
            },
          ],
        } satisfies PageContent,
      }
    )

    await Template.updateOrCreate(
      { name: 'Simple separator' },
      {
        name: 'Simple separator',
        description: 'A solid horizontal rule with medium vertical spacing.',
        type: 'block',
        blockType: 'separator',
        thumbnailId: null,
        createdBy: null,
        content: {
          blocks: [
            {
              id: 'separator',
              type: 'separator',
              props: { style: 'solid', spacing: 'md', color: 'default' },
            },
          ],
        } satisfies PageContent,
      }
    )

    console.log('✅ CMS templates seeded successfully')
    console.log('   Page templates (4):')
    console.log('     → Landing page')
    console.log('     → Article')
    console.log('     → Contact page')
    console.log('     → Coming soon')
    console.log('   Block templates (8):')
    console.log('     → Hero — centered / left aligned')
    console.log('     → 2-column grid / 3-column grid')
    console.log('     → Feature section')
    console.log('     → CTA banner')
    console.log('     → Testimonial')
    console.log('     → Simple separator')
  }
}
