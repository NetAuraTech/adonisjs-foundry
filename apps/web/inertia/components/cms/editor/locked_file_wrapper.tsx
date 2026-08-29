import { Field, type ImageFieldProps } from '@foundry/design-system/field';
import { ImagePicker } from '@foundry/design-system/image-picker';
import { ReactNode } from 'react';
import LockedFieldWrapper from '~/components/cms/builder/LockedFieldWrapper';
import { LockProps } from '~/components/cms/types/builder';
import { FileManager } from '~/components/organisms/file_manager';
import { getSanitizer } from '~/helpers/sanitization';
import { loadFileById } from '~/utils/file';

type LFWProps = {
	fieldKey: string;
	type: string;
	label: string;
	placeholder?: string;
	defaultValue?: any;
	checked?: any;
	rows?: number;
	helpText?: string;
	onChange: (value: string | boolean) => void;
	onBlur?: () => void;
	children?: ReactNode;
} & LockProps;

export function LFW(props: LFWProps) {
	const {
		blockId,
		fieldKey,
		type,
		label,
		placeholder,
		getLock,
		acquireLock,
		releaseLock,
		currentUserId = 0,
		defaultValue,
		checked,
		rows,
		helpText,
		onChange,
		onBlur,
		children,
	} = props;
	const activeLock = getLock?.(blockId, fieldKey) ?? null;
	const isOwner = activeLock?.userId === currentUserId;

	const syncKey = !activeLock ? `${blockId}-${fieldKey}` : `${blockId}-${fieldKey}-${defaultValue}`;

	const renderImage = (inputProps: ImageFieldProps) => (
		<ImagePicker
			{...inputProps}
			loadFile={loadFileById}
			renderFileManager={(onChoose, onClose) => (
				<FileManager mime_type="image" handleClick={onChoose} handleClose={onClose} />
			)}
		/>
	);

	return (
		<LockedFieldWrapper
			blockId={blockId}
			fieldKey={fieldKey}
			lock={activeLock}
			isOwner={isOwner}
			onFocus={() => acquireLock?.(blockId, fieldKey)}
			onBlur={() => releaseLock?.(blockId, fieldKey)}
		>
			<Field
				key={syncKey}
				type={type}
				label={label}
				name={fieldKey}
				placeholder={placeholder}
				defaultValue={defaultValue}
				checked={checked}
				rows={rows}
				helpText={helpText}
				sanitizeValue={(value) => getSanitizer(type, true)(value)}
				renderImage={type === 'image' ? renderImage : undefined}
				onChange={(e) => onChange(type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value)}
				onBlur={onBlur}
			>
				{children}
			</Field>
		</LockedFieldWrapper>
	);
}
