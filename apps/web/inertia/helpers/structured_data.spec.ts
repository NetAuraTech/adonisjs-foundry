import { describe, expect, it } from 'vitest';
import { breadcrumbJsonLd, businessJsonLd, parsePostalAddress } from '~/helpers/structured_data';
import type { LegalIdentity } from '#types/seo';

/**
 * SEO contract for the structured-data builders: the JSON-LD emitted in the
 * public front heads carries the publisher identity (LocalBusiness) and the
 * breadcrumb trail, and omits every field that is not configured — an
 * unconfigured deployment must not emit empty or placeholder values.
 */

const appUrl = 'https://example.org';

const configuredIdentity: LegalIdentity = {
	name: 'Jeanne Dupont',
	siret: '12345678901234',
	address: '8 avenue des Tilleuls, 75011, Paris, France',
	phone: '+33 3 12 34 56 78',
};

describe('parsePostalAddress', () => {
	it('parses the full French address into a PostalAddress', () => {
		expect(parsePostalAddress(configuredIdentity.address)).toEqual({
			'@type': 'PostalAddress',
			streetAddress: '8 avenue des Tilleuls',
			postalCode: '75011',
			addressLocality: 'Paris',
			addressCountry: 'FR',
		});
	});

	it('returns undefined for an unset or empty address', () => {
		expect(parsePostalAddress(undefined)).toBeUndefined();
		expect(parsePostalAddress('')).toBeUndefined();
	});

	it('keeps the street only when no structured parts are present', () => {
		expect(parsePostalAddress('12 rue des Lilas')).toEqual({
			'@type': 'PostalAddress',
			streetAddress: '12 rue des Lilas',
		});
	});

	it('recognises the postal code without a country or locality', () => {
		expect(parsePostalAddress('12 rue des Lilas, 75011')).toEqual({
			'@type': 'PostalAddress',
			streetAddress: '12 rue des Lilas',
			postalCode: '75011',
		});
	});
});

describe('businessJsonLd', () => {
	it('emits the LocalBusiness node with the configured identity', () => {
		const node = businessJsonLd({
			appUrl,
			appName: 'Foundry',
			email: 'contact@example.org',
			identity: configuredIdentity,
			image: `${appUrl}/og-image.jpg`,
		});

		expect(node['@type']).toBe('LocalBusiness');
		expect(node['@id']).toBe(`${appUrl}/#business`);
		expect(node.name).toBe('Foundry');
		expect(node.url).toBe(appUrl);
		expect(node.legalName).toBe('Jeanne Dupont');
		expect(node.telephone).toBe('+33 3 12 34 56 78');
		expect(node.email).toBe('contact@example.org');
		expect(node.taxID).toBe('12345678901234');
		expect(node.image).toBe(`${appUrl}/og-image.jpg`);
		expect(node.address).toEqual({
			'@type': 'PostalAddress',
			streetAddress: '8 avenue des Tilleuls',
			postalCode: '75011',
			addressLocality: 'Paris',
			addressCountry: 'FR',
		});
	});

	it('omits every field that is not configured', () => {
		const node = businessJsonLd({ appUrl, appName: 'Foundry', identity: {} });

		expect(node.legalName).toBeUndefined();
		expect(node.telephone).toBeUndefined();
		expect(node.email).toBeUndefined();
		expect(node.address).toBeUndefined();
		expect(node.taxID).toBeUndefined();
		expect(node.image).toBeUndefined();
		expect(node.hasOfferCatalog).toBeUndefined();
		expect(JSON.stringify(node)).not.toContain('""');
	});

	it('ignores empty or malformed identity values', () => {
		const node = businessJsonLd({
			appUrl,
			appName: 'Foundry',
			identity: { name: '   ', siret: '123', address: '', phone: '' },
		});

		expect(node.legalName).toBeUndefined();
		expect(node.taxID).toBeUndefined();
		expect(node.address).toBeUndefined();
		expect(node.telephone).toBeUndefined();
	});

	it('attaches the offer catalog only when offers are provided', () => {
		const without = businessJsonLd({ appUrl, appName: 'Foundry', identity: {} });
		expect(without.hasOfferCatalog).toBeUndefined();

		const empty = businessJsonLd({ appUrl, appName: 'Foundry', identity: {}, offers: { items: [] } });
		expect(empty.hasOfferCatalog).toBeUndefined();

		const withCatalog = businessJsonLd({
			appUrl,
			appName: 'Foundry',
			identity: {},
			offers: {
				name: 'Prestations',
				items: [{ type: 'Service', name: 'Site vitrine', description: 'Design sur mesure' }],
			},
		});

		const catalog = withCatalog.hasOfferCatalog as Record<string, unknown>;
		expect(catalog['@type']).toBe('OfferCatalog');
		expect(catalog.name).toBe('Prestations');
		expect(catalog.itemListElement).toEqual([
			{
				'@type': 'Offer',
				itemOffered: { '@type': 'Service', name: 'Site vitrine', description: 'Design sur mesure' },
			},
		]);
	});
});

describe('breadcrumbJsonLd', () => {
	it('emits the trail with the current page by name only', () => {
		const node = breadcrumbJsonLd([{ name: 'Foundry', url: `${appUrl}/` }, { name: 'Page du site' }]);

		expect(node['@type']).toBe('BreadcrumbList');
		expect(node.itemListElement).toEqual([
			{ '@type': 'ListItem', position: 1, name: 'Foundry', item: `${appUrl}/` },
			{ '@type': 'ListItem', position: 2, name: 'Page du site' },
		]);
	});
});
