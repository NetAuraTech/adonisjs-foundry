import type { BlockType, Block } from '#types/page'

export interface BlockDescriptor {
  type: BlockType
  label: string
  icon: string
  description: string
  isContainer: boolean
  defaultProps: Block['props']
}

/**
 * Catalogue of all available block types with their default props.
 * Used by the block picker panel in the page builder.
 */
export const BLOCK_CATALOG: BlockDescriptor[] = [
  {
    type: 'section',
    label: 'Section',
    icon: 'layout',
    description: 'Full-width container with background and spacing',
    isContainer: true,
    defaultProps: {
      background: 'canvas',
      paddingY: { default: 'md' },
      paddingX: { default: 'md' },
      maxWidth: 'xl',
      rounded: false,
    },
  },
  {
    type: 'hero',
    label: 'Hero',
    icon: 'star',
    description: 'Large banner with title, subtitle and CTA',
    isContainer: false,
    defaultProps: {
      title: 'Your headline here',
      subtitle: null,
      cta: null,
      image: null,
      align: 'center',
      background: 'canvas',
      minHeight: 'md',
    },
  },
  {
    type: 'title',
    label: 'Heading',
    icon: 'type',
    description: 'H1–H4 heading',
    isContainer: false,
    defaultProps: { text: 'New heading', level: 2, align: 'left', color: 'default' },
  },
  {
    type: 'rich_text',
    label: 'Rich text',
    icon: 'align-left',
    description: 'Formatted text with bold, links, lists…',
    isContainer: false,
    defaultProps: { content: '<p>Start writing…</p>', align: 'left' },
  },
  {
    type: 'image',
    label: 'Image',
    icon: 'image',
    description: 'Single image from the media library',
    isContainer: false,
    defaultProps: { file: null, caption: null, fit: 'cover', rounded: false, fullWidth: false },
  },
  {
    type: 'grid',
    label: 'Grid',
    icon: 'grid',
    description: 'Multi-column layout container',
    isContainer: true,
    defaultProps: {
      cols: { default: 1, md: 2 },
      gap: { default: 'md' },
    },
  },
  {
    type: 'button_cta',
    label: 'Button',
    icon: 'mouse-pointer',
    description: 'Call-to-action button with link',
    isContainer: false,
    defaultProps: {
      label: 'Click here',
      href: '#',
      variant: 'primary',
      size: 'md',
      align: 'left',
      openInNewTab: false,
      icon: '',
    },
  },
  {
    type: 'separator',
    label: 'Separator',
    icon: 'minus',
    description: 'Horizontal dividing line',
    isContainer: false,
    defaultProps: { style: 'solid', spacing: 'md', color: 'default' },
  },
  {
    type: 'contact_form',
    label: 'Contact form',
    icon: 'mail',
    description: 'Dynamic contact form with configurable fields',
    isContainer: false,
    defaultProps: {
      title: null,
      recipientEmail: '',
      submitLabel: 'Send',
      successMessage: 'Message sent!',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true },
      ],
    },
  },
]

/** Returns the descriptor for a given block type, or undefined */
export function getBlockDescriptor(type: BlockType): BlockDescriptor | undefined {
  return BLOCK_CATALOG.find((b) => b.type === type)
}

/** Generates a unique block ID */
export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/** Creates a new block with defaults for the given type */
export function createBlock(type: BlockType): Block {
  const descriptor = getBlockDescriptor(type)
  if (!descriptor) throw new Error(`Unknown block type: ${type}`)

  return {
    id: generateBlockId(),
    type,
    props: { ...descriptor.defaultProps } as Block['props'],
    children: descriptor.isContainer ? [] : undefined,
  }
}
