import { SelectOption } from '@foundry/design-system/select';
import { LFW } from '~/components/cms/editor/locked_file_wrapper';
import { EditorProps } from '~/components/cms/types/builder';

export function QuoteEditor(props: EditorProps) {
	const { block, onChange, lockProps } = props;

	const p = block.props as any;
	const u = (k: string, v: any) => onChange({ ...p, [k]: v });

	return (
		<div className="space-y-3">
			<LFW
				{...lockProps}
				fieldKey="text"
				type="textarea"
				label="Quote text"
				rows={4}
				defaultValue={p.text ?? ''}
				onChange={(v) => u('text', v)}
			/>
			<LFW
				{...lockProps}
				fieldKey="attribution"
				type="text"
				label="Attribution"
				placeholder="Author name"
				defaultValue={p.attribution ?? ''}
				onChange={(v) => u('attribution', v)}
			/>
			<LFW
				{...lockProps}
				fieldKey="variant"
				type="select"
				label="Variant"
				defaultValue={p.variant ?? 'default'}
				onChange={(v) => u('variant', v)}
			>
				{['default', 'bordered', 'highlight'].map((v) => (
					<SelectOption key={v} label={v} value={v} />
				))}
			</LFW>
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
