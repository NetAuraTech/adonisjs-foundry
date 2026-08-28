import { SelectOption } from '../../atoms/select/select';
import { ImagePicker } from '../image_picker/image_picker';
import { Field } from './field';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
	title: 'Molecules/Field',
	component: Field,
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof Field>;

export const Text: Story = {
	args: {
		label: 'Email',
		name: 'email',
		type: 'email',
		placeholder: 'you@example.com',
		required: true,
		sanitizeValue: (value) => value.trim().toLowerCase(),
	},
};

export const WithError: Story = {
	args: {
		label: 'Email',
		name: 'email',
		type: 'email',
		errorMessage: 'This field is required.',
	},
};

export const WithHelpText: Story = {
	args: {
		label: 'New password',
		name: 'password',
		type: 'password',
		helpText: 'Minimum 8 characters.',
	},
};

export const Textarea: Story = {
	args: {
		label: 'Description',
		name: 'description',
		type: 'textarea',
		rows: 4,
		sanitizeValue: (value) => value.trim(),
	},
};

export const Select: Story = {
	args: {
		label: 'Role',
		name: 'role_id',
		type: 'select',
		required: true,
		children: (
			<>
				<SelectOption value="admin" label="Administrator" />
				<SelectOption value="user" label="User" />
			</>
		),
	},
};

export const Checkbox: Story = {
	args: {
		label: 'Remember me',
		name: 'remember_me',
		type: 'checkbox',
	},
};

export const ImageExtension: Story = {
	args: {
		label: 'Thumbnail',
		name: 'thumbnailId',
		type: 'image',
		renderImage: (inputProps) => (
			<ImagePicker
				{...inputProps}
				loadFile={async (id) => ([1].includes(id) ? { id, url: 'https://placehold.co/600x600' } : null)}
			/>
		),
	},
};

export const ImageFallback: Story = {
	args: {
		label: 'File ID',
		name: 'thumbnailId',
		type: 'image',
	},
};
