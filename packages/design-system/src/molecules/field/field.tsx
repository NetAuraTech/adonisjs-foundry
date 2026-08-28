import { cn, tv } from 'tailwind-variants';
import { Checkbox } from '../../atoms/checkbox/checkbox';
import { Input } from '../../atoms/input/input';
import { Label } from '../../atoms/label/label';
import { Paragraph } from '../../atoms/paragraph/paragraph';
import { Select } from '../../atoms/select/select';
import { Textarea } from '../../atoms/textarea/textarea';
import type { ChangeEvent, ReactNode } from 'react';

interface FieldProps {
	/** Visible label text associated with the input. */
	label: string;
	/** The `name` and `id` forwarded to the underlying input element. */
	name: string;
	/**
	 * HTML input type or a compound type that maps to a different component:
	 * - `'textarea'` → `<Textarea>`
	 * - `'select'` → `<Select>` (pass options as `children`)
	 * - `'checkbox'` / `'radio'` → `<Checkbox>` with inline label layout
	 * - `'image'` → the `renderImage` extension point (falls back to `<Input>`
	 *   when it is not provided)
	 * - Anything else → `<Input>`
	 */
	type: string;
	placeholder?: string;
	defaultValue?: string | number;
	/** Initial checked state forwarded to `<Checkbox>`. */
	checked?: boolean;
	options?: Array<{ value: string; label: string }>;
	cols?: number;
	rows?: number;
	disabled?: boolean;
	required?: boolean;
	/**
	 * Validation or server error message displayed below the input in danger
	 * color. When present, `helpText` spacing is collapsed to `'xs'` to avoid
	 * excessive vertical gap.
	 */
	errorMessage?: string;
	/**
	 * Secondary hint displayed below the input in muted color. Typically used
	 * for password-strength indicators or format hints. Accepts a class
	 * override via `helpClassName` (e.g. to switch color on validation state).
	 */
	helpText?: string;
	/** Tailwind class(es) applied to the help text `<Paragraph>` wrapper. */
	helpClassName?: string;
	onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
	onBlur?: (event?: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
	/**
	 * Sanitizes the value on blur — when the sanitized value differs from the
	 * raw one, the input is updated and `onChange` is re-emitted so controlled
	 * form state stays in sync.
	 *
	 * The design system owns no sanitization policy: the caller injects the
	 * function that applies one (e.g. the app's text/email/rich-text
	 * sanitizers), typically resolved for the field's `type`. Omit it for
	 * sensitive fields like passwords, where the value must stay untouched.
	 */
	sanitizeValue?: (value: string) => string;
	/**
	 * Render extension point for `type="image"`. Receives the same prop bag a
	 * native input control receives and returns the node rendered in place of
	 * the input — the app composes its own picker there (e.g. the design
	 * system's `ImagePicker` wired to its file manager). When omitted,
	 * `type="image"` falls back to the default `<Input>`.
	 */
	renderImage?: (inputProps: ImageFieldProps) => ReactNode;
	/** `<SelectOption>` elements passed through to a `'select'` type field. */
	children?: ReactNode;
}

/**
 * Props forwarded by `<Field type="image">` to the `renderImage` extension
 * point — the same prop bag a native input control receives.
 */
export type ImageFieldProps = Omit<
	FieldProps,
	'label' | 'errorMessage' | 'helpText' | 'helpClassName' | 'sanitizeValue' | 'renderImage'
>;

const fieldLayout = tv({
	variants: {
		layout: {
			inline: 'flex items-center gap-2',
			grid: 'grid gap-2',
		},
	},
	defaultVariants: {
		layout: 'grid',
	},
});

/**
 * Composite form field that combines a label, an input control, an optional
 * error message, and an optional help text into a single layout unit.
 *
 * The rendered input component is resolved from the `type` prop:
 * `'textarea'` → `<Textarea>`, `'select'` → `<Select>`,
 * `'checkbox'`/`'radio'` → `<Checkbox>` (with label placed after the
 * control), `'image'` → the `renderImage` extension point, everything else →
 * `<Input>`.
 *
 * **Sanitization** runs on blur, not on change, so the user's in-progress
 * input is never interrupted. The sanitization policy is injected through
 * `sanitizeValue` — the design system owns none.
 *
 * @example
 * // Text input with validation
 * <Field
 *   label="Email"
 *   name="email"
 *   type="email"
 *   placeholder="you@example.com"
 *   errorMessage={errors.email}
 *   required
 *   sanitizeValue={sanitizeEmail}
 * />
 *
 * // Select with children
 * <Field label="Role" name="role_id" type="select" required>
 *   <SelectOption value="admin" label="Administrator" />
 *   <SelectOption value="user" label="User" />
 * </Field>
 *
 * // Checkbox with inline label
 * <Field label="Remember me" name="remember_me" type="checkbox" />
 *
 * // Password with help text (no sanitization)
 * <Field
 *   label="New password"
 *   name="password"
 *   type="password"
 *   helpText="Minimum 8 characters."
 *   helpClassName={validation.getHelpClassName('password')}
 *   required
 * />
 *
 * // Image type through the render extension point
 * <Field
 *   label="Thumbnail"
 *   name="thumbnailId"
 *   type="image"
 *   renderImage={(inputProps) => <ImagePicker {...inputProps} loadFile={loadFileById} />}
 * />
 */
export function Field(props: FieldProps) {
	const {
		label,
		name,
		type,
		errorMessage,
		helpText,
		helpClassName,
		onChange,
		onBlur,
		sanitizeValue,
		renderImage,
		...inputProps
	} = props;

	const isInline = type === 'checkbox' || type === 'radio';

	/** Handle change — no sanitization during typing. */
	const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		onChange?.(event);
	};

	/** Handle blur — apply the injected sanitization when the user leaves the field. */
	const handleBlur = (event?: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | null) => {
		if (event && type !== 'checkbox' && type !== 'radio' && sanitizeValue) {
			const sanitizedValue = sanitizeValue(event.target.value);

			if (sanitizedValue !== event.target.value) {
				event.target.value = sanitizedValue;
				onChange?.(event);
			}
		}

		onBlur?.(event ?? undefined);
	};

	const getComponentFromType = (type: string) => {
		switch (type) {
			case 'textarea':
				return Textarea;
			case 'select':
				return Select;
			case 'checkbox':
				return Checkbox;
			default:
				return Input;
		}
	};

	const Component = getComponentFromType(type);

	return (
		<div className="grid">
			{type === 'image' && renderImage ? (
				renderImage({ ...inputProps, name, type, onChange: handleChange, onBlur: handleBlur })
			) : (
				<div className={cn(fieldLayout({ layout: isInline ? 'inline' : 'grid' }))}>
					{!isInline && <Label label={label} htmlFor={name} required={props.required} />}
					<Component {...inputProps} name={name} type={type} onChange={handleChange} onBlur={handleBlur} />
					{isInline && <Label label={label} htmlFor={name} required={props.required} />}
				</div>
			)}
			{errorMessage && (
				<Paragraph variant="error" spacing="sm">
					{errorMessage}
				</Paragraph>
			)}
			{helpText && (
				<Paragraph
					variant="muted"
					spacing={errorMessage ? 'xs' : 'sm'}
					className={helpClassName ? cn('text-balance leading-7', helpClassName) : undefined}
				>
					{helpText}
				</Paragraph>
			)}
		</div>
	);
}
