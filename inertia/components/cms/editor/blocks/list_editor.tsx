import { EditorProps } from '~/components/cms/types/builder'
import { LFW } from '~/components/cms/editor/locked_file_wrapper'

/**
 * List items are edited as a plain textarea — one item per line. Each line may
 * contain inline HTML (bold, links…), sanitized at save and render time.
 */
export function ListEditor(props: EditorProps) {
  const { block, onChange, lockProps } = props

  const p = block.props as any
  const u = (k: string, v: any) => onChange({ ...p, [k]: v })

  const itemsText = Array.isArray(p.items) ? p.items.join('\n') : ''

  return (
    <div className="space-y-3">
      <LFW
        {...lockProps}
        fieldKey="ordered"
        type="checkbox"
        label="Numbered list"
        checked={p.ordered ?? false}
        onChange={(v) => u('ordered', v)}
      />
      <LFW
        {...lockProps}
        fieldKey="items"
        type="textarea"
        label="Items (one per line)"
        rows={6}
        defaultValue={itemsText}
        onChange={(v) =>
          u(
            'items',
            String(v)
              .split('\n')
              .map((line) => line.trim())
              .filter((line) => line.length > 0)
          )
        }
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
