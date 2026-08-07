import { EditorProps } from '~/components/cms/types/builder'
import { LFW } from '~/components/cms/editor/locked_file_wrapper'
import { ResponsiveControl } from '~/components/cms/editor/responsive_control'
import { AspectSelect } from '~/components/cms/editor/blocks/commons/aspect_select'

export function VideoEditor(props: EditorProps) {
  const { block, onChange, lockProps } = props

  const p = block.props as any
  const u = (k: string, v: any) => onChange({ ...p, [k]: v })

  return (
    <div className="space-y-3">
      <LFW
        {...lockProps}
        fieldKey="url"
        type="text"
        label="Video URL"
        placeholder="https://youtube.com/watch?v=… or /uploads/video.mp4"
        helpText="Provider page URL or direct video file"
        defaultValue={p.url ?? ''}
        onChange={(v) => u('url', v)}
      />
      <LFW
        {...lockProps}
        fieldKey="poster.fileId"
        type="image"
        label="Poster image"
        defaultValue={p.poster?.fileId ?? ''}
        onChange={(v) => u('poster', v ? { ...p.poster, fileId: Number(v) } : null)}
      />
      <LFW
        {...lockProps}
        fieldKey="caption"
        type="textarea"
        label="Caption"
        defaultValue={p.caption ?? ''}
        onChange={(v) => u('caption', v)}
      />
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
        fieldKey="className"
        type="text"
        label="ClassName"
        defaultValue={p.className ?? ''}
        onChange={(v) => u('className', v)}
      />
    </div>
  )
}
