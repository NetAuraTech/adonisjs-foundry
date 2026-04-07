import LockedFieldWrapper from './LockedFieldWrapper'
import type { Block, BlockType } from '#types/page'
import type { LockState } from '~/hooks/use_builder_sync'
import { Field } from '~/components/molecules/field'
import { SelectOption } from '~/components/atoms/select_option'
import { ReactNode } from 'react'

// ─── Lock helpers ─────────────────────────────────────────────────────────────

interface LockProps {
  blockId: string
  getLock?: (blockId: string, fieldKey: string) => LockState | null
  acquireLock?: (blockId: string, fieldKey: string) => Promise<{ acquired: boolean; lock?: any }>
  releaseLock?: (blockId: string, fieldKey: string) => Promise<void>
  currentUserId?: number
}

/**
 * Module-level locked field wrapper component.
 *
 * IMPORTANT: This MUST be defined at module level, never inside another
 * component function. Defining a component inline (const X = () => ...)
 * inside a render function causes React to treat it as a new type on every
 * render, unmounting and remounting the DOM node — which kills input focus.
 */
function LFW(
  props: LockProps & {
    fieldKey: string
    type: string
    label: string
    placeholder?: string
    defaultValue?: any
    checked?: any
    rows?: number
    helpText?: string
    onChange: (value: string) => void
    onBlur?: () => void
    children?: ReactNode
  }
) {
  const {
    blockId,
    fieldKey,
    type,
    label,
    placeholder,
    getLock,
    acquireLock,
    releaseLock,
    currentUserId = 0,
    defaultValue,
    checked,
    rows,
    helpText,
    onChange,
    onBlur,
    children,
  } = props
  const activeLock = getLock?.(blockId, fieldKey) ?? null
  const isOwner = activeLock?.userId === currentUserId

  const syncKey = !activeLock ? `${blockId}-${fieldKey}` : `${blockId}-${fieldKey}-${defaultValue}`

  return (
    <LockedFieldWrapper
      blockId={blockId}
      fieldKey={fieldKey}
      lock={activeLock}
      isOwner={isOwner}
      onFocus={() => acquireLock?.(blockId, fieldKey)}
      onBlur={() => releaseLock?.(blockId, fieldKey)}
    >
      <Field
        key={syncKey}
        type={type}
        label={label}
        name={fieldKey}
        placeholder={placeholder}
        defaultValue={defaultValue}
        checked={checked}
        rows={rows}
        helpText={helpText}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      >
        {children}
      </Field>
    </LockedFieldWrapper>
  )
}

interface BlockPropsEditorProps {
  block: Block
  onChange: (props: Block['props']) => void
  getLock?: (blockId: string, fieldKey: string) => LockState | null
  acquireLock?: (blockId: string, fieldKey: string) => Promise<{ acquired: boolean; lock?: any }>
  releaseLock?: (blockId: string, fieldKey: string) => Promise<void>
  /** The current user's ID — used to detect own locks and not block own fields */
  currentUserId?: number
}

export default function BlockPropsEditor(props: BlockPropsEditorProps) {
  const { block, onChange, getLock, acquireLock, releaseLock, currentUserId = 0 } = props
  // Build a lockProps object passed to each sub-editor.
  // Sub-editors spread it into every <LFW> so the blockId is always correct.
  const lockProps: LockProps = {
    blockId: block.id,
    getLock,
    acquireLock,
    releaseLock,
    currentUserId,
  }

  switch (block.type as BlockType) {
    case 'hero':
      return <HeroEditor block={block} onChange={onChange} lockProps={lockProps} />
    case 'title':
      return <TitleEditor block={block} onChange={onChange} lockProps={lockProps} />
    case 'rich_text':
      return <RichTextEditor block={block} onChange={onChange} lockProps={lockProps} />
    case 'image':
      return <ImageEditor block={block} onChange={onChange} lockProps={lockProps} />
    case 'section':
      return <SectionEditor block={block} onChange={onChange} lockProps={lockProps} />
    case 'grid':
      return <GridEditor block={block} onChange={onChange} lockProps={lockProps} />
    case 'button_cta':
      return <ButtonCtaEditor block={block} onChange={onChange} lockProps={lockProps} />
    case 'separator':
      return <SeparatorEditor block={block} onChange={onChange} lockProps={lockProps} />
    case 'contact_form':
      return <ContactFormEditor block={block} onChange={onChange} lockProps={lockProps} />
    default:
      return <p className="text-xs text-ink-subtle">No editable props.</p>
  }
}

interface EP {
  block: Block
  onChange: (p: Block['props']) => void
  lockProps: LockProps
}

function Div({ label }: { label: string }) {
  return (
    <div className="pt-2 pb-1">
      <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wider">{label}</p>
    </div>
  )
}

function BGSelect({
  fieldKey,
  label,
  value,
  onChange,
  ...lockProps
}: LockProps & {
  fieldKey: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <LFW
      {...lockProps}
      fieldKey={fieldKey}
      label={label}
      type="select"
      defaultValue={value}
      onChange={onChange}
    >
      {[
        'canvas',
        'surface',
        'sunken',
        'primary-mid',
        'primary-deep',
        'primary-soft',
        'transparent',
      ].map((v) => (
        <SelectOption key={v} label={v} value={v} />
      ))}
    </LFW>
  )
}

function SpacingSelect({
  fieldKey,
  label,
  value,
  onChange,
  ...lockProps
}: LockProps & {
  fieldKey: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <LFW
      {...lockProps}
      fieldKey={fieldKey}
      label={label}
      type="select"
      defaultValue={value}
      onChange={onChange}
    >
      {['none', 'sm', 'md', 'lg', 'xl'].map((v) => (
        <SelectOption key={v} label={v} value={v} />
      ))}
    </LFW>
  )
}

function HeroEditor({ block, onChange, lockProps }: EP) {
  const p = block.props as any
  const u = (k: string, v: any) => onChange({ ...p, [k]: v })
  const uc = (k: string, v: any) =>
    onChange({ ...p, cta: { ...(p.cta ?? { label: '', href: '', variant: 'primary' }), [k]: v } })

  const rl = async (k: string) => {
    if (lockProps.releaseLock) {
      await lockProps.releaseLock(block.id, k)
    }
  }

  return (
    <div className="space-y-3">
      <LFW
        {...lockProps}
        fieldKey="title"
        label="Title to translate"
        type="text"
        defaultValue={p.title ?? ''}
        onChange={(value) => u('title', value)}
        onBlur={() => rl('title')}
      />
      <LFW
        {...lockProps}
        fieldKey="subtitle"
        label="Subtitle"
        type="text"
        defaultValue={p.subtitle ?? ''}
        onChange={(value) => u('subtitle', value || null)}
        placeholder="Optional"
      />
      <LFW
        {...lockProps}
        fieldKey="align"
        type="select"
        label="Align"
        defaultValue={p.align}
        onChange={(value) => u('align', value)}
      >
        <SelectOption value="left" label="Left" />
        <SelectOption value="center" label="Center" />
        <SelectOption value="right" label="Right" />
      </LFW>
      <LFW
        {...lockProps}
        fieldKey="minHeight"
        type="select"
        label="Min height"
        defaultValue={p.minHeight}
        onChange={(value) => u('minHeight', value)}
      >
        <SelectOption value="auto" label="Auto" />
        <SelectOption value="sm" label="Small" />
        <SelectOption value="md" label="Medium" />
        <SelectOption value="lg" label="Large" />
        <SelectOption value="screen" label="Full screen" />
      </LFW>
      <BGSelect
        {...lockProps}
        fieldKey="background"
        label="Background"
        value={p.background}
        onChange={(v) => u('background', v)}
      />
      <Div label="CTA button" />
      <LFW
        {...lockProps}
        fieldKey="cta.label"
        type="text"
        label="Label"
        defaultValue={p.cta?.label ?? ''}
        onChange={(value) => uc('label', value)}
        placeholder="Get started"
      />
      <LFW
        {...lockProps}
        fieldKey="cta.href"
        type="text"
        label="Link"
        defaultValue={p.cta?.href ?? ''}
        onChange={(value) => uc('href', value)}
        placeholder="/about or https://…"
      />
      <LFW
        {...lockProps}
        fieldKey="cta.variant"
        type="select"
        label="Variant"
        defaultValue={p.cta?.variant ?? 'primary'}
        onChange={(value) => uc('variant', value)}
      >
        <SelectOption value="primary" label="Primary" />
        <SelectOption value="secondary" label="Secondary" />
        <SelectOption value="ghost" label="Ghost" />
      </LFW>
    </div>
  )
}

function TitleEditor({ block, onChange, lockProps }: EP) {
  const p = block.props as any
  const u = (k: string, v: any) => onChange({ ...p, [k]: v })
  return (
    <div className="space-y-3">
      <LFW
        {...lockProps}
        fieldKey="text"
        type="text"
        label="Text"
        defaultValue={p.text ?? ''}
        onChange={(value) => u('text', value)}
      />
      <LFW
        {...lockProps}
        fieldKey="level"
        type="select"
        label="Level"
        defaultValue={p.level}
        onChange={(value) => u('level', Number(value))}
      >
        {[1, 2, 3, 4].map((n) => (
          <SelectOption key={n} value={n} label={`H${n}`}></SelectOption>
        ))}
      </LFW>
      <LFW
        {...lockProps}
        fieldKey="align"
        type="select"
        label="Align"
        defaultValue={p.align}
        onChange={(value) => u('align', value)}
      >
        <SelectOption value="left" label="Left" />
        <SelectOption value="center" label="Center" />
        <SelectOption value="right" label="Right" />
      </LFW>
      <LFW
        {...lockProps}
        fieldKey="color"
        type="select"
        label="Colour"
        defaultValue={p.color ?? 'default'}
        onChange={(value) => u('color', value)}
      >
        <SelectOption value="default" label="Default" />
        <SelectOption value="muted" label="Muted" />
        <SelectOption value="subtle" label="Subtle" />
        <SelectOption value="primary" label="Primary" />
        <SelectOption value="accent" label="Accent" />
      </LFW>
    </div>
  )
}

function RichTextEditor({ block, onChange, lockProps }: EP) {
  const p = block.props as any
  const u = (k: string, v: any) => onChange({ ...p, [k]: v })
  return (
    <div className="space-y-3">
      <LFW
        {...lockProps}
        fieldKey="content"
        type="textarea"
        label="Content (HTML)"
        defaultValue={p.content ?? ''}
        onChange={(value) => u('content', value)}
        rows={8}
        placeholder="<p>Your content here</p>"
        helpText="HTML is sanitised automatically on save."
      />
      <LFW
        {...lockProps}
        fieldKey="align"
        type="select"
        label="Align"
        defaultValue={p.align ?? 'left'}
        onChange={(value) => u('align', value)}
      >
        <SelectOption value="left" label="Left" />
        <SelectOption value="center" label="Center" />
        <SelectOption value="right" label="Right" />
        <SelectOption value="justify" label="Justify" />
      </LFW>
    </div>
  )
}

function ImageEditor({ block, onChange, lockProps }: EP) {
  const p = block.props as any
  const u = (k: string, v: any) => onChange({ ...p, [k]: v })
  return (
    <div className="space-y-3">
      <LFW
        {...lockProps}
        fieldKey="file.fileId"
        type="image"
        label="File ID"
        defaultValue={p.file?.fileId ?? ''}
        onChange={(value) =>
          u(
            'file',
            value
              ? {
                  fileId: Number(value),
                  altKey: p.file?.altKey ?? null,
                  altOverride: p.file?.altOverride ?? null,
                }
              : null
          )
        }
      />
      <LFW
        {...lockProps}
        fieldKey="file.altKey"
        type="text"
        label="Alt key"
        defaultValue={p.file?.altKey ?? ''}
        onChange={(value) => u('file', { ...p.file, altKey: value || null })}
        placeholder="hero, thumbnail…"
      />
      <LFW
        {...lockProps}
        fieldKey="file.altOverride"
        type="text"
        label="Alt override"
        defaultValue={p.file?.altOverride ?? ''}
        onChange={(value) => u('file', { ...p.file, altOverride: value || null })}
      />
      <LFW
        {...lockProps}
        fieldKey="caption"
        type="text"
        label="Caption"
        defaultValue={p.caption ?? ''}
        onChange={(value) => u('caption', value || null)}
      />
      <LFW
        {...lockProps}
        fieldKey="fit"
        type="select"
        label="Fit"
        defaultValue={p.fit}
        onChange={(value) => u('fit', value)}
      >
        <SelectOption value="cover" label="Cover" />
        <SelectOption value="contain" label="Contain" />
        <SelectOption value="fill" label="Fill" />
      </LFW>
      <div className="flex gap-3">
        <LFW
          {...lockProps}
          fieldKey="rounded"
          type="checkbox"
          label="Rounded"
          checked={p.rounded}
          onChange={(value) => u('rounded', value)}
        />
        <LFW
          {...lockProps}
          fieldKey="fullWidth"
          type="checkbox"
          label="Full width"
          checked={p.fullWidth}
          onChange={(value) => u('fullWidth', value)}
        />
      </div>
    </div>
  )
}

function SectionEditor({ block, onChange, lockProps }: EP) {
  const p = block.props as any
  const u = (k: string, v: any) => onChange({ ...p, [k]: v })
  return (
    <div className="space-y-3">
      <BGSelect
        {...lockProps}
        fieldKey="background"
        label="Background color to translate"
        value={p.background}
        onChange={(v) => u('background', v)}
      />
      <LFW
        {...lockProps}
        fieldKey="maxWidth"
        type="select"
        label="Max width"
        defaultValue={p.maxWidth}
        onChange={(value) => u('maxWidth', value)}
      >
        {['sm', 'md', 'lg', 'xl', '2xl', 'full'].map((v) => (
          <SelectOption key={v} value={v} label={v.toUpperCase()} />
        ))}
      </LFW>
      <SpacingSelect
        {...lockProps}
        fieldKey="paddingY"
        label="Padding Y"
        value={p.paddingY?.default ?? 'md'}
        onChange={(v) => u('paddingY', { default: v })}
      />
      <SpacingSelect
        {...lockProps}
        fieldKey="paddingX"
        label="Padding X"
        value={p.paddingX?.default ?? 'md'}
        onChange={(v) => u('paddingX', { default: v })}
      />
      <LFW
        {...lockProps}
        fieldKey="rounded"
        type="checkbox"
        label="Rounded"
        checked={p.rounded}
        onChange={(value) => u('rounded', value)}
      />
    </div>
  )
}

function GridEditor({ block, onChange, lockProps }: EP) {
  const p = block.props as any
  const u = (k: string, v: any) => onChange({ ...p, [k]: v })
  return (
    <div className="space-y-3">
      <LFW
        {...lockProps}
        fieldKey="cols.default"
        type="select"
        label="Cols (default)"
        defaultValue={p.cols?.default ?? 1}
        onChange={(value) => u('cols', { ...p.cols, default: Number(value) })}
      >
        {[1, 2, 3, 4].map((n) => (
          <SelectOption key={n} value={n} label={n.toString()} />
        ))}
      </LFW>
      <LFW
        {...lockProps}
        fieldKey="cols.md"
        type="select"
        label="Cols (md+)"
        defaultValue={p.cols?.md ?? ''}
        onChange={(value) => u('cols', { ...p.cols, md: value ? Number(value) : undefined })}
      >
        <SelectOption value="" label="Same" />
        {[1, 2, 3, 4].map((n) => (
          <SelectOption key={n} value={n} label={n.toString()} />
        ))}
      </LFW>
      <LFW
        {...lockProps}
        fieldKey="cols.lg"
        type="select"
        label="Cols (lg+)"
        defaultValue={p.cols?.lg ?? ''}
        onChange={(value) => u('cols', { ...p.cols, lg: value ? Number(value) : undefined })}
      >
        <SelectOption value="" label="Same" />
        {[1, 2, 3, 4].map((n) => (
          <SelectOption key={n} value={n} label={n.toString()} />
        ))}
      </LFW>
      <SpacingSelect
        {...lockProps}
        fieldKey="gap"
        label="Gap"
        value={p.gap?.default ?? 'md'}
        onChange={(v) => u('gap', { default: v })}
      />
    </div>
  )
}

function ButtonCtaEditor({ block, onChange, lockProps }: EP) {
  const p = block.props as any
  const u = (k: string, v: any) => onChange({ ...p, [k]: v })
  return (
    <div className="space-y-3">
      <LFW
        {...lockProps}
        fieldKey="label"
        type="text"
        label="Label"
        defaultValue={p.label ?? ''}
        onChange={(value) => u('label', value)}
      />
      <LFW
        {...lockProps}
        fieldKey="href"
        type="text"
        label="Link"
        defaultValue={p.href ?? ''}
        onChange={(value) => u('href', value)}
        placeholder="/page or https://…"
      />
      <LFW
        {...lockProps}
        fieldKey="variant"
        type="select"
        label="Variant"
        defaultValue={p.variant}
        onChange={(value) => u('variant', value)}
      >
        <SelectOption value="primary" label="Primary" />
        <SelectOption value="secondary" label="Secondary" />
        <SelectOption value="ghost" label="Ghost" />
      </LFW>
      <LFW
        {...lockProps}
        fieldKey="size"
        type="select"
        label="Size"
        defaultValue={p.size}
        onChange={(value) => u('size', value)}
      >
        {['sm', 'md', 'lg', 'xl'].map((v) => (
          <SelectOption key={v} value={v} label={v.toUpperCase()} />
        ))}
      </LFW>
      <LFW
        {...lockProps}
        fieldKey="align"
        type="select"
        label="Align"
        defaultValue={p.align}
        onChange={(value) => u('align', value)}
      >
        <SelectOption value="left" label="Left" />
        <SelectOption value="center" label="Center" />
        <SelectOption value="right" label="Right" />
      </LFW>
      <LFW
        {...lockProps}
        fieldKey="openInNewTab"
        label="New tab"
        type="checkbox"
        checked={p.openInNewTab}
        onChange={(value) => u('openInNewTab', value)}
      />
    </div>
  )
}

function SeparatorEditor({ block, onChange, lockProps }: EP) {
  const p = block.props as any
  const u = (k: string, v: any) => onChange({ ...p, [k]: v })
  return (
    <div className="space-y-3">
      <LFW
        {...lockProps}
        fieldKey="style"
        type="select"
        label="Style"
        defaultValue={p.style}
        onChange={(value) => u('style', value)}
      >
        <SelectOption value="solid" label="Solid" />
        <SelectOption value="dashed" label="Dashed" />
        <SelectOption value="dotted" label="Dotted" />
        <SelectOption value="none" label="None (spacer)" />
      </LFW>
      <SpacingSelect
        {...lockProps}
        fieldKey="spacing"
        label="Spacing"
        value={p.spacing}
        onChange={(v) => u('spacing', v)}
      />
      <LFW
        {...lockProps}
        fieldKey="color"
        label="Colour"
        type="select"
        defaultValue={p.color ?? 'default'}
        onChange={(value) => u('color', value)}
      >
        <SelectOption value="default" label="Default" />
        <SelectOption value="strong" label="Strong" />
        <SelectOption value="primary" label="Primary" />
        <SelectOption value="transparent" label="Transparent" />
      </LFW>
    </div>
  )
}

function ContactFormEditor({ block, onChange, lockProps }: EP) {
  const p = block.props as any
  const u = (k: string, v: any) => onChange({ ...p, [k]: v })
  return (
    <div className="space-y-3">
      <LFW
        {...lockProps}
        fieldKey="title"
        type="text"
        label="Title"
        defaultValue={p.title ?? ''}
        onChange={(value) => u('title', value || null)}
        placeholder="Optional"
      />
      <LFW
        {...lockProps}
        fieldKey="recipientEmail"
        type="text"
        label="To (email)"
        defaultValue={p.recipientEmail ?? ''}
        onChange={(value) => u('recipientEmail', value)}
        placeholder="contact@example.com"
      />
      <LFW
        {...lockProps}
        fieldKey="submitLabel"
        label="Submit label"
        type="text"
        defaultValue={p.submitLabel ?? 'Send'}
        onChange={(value) => u('submitLabel', value)}
      />
      <LFW
        {...lockProps}
        fieldKey="successMessage"
        type="text"
        label="Success msg"
        defaultValue={p.successMessage ?? ''}
        onChange={(value) => u('successMessage', value)}
      />
    </div>
  )
}
