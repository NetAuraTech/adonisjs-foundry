import { defineConfig } from '@adonisjs/cors';
import env from '#start/env';

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
	/**
	 * Enable or disable CORS handling globally.
	 */
	enabled: true,

	/**
	 * Explicit allowlist of cross-origin front origins, taken from the
	 * `CORS_ALLOWED_ORIGINS` environment variable (comma-separated). The
	 * `api` flavor is consumed by external fronts by definition, so CORS is
	 * a config step — never a code change.
	 */
	origin: env
		.get('CORS_ALLOWED_ORIGINS', '')
		.split(',')
		.map((origin) => origin.trim())
		.filter((origin) => origin.length > 0),

	/**
	 * HTTP methods accepted for cross-origin requests.
	 */
	methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],

	/**
	 * Reflect request headers by default. Use a string array to restrict
	 * allowed headers.
	 */
	headers: true,

	/**
	 * Response headers exposed to the browser.
	 */
	exposeHeaders: [],

	/**
	 * Allow cookies/authorization headers on cross-origin requests.
	 */
	credentials: true,

	/**
	 * Cache CORS preflight response for N seconds.
	 */
	maxAge: 90,
});

export default corsConfig;
