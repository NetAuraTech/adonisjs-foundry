import { BGSelect } from '~/components/cms/editor/blocks/commons/bg_select';
import { SpacingSelect } from '~/components/cms/editor/blocks/commons/spacing_select';
import { LFW } from '~/components/cms/editor/locked_file_wrapper';
import { ResponsiveControl } from '~/components/cms/editor/responsive_control';
import { EditorProps } from '~/components/cms/types/builder';

export function SectionEditor(props: EditorProps) {
	const { block, onChange, lockProps } = props;

	const p = block.props as any;
	const u = (k: string, v: any) => onChange({ ...p, [k]: v });

	return (
		<div className="space-y-4">
			<BGSelect
				{...lockProps}
				fieldKey="background"
				label="Background"
				value={p.background ?? ''}
				onChange={(v) => u('background', v)}
			/>
			<ResponsiveControl label="Padding Vertical" value={p.paddingY} onChange={(val) => u('paddingY', val)}>
				{(currentVal, activeBp, updateFn) => (
					<SpacingSelect
						{...lockProps}
						fieldKey={`paddingY.${activeBp}`}
						label=""
						value={currentVal ?? 'none'}
						onChange={updateFn}
					/>
				)}
			</ResponsiveControl>
			<ResponsiveControl label="Padding Horizontal" value={p.paddingX} onChange={(val) => u('paddingX', val)}>
				{(currentVal, activeBp, updateFn) => (
					<SpacingSelect
						{...lockProps}
						fieldKey={`paddingX.${activeBp}`}
						label=""
						value={currentVal ?? 'none'}
						onChange={updateFn}
					/>
				)}
			</ResponsiveControl>
			<LFW
				{...lockProps}
				fieldKey="className"
				type="text"
				label="ClassName"
				defaultValue={p.className}
				onChange={(value) => u('className', value)}
			/>
			<LFW
				{...lockProps}
				fieldKey="id"
				type="text"
				label="Anchor ID"
				defaultValue={p.id}
				onChange={(value) => u('id', value)}
			/>
		</div>
	);
}
