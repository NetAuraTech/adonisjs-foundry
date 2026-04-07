import type { FileRef } from '#types/file'

export type PageStatus = 'draft' | 'published' | 'archived'

export type BlockType =
  | 'section'
  | 'hero'
  | 'title'
  | 'rich_text'
  | 'image'
  | 'grid'
  | 'button_cta'
  | 'separator'
  | 'contact_form'

/**
 * A responsive value that can vary per Tailwind breakpoint.
 * Only `default` is required — omitted breakpoints inherit the previous value.
 *
 * @example
 * { default: 1, md: 2, lg: 4 }
 */
export interface ResponsiveValue<T> {
  default: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
}

export interface SectionProps {
  background: string
  paddingY: ResponsiveValue<'none' | 'sm' | 'md' | 'lg' | 'xl'>
  paddingX: ResponsiveValue<'none' | 'sm' | 'md' | 'lg' | 'xl'>
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  rounded: boolean
}

export interface HeroProps {
  title: string
  subtitle: string | null
  cta: { label: string; href: string; variant: string } | null
  image: FileRef | null
  align: 'left' | 'center' | 'right'
  background: string
  minHeight: 'sm' | 'md' | 'lg' | 'screen' | 'auto'
}

export interface TitleProps {
  text: string
  level: 1 | 2 | 3 | 4
  align: 'left' | 'center' | 'right'
  color: string | null
}

export interface RichTextProps {
  content: string
  align: 'left' | 'center' | 'right'
}

export interface ImageProps {
  file: FileRef | null
  caption: string | null
  fit: 'cover' | 'contain' | 'fill'
  rounded: boolean
  fullWidth: boolean
}

export interface GridProps {
  cols: ResponsiveValue<1 | 2 | 3 | 4>
  gap: ResponsiveValue<'none' | 'sm' | 'md' | 'lg'>
}

export interface ButtonCtaProps {
  label: string
  href: string
  variant: 'primary' | 'accent' | 'outline' | 'danger' | 'success'
  size: 'sm' | 'md' | 'lg'
  align: 'left' | 'center' | 'right'
  icon: string | null
  openInNewTab: boolean
}

export interface SeparatorProps {
  style: 'solid' | 'dashed' | 'dotted' | 'none'
  spacing: 'sm' | 'md' | 'lg' | 'xl'
  color: string | null
}

export interface ContactFormField {
  name: string
  label: string
  type: 'text' | 'email' | 'textarea' | 'tel' | 'select'
  required: boolean
  options?: string[]
}

export interface ContactFormProps {
  title: string | null
  fields: ContactFormField[]
  recipientEmail: string
  submitLabel: string
  successMessage: string
}

/**
 * Maps each BlockType to its corresponding props interface.
 * Used to type-narrow block props in the renderer and the builder.
 */
export interface BlockPropsMap {
  section: SectionProps
  hero: HeroProps
  title: TitleProps
  rich_text: RichTextProps
  image: ImageProps
  grid: GridProps
  button_cta: ButtonCtaProps
  separator: SeparatorProps
  contact_form: ContactFormProps
}

/**
 * A single block node in the page content tree.
 * Children are only present on container blocks (`section`, `grid`).
 */
export interface Block<T extends BlockType = BlockType> {
  id: string
  type: T
  props: BlockPropsMap[T]
  children?: Block[]
}

/**
 * Root structure of the JSON stored in `page_translations.content`.
 */
export interface PageContent {
  blocks: Block[]
}

export interface ContactFormSubmission {
  pageId: number
  pageTitle: string
  locale: string
  recipientEmail: string
  fields: Record<string, string>
}

// ─── Resolved types ───────────────────────────────────────────────────────────
// Append these to the bottom of app/types/page.ts
// They mirror Block/Props types but with FileRef replaced by ResolvedFile,
// built server-side by PageResolverService before being passed to Inertia.

import type { ResolvedFile } from '#types/file'

export interface ResolvedSectionProps {
  background: string
  paddingY: ResponsiveValue<'none' | 'sm' | 'md' | 'lg' | 'xl'>
  paddingX: ResponsiveValue<'none' | 'sm' | 'md' | 'lg' | 'xl'>
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  rounded: boolean
}

export interface ResolvedHeroProps {
  title: string
  subtitle: string | null
  cta: { label: string; href: string; variant: string } | null
  image: ResolvedFile | null
  align: 'left' | 'center' | 'right'
  background: string
  minHeight: 'sm' | 'md' | 'lg' | 'screen' | 'auto'
}

export interface ResolvedImageProps {
  file: ResolvedFile | null
  caption: string | null
  fit: 'cover' | 'contain' | 'fill'
  rounded: boolean
  fullWidth: boolean
}

/**
 * Maps each BlockType to its resolved props.
 * Types without FileRef are identical to their source counterparts.
 */
export interface ResolvedBlockPropsMap {
  section: ResolvedSectionProps
  hero: ResolvedHeroProps
  title: TitleProps
  rich_text: RichTextProps
  image: ResolvedImageProps
  grid: GridProps
  button_cta: ButtonCtaProps
  separator: SeparatorProps
  contact_form: ContactFormProps
}

/**
 * A single resolved block node.
 * All FileRef values have been replaced with ResolvedFile by `PageResolverService`.
 */
export interface ResolvedBlock<T extends BlockType = BlockType> {
  id: string
  type: T
  props: ResolvedBlockPropsMap[T]
  children?: ResolvedBlock[]
}

/**
 * Root structure passed to the Inertia page after server-side resolution.
 * Safe to render directly in React — no async lookups needed in components.
 */
export interface ResolvedPageContent {
  blocks: ResolvedBlock[]
}
