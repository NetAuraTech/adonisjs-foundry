import { inject } from '@adonisjs/core';
import { PageRepository } from '#cms/repositories/page/page_repository';
import type Page from '#cms/models/page/page';

/**
 * List published pages available for internal linking.
 */
@inject()
export class GetAvailablePagesForLinkAction {
	constructor(protected pageRepository: PageRepository) {}

	/**
	 * Execute linkable page listing.
	 *
	 * @returns Array of page summaries with translations suitable for link selectors.
	 */
	async execute(): Promise<{ id: number; label: any; default_locale: string; locales: any }[]> {
		const pages = await this.pageRepository.getLinkablePages();
		return pages.map((page: Page) => ({
			id: page.id,
			label: (page as any).translations?.[0]?.title,
			default_locale: page.defaultLocale,
			locales: ((page as any).translations ?? []).map((t: { locale: string; slug: string }) => ({
				locale: t.locale,
				slug: t.slug,
			})),
		}));
	}
}
