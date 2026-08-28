import { SelectOption } from '@foundry/design-system/select';
import { TextSelect } from '~/components/cms/editor/blocks/commons/text_select';
import { LFW } from '~/components/cms/editor/locked_file_wrapper';
import { EditorProps } from '~/components/cms/types/builder';

export function TitleEditor(props: EditorProps) {
	const { block, onChange, lockProps } = props;

	const p = block.props as any;
	const u = (k: string, v: any) => onChange({ ...p, [k]: v });
	return (
		<div className="space-y-3">
			<LFW
				{...lockProps}
				fieldKey="text"
				type="richtext"
				label="Text"
				defaultValue={p.text ?? ''}
				onChange={(v) => u('text', v)}
			/>
			<LFW
				{...lockProps}
				fieldKey="level"
				type="select"
				label="Level"
				defaultValue={p.level}
				onChange={(v) => u('level', Number(v))}
			>
				{[1, 2, 3, 4].map((n) => (
					<SelectOption key={n} value={n} label={`H${n}`} />
				))}
			</LFW>
			<TextSelect {...lockProps} fieldKey="color" label="Color" value={p.color ?? ''} onChange={(v) => u('color', v)} />
			<TextSelect
				{...lockProps}
				fieldKey="highlightColor"
				label="highlightColor"
				value={p.highlightColor ?? ''}
				onChange={(v) => u('highlightColor', v)}
			/>
		</div>
	);
}
