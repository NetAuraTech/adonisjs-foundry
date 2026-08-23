import { AspectSelect } from '~/components/cms/editor/blocks/commons/aspect_select';
import { LFW } from '~/components/cms/editor/locked_file_wrapper';
import { ResponsiveControl } from '~/components/cms/editor/responsive_control';
import { EditorProps } from '~/components/cms/types/builder';

export function IframeEditor(props: EditorProps) {
	const { block, onChange, lockProps } = props;

	const p = block.props as any;
	const u = (k: string, v: any) => onChange({ ...p, [k]: v });

	return (
		<div className="space-y-3">
			<LFW
				{...lockProps}
				fieldKey="url"
				type="text"
				label="Embed URL"
				placeholder="https://www.google.com/maps/embed?…"
				helpText="Only allowlisted hosts are rendered at runtime"
				defaultValue={p.url ?? ''}
				onChange={(v) => u('url', v)}
			/>
			<LFW
				{...lockProps}
				fieldKey="title"
				type="text"
				label="Title"
				placeholder="Map of our office"
				helpText="Accessible name for the embedded frame"
				defaultValue={p.title ?? ''}
				onChange={(v) => u('title', v)}
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
	);
}
