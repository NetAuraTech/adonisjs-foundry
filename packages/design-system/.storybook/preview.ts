import '../src/css/canonical.css';
import { definePreview } from '@storybook/react-vite';

export const preview = definePreview({
	addons: [],
	parameters: {
		layout: 'centered',
	},
});
