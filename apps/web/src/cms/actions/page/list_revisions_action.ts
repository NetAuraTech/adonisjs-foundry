import { inject } from '@adonisjs/core';
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model';
import PageRevision from '#cms/models/page/page_revision';
import { PageRevisionRepository } from '#cms/repositories/page/page_revision_repository';
import type { PaginationFilters } from '#types/pagination';

interface ListRevisionsPayload {
	pageId: number;
	pagination: PaginationFilters;
}

/**
 * List revisions for a page.
 */
@inject()
export class ListRevisionsAction {
	constructor(protected revisionRepository: PageRevisionRepository) {}

	/**
	 * Execute revision listing.
	 *
	 * @param payload - Page ID and pagination filters.
	 * @returns Paginated list of revisions (newest first).
	 */
	async execute(payload: ListRevisionsPayload): Promise<ModelPaginatorContract<PageRevision>> {
		return this.revisionRepository.list(payload.pageId, payload.pagination);
	}
}
