import { SelectOption } from '~/components/atoms/select_option';
import { LFW } from '~/components/cms/editor/locked_file_wrapper';
import { LockProps } from '~/components/cms/types/builder';

type AspectSelectProps = {
	fieldKey: string;
	label: string;
	value: string;
	onChange: (v: string | boolean) => void;
} & LockProps;

/**
 * Shared aspect-ratio select for media blocks (video, carousel, iframe).
 * Mirrors `SpacingSelect` — meant to be wrapped in a `ResponsiveControl`.
 */
export function AspectSelect(props: AspectSelectProps) {
	const { fieldKey, label, value, onChange, ...lockProps } = props;
	return (
		<LFW {...lockProps} fieldKey={fieldKey} label={label} type="select" defaultValue={value} onChange={onChange}>
			{['16:9', '4:3', '1:1'].map((v) => (
				<SelectOption key={v} label={v} value={v} />
			))}
		</LFW>
	);
}
