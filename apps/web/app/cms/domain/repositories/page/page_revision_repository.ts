import PageRevision from '#cms/models/page/page_revision';
import { BaseRepository } from '#repositories/base_repository';
import { transactionContext } from '#shared/context/transaction_context';
import type { PageContent } from '#cms/types/page';
import type { ModelPaginatorContract } from '@adonisjs/lucid/types/model';

/**
 * Handles all database operations for the {@link PageRevision} model.
 *
 * Manages page revision history, including creation, toggling pinned status,
 * and purging old revisions beyond a retention limit.
 */
export class PageRevisionRepository extends BaseRepository {
	/**
	 * Finds a revision by its primary key.
	 *
	 * @param id - The revision's primary key.
	 * @returns The matching {@link PageRevision}, or `null` if not found.
	 *
	 * @example
	 * const revision = await pageRevisionRepository.findById(1)
	 */
	async findById(id: number): Promise<PageRevision | null> {
		return PageRevision.query(this.client()).where('id', id).first();
	}

	/**
	 * Finds a revision by its primary key. Throws if not found.
	 *
	 * @param id - The revision's primary key.
	 * @returns The matching {@link PageRevision}.
	 * @throws {Exception} With code `E_ROW_NOT_FOUND` if no record exists for `id`.
	 *
	 * @example
	 * const revision = await pageRevisionRepository.findByIdOrFail(1)
	 */
	async findByIdOrFail(id: number): Promise<PageRevision> {
		return PageRevision.query(this.client()).where('id', id).firstOrFail();
	}

	/**
	 * Returns revisions for a translation, ordered newest first.
	 *
	 * @param translationId - The primary key of the parent translation.
	 * @param limit - Optional maximum number of revisions to return.
	 * @returns An array of {@link PageRevision} records with author preloaded.
	 *
	 * @example
	 * const revisions = await pageRevisionRepository.listByTranslation(5, 10)
	 */
	async listByTranslation(translationId: number, limit?: number): Promise<PageRevision[]> {
		const query = PageRevision.query(this.client())
			.preload('author')
			.where('page_translation_id', translationId)
			.orderBy('created_at', 'desc');

		if (limit) query.limit(limit);

		return query;
	}

	/**
	 * Creates and persists a new revision.
	 *
	 * @param data - The revision data including content and creator ID.
	 * @returns The newly created {@link PageRevision}.
	 *
	 * @example
	 * const revision = await pageRevisionRepository.create({ pageTranslationId, content, createdBy: 1 })
	 */
	async create(data: {
		pageTranslationId: number;
		content: PageContent;
		keep: boolean;
		createdBy: number | null;
	}): Promise<PageRevision> {
		return PageRevision.create(data, this.client());
	}

	/**
	 * Toggles the `keep` (pinned) flag on a revision.
	 * Pinned revisions are excluded from automatic purging.
	 *
	 * @param id - The primary key of the revision to toggle.
	 * @returns The updated {@link PageRevision}.
	 *
	 * @example
	 * const revision = await pageRevisionRepository.toggleKeep(3)
	 */
	async toggleKeep(id: number): Promise<PageRevision> {
		const revision = await PageRevision.query(this.client()).where('id', id).firstOrFail();
		revision.keep = !revision.keep;
		await transactionContext.merge(revision);
		await revision.save();
		return revision;
	}

	/**
	 * Deletes the oldest non-pinned revisions for a translation beyond `keepCount`.
	 * Pinned revisions (`keep = true`) are never touched.
	 *
	 * @param translationId - The translation to purge revisions for.
	 * @param keepCount - Maximum number of non-pinned revisions to retain.
	 *
	 * @example
	 * await pageRevisionRepository.purgeOld(5, 10)
	 */
	async purgeOld(translationId: number, keepCount: number): Promise<void> {
		const unpinned = await PageRevision.query(this.client())
			.where('page_translation_id', translationId)
			.where('keep', false)
			.orderBy('created_at', 'desc');

		if (unpinned.length <= keepCount) return;

		const toDelete = unpinned.slice(keepCount).map((r) => r.id);

		await PageRevision.query(this.client()).whereIn('id', toDelete).delete();
	}

	/**
	 * Returns a paginated list of revisions for all translations of a given page.
	 *
	 * @param pageId - The primary key of the parent page.
	 * @param pagination - Page number and items per page.
	 * @returns A paginated result set ordered newest first.
	 */
	async list(
		pageId: number,
		pagination: { page?: number; perPage?: number },
	): Promise<ModelPaginatorContract<PageRevision>> {
		const { default: PageTranslation } = await import('#cms/models/page/page_translation');
		const translations = await PageTranslation.query(this.client()).where('page_id', pageId);
		const translationIds = translations.map((t: { id: number }) => t.id);

		const query = PageRevision.query(this.client())
			.preload('author')
			.whereIn('page_translation_id', translationIds)
			.orderBy('created_at', 'desc');

		return query.paginate(pagination.page ?? 1, pagination.perPage ?? 20);
	}

	/**
	 * Retrieves the stored content data for a revision, for restoration.
	 *
	 * @param id - The primary key of the revision.
	 * @returns The revision's {@link PageContent}, or `null` if not found.
	 */
	async getRevisionData(id: number): Promise<PageContent | null> {
		const revision = await this.findById(id);
		if (!revision) return null;
		return revision.content as PageContent;
	}
}
