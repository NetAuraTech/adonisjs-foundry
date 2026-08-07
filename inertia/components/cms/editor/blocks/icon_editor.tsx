import { EditorProps } from '~/components/cms/types/builder'
import { LFW } from '~/components/cms/editor/locked_file_wrapper'
import { TextSelect } from '~/components/cms/editor/blocks/commons/text_select'
import { BGSelect } from '~/components/cms/editor/blocks/commons/bg_select'

export function IconEditor(props: EditorProps) {
  const { block, onChange, lockProps } = props

  const p = block.props as any
  const u = (k: string, v: any) => onChange({ ...p, [k]: v })
  return (
    <div className="space-y-3">
      <LFW
        {...lockProps}
        fieldKey="name"
        type="text"
        label="Name"
        defaultValue={p.name ?? ''}
        onChange={(v) => u('name', v)}
      />
      <LFW
        {...lockProps}
        fieldKey="size"
        type="number"
        label="Size"
        defaultValue={p.size ?? 16}
        onChange={(v) => u('size', v)}
      />
      <TextSelect
        {...lockProps}
        fieldKey="color"
        label="Color"
        value={p.color ?? ''}
        onChange={(v) => u('color', v)}
      />
      <BGSelect
        {...lockProps}
        fieldKey="background"
        label="Background"
        value={p.background ?? ''}
        onChange={(v) => u('background', v)}
      />
      <LFW
        {...lockProps}
        fieldKey="className"
        type="text"
        label="ClassName"
        defaultValue={p.className}
        onChange={(value) => u('className', value)}
      />
    </div>
  )
}
