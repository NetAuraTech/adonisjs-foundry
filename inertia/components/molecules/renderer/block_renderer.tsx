import type { ResolvedBlock } from '#types/page'
import SectionBlock from '~/components/atoms/blocks/section_block'
import HeroBlock from '~/components/atoms/blocks/hero_block'
import TitleBlock from '~/components/atoms/blocks/title_block'
import RichTextBlock from '~/components/atoms/blocks/rich_text_block'
import ImageBlock from '~/components/atoms/blocks/image_block'
import GridBlock from '~/components/atoms/blocks/grid_block'
import ButtonCtaBlock from '~/components/atoms/blocks/button_cta_block'
import SeparatorBlock from '~/components/atoms/blocks/separator_block'
import ContactFormBlock from '~/components/atoms/blocks/contact_form_block'

interface BlockRendererProps {
  block: ResolvedBlock
  pageId: number
  locale: string
}

/**
 * Dispatches a single resolved block to the correct component.
 *
 * Container blocks (`section`, `grid`) receive their `children` rendered
 * recursively via this same component.
 */
export default function BlockRenderer({ block, pageId, locale }: BlockRendererProps) {
  switch (block.type) {
    case 'section':
      return (
        <SectionBlock block={block as ResolvedBlock<'section'>}>
          {block.children?.map((child) => (
            <BlockRenderer key={child.id} block={child} pageId={pageId} locale={locale} />
          ))}
        </SectionBlock>
      )

    case 'hero':
      return <HeroBlock block={block as ResolvedBlock<'hero'>} />

    case 'title':
      return <TitleBlock block={block as ResolvedBlock<'title'>} />

    case 'rich_text':
      return <RichTextBlock block={block as ResolvedBlock<'rich_text'>} />

    case 'image':
      return <ImageBlock block={block as ResolvedBlock<'image'>} />

    case 'grid':
      return (
        <GridBlock block={block as ResolvedBlock<'grid'>}>
          {block.children?.map((child) => (
            <BlockRenderer key={child.id} block={child} pageId={pageId} locale={locale} />
          ))}
        </GridBlock>
      )

    case 'button_cta':
      return <ButtonCtaBlock block={block as ResolvedBlock<'button_cta'>} />

    case 'separator':
      return <SeparatorBlock block={block as ResolvedBlock<'separator'>} />

    case 'contact_form':
      return (
        <ContactFormBlock
          block={block as ResolvedBlock<'contact_form'>}
          pageId={pageId}
          locale={locale}
        />
      )

    default:
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[BlockRenderer] Unknown block type: ${(block as any).type}`)
      }
      return null
  }
}
