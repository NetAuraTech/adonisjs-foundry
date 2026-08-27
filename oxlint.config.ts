import { defineConfig } from 'oxlint';

export default defineConfig({
	ignorePatterns: ['**/.adonisjs/**'],
	plugins: ['typescript', 'react'],
	rules: {
		'typescript/no-namespace': 'off',
	},
	overrides: [
		{
			// Business layer (src) never depends on the app delivery layer.
			// This path-scoped override is the reference mechanism; it also
			// carries the design-system boundary later.
			files: ['apps/web/src/**/*.{ts,tsx}'],
			rules: {
				'no-restricted-imports': [
					'error',
					{
						patterns: [
							{
								regex: '^#app/',
								message: 'Business code under src must not depend on the app delivery layer.',
							},
							{
								regex: '^\\.\\./(?:\\.\\./)*app(?:/|$)',
								message: 'Business code under src must not escape the src tree to reach the app delivery layer.',
							},
						],
					},
				],
			},
		},
		{
			files: ['apps/web/inertia/**/*.{ts,tsx}'],
			rules: {
				'no-restricted-imports': [
					'error',
					{
						patterns: [
							{
								regex: '^#(?:generated|providers|database|factories|shared|tests|config)/',
								message:
									'Frontend code must not import backend modules. Shared imports belong in the #app, #cms, #types and #start aliases and the domain business-layer aliases.',
							},
							{
								regex: '^\\.\\./(\\.\\./)*app(?:/|$)',
								message: 'Frontend code must not escape the frontend tree to reach backend modules.',
							},
						],
					},
				],
			},
		},
	],
});
