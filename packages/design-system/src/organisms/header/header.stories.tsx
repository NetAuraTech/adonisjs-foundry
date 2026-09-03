import { Header } from './header';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
	title: 'Organisms/Header',
	component: Header,
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
	args: {
		appName: 'Foundry',
		links: [{ label: 'Home', href: '/', isActive: true }],
	},
};

export const MultipleLinks: Story = {
	args: {
		appName: 'Foundry',
		links: [
			{ label: 'Home', href: '/', isActive: true },
			{ label: 'About', href: '/about' },
			{ label: 'Contact', href: '/contact' },
		],
	},
};
