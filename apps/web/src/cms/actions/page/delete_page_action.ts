import { inject } from '@adonisjs/core';
import Page from '#cms/models/page/page';
import { PageRepository } from '#cms/repositories/page/page_repository';
import RowNotFoundException from '#core/exceptions/row_not_found_exception';
import { withTransaction } from '#core/services/with_transaction';
import { LogService } from '#log/services/log_service';

interface DeletePagePayload {
	id: number;
}

/**
 * Permanently delete a page and all its translations.
 */
@inject()
export class DeletePageAction {
	constructor(
		protected pageRepository: PageRepository,
		protected logService: LogService,
	) {}

	/**
	 * Execute page deletion.
	 *
	 * @param payload - The page ID to delete.
	 * @throws {RowNotFoundException} When the page does not exist.
	 */
	async execute(payload: DeletePagePayload): Promise<void> {
		const page = await this.pageRepository.findById(payload.id);

		if (!page) {
			throw new RowNotFoundException(Page);
		}

		await withTransaction(async () => this.pageRepository.delete(payload.id));

		// Log only after the deletion actually succeeded.
		this.logService.logBusiness('page.deleted', {}, { pageId: payload.id });
	}
}
