import adonisjs from '@adonisjs/vite/client';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		react(),
		adonisjs({
			entryPoints: ['inertia/app.tsx'],
			serverEntryPoints: ['inertia/ssr.tsx'],
			reload: ['resources/views/**/*.edge'],
		}),
		tailwindcss(),
	],

	resolve: {
		alias: {
			'~/': `${import.meta.dirname}/inertia/`,
			'@generated': `${import.meta.dirname}/.adonisjs/client/`,
		},
		dedupe: ['react', 'react-dom'],
	},

	server: {
		watch: {
			ignored: ['**/storage/**', '**/tmp/**'],
		},
		allowedHosts: [new URL(process.env.APP_URL ?? 'http://localhost:3333').hostname],
	},

	build: {
		chunkSizeWarningLimit: 1000,
	},
});
