import { inject } from '@adonisjs/core';
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model';
import Page from '#cms/models/page/page';
import { PageRepository } from '#cms/repositories/page/page_repository';
import type { PageStatus } from '#cms/types/page';
import type { PaginationFilters } from '#types/pagination';

interface ListPagesPayload {
	status?: PageStatus;
	locale?: string;
	search?: string;
	pagination: PaginationFilters;
}

/**
 * List pages with optional filters and pagination.
 */
@inject()
export class ListPagesAction {
	constructor(protected pageRepository: PageRepository) {}

	/**
	 * Execute page listing.
	 *
	 * @param payload - Filters (status, locale, search) and pagination parameters.
	 * @returns A paginated result set of pages.
	 *
	 * @example
	 * const result = await listPagesAction.execute({ status: 'published', pagination: { page: 1, perPage: 20 } })
	 */
	async execute(payload: ListPagesPayload): Promise<ModelPaginatorContract<Page>> {
		return this.pageRepository.list(
			{ status: payload.status, locale: payload.locale, search: payload.search },
			payload.pagination,
		);
	}
}
