import { BGSelect } from '~/components/cms/editor/blocks/commons/bg_select';
import { SpacingSelect } from '~/components/cms/editor/blocks/commons/spacing_select';
import { LFW } from '~/components/cms/editor/locked_file_wrapper';
import { EditorProps } from '~/components/cms/types/builder';

export function SeparatorEditor(props: EditorProps) {
	const { block, onChange, lockProps } = props;

	const p = block.props as any;
	const u = (k: string, v: any) => onChange({ ...p, [k]: v });
	return (
		<div className="space-y-3">
			<BGSelect {...lockProps} fieldKey="color" label="Color" value={p.color ?? ''} onChange={(v) => u('color', v)} />
			<SpacingSelect
				{...lockProps}
				fieldKey="spacing"
				label="Spacing"
				value={p.spacing}
				onChange={(v) => u('spacing', v)}
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
	);
}
