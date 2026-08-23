import { inject } from '@adonisjs/core';
import { PageRepository } from '#cms/domain/repositories/page/page_repository';
import type Page from '#cms/models/page/page';

interface FindPageBySlugPayload {
	slug: string;
}

/**
 * Find a page by its translation slug.
 */
@inject()
export class FindPageBySlugAction {
	constructor(protected pageRepository: PageRepository) {}

	/**
	 * Execute page lookup by slug.
	 *
	 * @param payload - The slug to search for.
	 * @returns The {@link Page} with translations preloaded, or `null` if not found.
	 */
	async execute(payload: FindPageBySlugPayload): Promise<Page | null> {
		return this.pageRepository.findBySlug(payload.slug);
	}
}
