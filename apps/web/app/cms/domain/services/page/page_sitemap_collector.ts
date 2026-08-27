import { inject } from '@adonisjs/core';
import { PageRepository } from '#cms/domain/repositories/page/page_repository';
import env from '#start/env';
import type Page from '#cms/models/page/page';
import type { SitemapContributor } from '#core/types/sitemap';

/**
 * Sitemap contributor that enumerates published CMS Pages.
 *
 * URL rules (unchanged from the dissolved `GenerateSitemapAction`):
 * - Homepage in the default locale resolves to `/`.
 * - Homepage in a non-default locale resolves to `/{locale}/`.
 * - Subpage in the default locale resolves to `/{slug}`.
 * - Subpage in a non-default locale resolves to `/{locale}/{slug}`.
 *
 * Only published translations are included; the repository preloads them
 * filtered, and a defensive client-side filter keeps the contract explicit.
 */
@inject()
export class PageSitemapCollector implements SitemapContributor {
	readonly name = 'page';

	constructor(protected pageRepository: PageRepository) {}

	/**
	 * Collect absolute URLs for every published page translation.
	 *
	 * @returns Absolute URLs for all published CMS Pages.
	 */
	async collect(): Promise<string[]> {
		const baseUrl = env.get('APP_URL');
		const pages = await this.pageRepository.listPublishedForSitemap();

		const urls: string[] = [];
		for (const page of pages) {
			for (const translation of page.translations) {
				if (translation.status !== 'published') continue;
				urls.push(this.buildUrl(translation, page, baseUrl));
			}
		}
		return urls;
	}

	/**
	 * Build the absolute URL for a single page translation.
	 *
	 * @param translation - A page translation with `locale` and `slug`.
	 * @param page - The owning page, with `isHomepage` and `defaultLocale`.
	 * @param baseUrl - Absolute application URL (no trailing slash).
	 * @returns The absolute URL for the translation.
	 */
	protected buildUrl(
		translation: { locale: string; slug: string },
		page: Pick<Page, 'isHomepage' | 'defaultLocale'>,
		baseUrl: string,
	): string {
		if (page.isHomepage) {
			return translation.locale === page.defaultLocale ? `${baseUrl}/` : `${baseUrl}/${translation.locale}/`;
		}

		return translation.locale === page.defaultLocale
			? `${baseUrl}/${translation.slug}`
			: `${baseUrl}/${translation.locale}/${translation.slug}`;
	}
}
