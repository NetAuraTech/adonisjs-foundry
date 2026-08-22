import { defineConfig } from 'oxlint';

export default defineConfig({
	ignorePatterns: ['**/.adonisjs/**', 'apps/web/types/db.ts'],
	plugins: ['typescript', 'react'],
	rules: {
		'typescript/no-namespace': 'off',
	},
	overrides: [
		{
			files: ['inertia/**/*.{ts,tsx}', 'apps/web/src/**/*.{ts,tsx}'],
			rules: {
				'no-restricted-imports': [
					'error',
					{
						patterns: [
							{
								regex:
									'^#(?:controllers|exceptions|models|mails|listeners|events|generated|rest|repositories|services|contracts|transformers|validators|providers|policies|abilities|database|factories|shared|tests|config|actions|prune)/',
								message:
									'Frontend code must not import backend modules. Type-only imports belong in the shared aliases (#types, #helpers, #start, #cms, #middleware).',
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
