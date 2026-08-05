import { EditorProps } from '~/types/builder'
import { LFW } from '~/components/organisms/builder/editor/locked_file_wrapper'
import { ResponsiveControl } from '~/components/organisms/builder/editor/responsive_control'
import { AspectSelect } from '~/components/organisms/builder/editor/blocks/commons/aspect_select'

/**
 * Carousel is a container — its slides are child blocks edited via the block
 * tree. This editor only controls the carousel chrome (aspect, arrows, dots).
 */
export function CarouselEditor(props: EditorProps) {
  const { block, onChange, lockProps } = props

  const p = block.props as any
  const u = (k: string, v: any) => onChange({ ...p, [k]: v })

  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-subtle">
        Add child blocks to this carousel — each child becomes one slide.
      </p>
      <ResponsiveControl label="Aspect Ratio" value={p.aspect} onChange={(val) => u('aspect', val)}>
        {(currentVal, activeBp, updateFn) => (
          <AspectSelect
            {...lockProps}
            fieldKey={`aspect.${activeBp}`}
            label=""
            value={currentVal ?? '16:9'}
            onChange={updateFn}
          />
        )}
      </ResponsiveControl>
      <LFW
        {...lockProps}
        fieldKey="showArrows"
        type="checkbox"
        label="Show arrows"
        checked={p.showArrows ?? true}
        onChange={(v) => u('showArrows', v)}
      />
      <LFW
        {...lockProps}
        fieldKey="showDots"
        type="checkbox"
        label="Show dots"
        checked={p.showDots ?? true}
        onChange={(v) => u('showDots', v)}
      />
      <LFW
        {...lockProps}
        fieldKey="className"
        type="text"
        label="ClassName"
        defaultValue={p.className ?? ''}
        onChange={(v) => u('className', v)}
      />
    </div>
  )
}
