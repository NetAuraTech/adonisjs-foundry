import type { LegalIdentity } from '#types/seo';

/**
 * The structured-data builders of the public front.
 *
 * Pure functions producing `schema.org` JSON-LD nodes for the document head.
 * They stay in the Inertia layer (no backend imports) and take plain values —
 * the page shared props and the content payload — so each front page composes
 * its own head without any further data access. Identity values that are not
 * configured are omitted rather than emitted as empty values.
 */

/** A JSON-LD node ready to be serialized into an `application/ld+json` script. */
export type JsonLd = Record<string, unknown>;

/** A single crumb of a `BreadcrumbList` trail; the current page omits `url`. */
export type BreadcrumbCrumb = {
	/** Crumb display name. */
	name: string;
	/** Absolute crumb URL, omitted for the current page. */
	url?: string;
};

/** A service entry of a business `OfferCatalog`. */
export type BusinessOffer = {
	/** `schema.org` type of the offered item, e.g. `'Service'`. */
	type: string;
	/** Offer name. */
	name: string;
	/** Optional offer description. */
	description?: string;
};

/**
 * Whether a value is unset (undefined, empty or whitespace-only), so it must
 * not be emitted into public structured data.
 *
 * @param value - The value to check.
 */
function isUnset(value: string | undefined): value is undefined {
	return value === undefined || value.trim() === '';
}

/**
 * Parse a free-form address line (e.g. `"8 avenue des Tilleuls, 75011, Paris,
 * France"`) into a `schema.org` `PostalAddress`, taking whatever parts are
 * present.
 *
 * The 5-digit postal code is recognised by pattern; the last part is the
 * country and the part before it the locality; everything left over becomes
 * the `streetAddress`.
 *
 * @param address - The comma-separated address line.
 * @returns A `PostalAddress` node, or `undefined` when the address is unset.
 */
export function parsePostalAddress(address: string | undefined): JsonLd | undefined {
	if (isUnset(address)) return undefined;

	const parts = address
		.split(',')
		.map((part) => part.trim())
		.filter((part) => part !== '');
	if (parts.length === 0) return undefined;

	const postalIndex = parts.findIndex((part) => /^\d{5}$/.test(part));
	const lastIndex = parts.length - 1;

	const country = lastIndex !== postalIndex && parts.length >= 2 ? parts[lastIndex] : undefined;
	const locality =
		parts.length >= 3 && lastIndex - 1 !== postalIndex && parts[lastIndex - 1] !== country
			? parts[lastIndex - 1]
			: undefined;

	const consumed = new Set<number>();
	if (country !== undefined) consumed.add(lastIndex);
	if (locality !== undefined) consumed.add(lastIndex - 1);
	if (postalIndex !== -1) consumed.add(postalIndex);

	const streetAddress = parts
		.filter((_, index) => !consumed.has(index))
		.join(', ')
		.trim();

	const node: JsonLd = { '@type': 'PostalAddress' };
	if (streetAddress) node.streetAddress = streetAddress;
	if (postalIndex !== -1) node.postalCode = parts[postalIndex];
	if (locality) node.addressLocality = locality;
	if (country) node.addressCountry = /france/i.test(country) ? 'FR' : country;

	return node;
}

/**
 * Build the `LocalBusiness` JSON-LD node describing the publisher.
 *
 * Identity values that are not configured are omitted, so a not-yet-configured
 * deployment never emits empty or placeholder values into structured data.
 * The `hasOfferCatalog` is only attached when the page carries offers.
 *
 * @param opts.appUrl - Absolute application URL (no trailing slash).
 * @param opts.appName - Public site name.
 * @param opts.email - Contact email shared with every page.
 * @param opts.identity - Publisher identity resolved from the `LEGAL_*` env.
 * @param opts.image - Absolute image URL (e.g. the page og:image).
 * @param opts.offers - The offer catalog, when the page carries one.
 * @returns The `LocalBusiness` node.
 *
 * @example
 * const jsonLd = businessJsonLd({ appUrl, appName, email, identity, image })
 */
export function businessJsonLd(opts: {
	appUrl: string;
	appName: string;
	email?: string;
	identity: LegalIdentity;
	image?: string;
	offers?: { name?: string; items: BusinessOffer[] };
}): JsonLd {
	const { appUrl, appName, email, identity, image, offers } = opts;

	const node: JsonLd = {
		'@context': 'https://schema.org',
		'@type': 'LocalBusiness',
		'@id': `${appUrl}/#business`,
		name: appName,
		url: appUrl,
	};

	if (!isUnset(identity.name)) node.legalName = identity.name;
	if (!isUnset(identity.phone)) node.telephone = identity.phone;
	if (!isUnset(email)) node.email = email;

	const address = parsePostalAddress(identity.address);
	if (address) node.address = address;
	if (!isUnset(identity.siret) && /^\d{14}$/.test(identity.siret)) node.taxID = identity.siret;
	if (!isUnset(image)) node.image = image;

	if (offers && offers.items.length > 0) {
		node.hasOfferCatalog = {
			'@type': 'OfferCatalog',
			...(offers.name ? { name: offers.name } : {}),
			itemListElement: offers.items.map((item) => ({
				'@type': 'Offer',
				itemOffered: {
					'@type': item.type,
					name: item.name,
					...(item.description ? { description: item.description } : {}),
				},
			})),
		};
	}

	return node;
}

/**
 * Build the `BreadcrumbList` JSON-LD node for a page trail.
 *
 * The current page (the last crumb) is expected without `url`: it is listed
 * by name only, per the schema.org breadcrumb guidance.
 *
 * @param trail - The ordered crumbs, from the site root down.
 * @returns The `BreadcrumbList` node.
 *
 * @example
 * breadcrumbJsonLd([{ name: appName, url: `${appUrl}/` }, { name: seoTitle }])
 */
export function breadcrumbJsonLd(trail: BreadcrumbCrumb[]): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: trail.map((crumb, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: crumb.name,
			...(crumb.url ? { item: crumb.url } : {}),
		})),
	};
}
