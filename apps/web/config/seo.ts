import env from '#start/env';
import type { LegalIdentity } from '#types/seo';

/**
 * Maps an environment value to `undefined` when it is empty, so an
 * unconfigured deployment shares an identity with no fields rather than a
 * bag of empty strings.
 *
 * @param value - The environment value.
 */
const optional = (value: string): string | undefined => (value === '' ? undefined : value);

/**
 * Configuration for the public front SEO surface (robots.txt, structured
 * data).
 *
 * Parsed once at boot from environment variables. The publisher identity is
 * shared with the public front so the page heads can emit the JSON-LD
 * describing it; fields that are not configured stay `undefined` and are
 * omitted from the emitted structured data.
 */
const seoConfig = {
	/**
	 * Publisher identity for the public front structured data, resolved from
	 * the `LEGAL_*` environment variables. Every field is optional — an
	 * unconfigured deployment shares an empty identity.
	 */
	identity: {
		name: optional(env.get('LEGAL_NAME', '')),
		siret: optional(env.get('LEGAL_SIRET', '')),
		address: optional(env.get('LEGAL_ADDRESS', '')),
		phone: optional(env.get('LEGAL_PHONE', '')),
	} satisfies LegalIdentity,
};

export default seoConfig;
