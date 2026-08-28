import './css/app.css';
import { resolvePageComponent } from '@adonisjs/inertia/helpers';
import { TuyauProvider } from '@adonisjs/inertia/react';
import { Data } from '@generated/data';
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react';
import { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import Layout from '~/layouts/default';
import { client } from './client';

let appName = '';

createInertiaApp({
	title: (title) => (title ? `${title} - ${appName}` : appName),
	resolve: (name) => {
		return resolvePageComponent<ResolvedComponent>(
			`./pages/${name}.tsx`,
			import.meta.glob<ResolvedComponent>(['./pages/**/*.tsx', '!./pages/**/*.spec.tsx']),
			(page: ReactElement<Data.SharedProps>) => <Layout children={page} />,
		);
	},
	setup({ el, App, props }) {
		appName = props.initialPage.props.app_name as string;

		createRoot(el).render(
			<TuyauProvider client={client}>
				<App {...props} />
			</TuyauProvider>,
		);
	},
	progress: {
		color: '#4B5563',
	},
});
