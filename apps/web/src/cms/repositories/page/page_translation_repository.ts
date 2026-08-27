import PageTranslation from '#cms/models/page/page_translation';
import { transactionContext } from '#core/services/transaction_context';
import { BaseRepository } from '#repositories/base_repository';
import type { PageContent, PageStatus } from '#cms/types/page';
import type { DateTime } from 'luxon';

/**
 * Handles all database operations for the {@link PageTranslation} model.
 *
 * Manages localized page content including slug uniqueness validation
 * and upsert operations for cross-locale copying.
 */
export class PageTranslationRepository extends BaseRepository {
	/**
	 * Finds a translation by its primary key.
	 *
	 * @param id - The translation's primary key.
	 * @returns The matching {@link PageTranslation}, or `null` if not found.
	 *
	 * @example
	 * const translation = await pageTranslationRepository.findById(1)
	 */
	async findById(id: number): Promise<PageTranslation | null> {
		return PageTranslation.query(this.client()).where('id', id).first();
	}

	/**
	 * Finds the translation for a given page and locale combination.
	 *
	 * @param pageId - The primary key of the parent page.
	 * @param locale - The locale code (e.g., 'en', 'fr').
	 * @returns The matching {@link PageTranslation}, or `null` if not found.
	 *
	 * @example
	 * const translation = await pageTranslationRepository.findByPageAndLocale(1, 'fr')
	 */
	async findByPageAndLocale(pageId: number, locale: string): Promise<PageTranslation | null> {
		return PageTranslation.query(this.client()).where('page_id', pageId).where('locale', locale).first();
	}

	/**
	 * Finds a translation by its slug.
	 *
	 * @param slug - The translation slug to look up.
	 * @returns The matching {@link PageTranslation}, or `null` if not found.
	 *
	 * @example
	 * const translation = await pageTranslationRepository.findBySlug('about-us')
	 */
	async findBySlug(slug: string): Promise<PageTranslation | null> {
		return PageTranslation.query(this.client()).where('slug', slug).preload('page').first();
	}

	/**
	 * Creates and persists a new translation.
	 *
	 * @param data - The translation data including page ID, locale, and content.
	 * @returns The newly created {@link PageTranslation}. Defaults to `'draft'` status if not provided.
	 *
	 * @example
	 * const translation = await pageTranslationRepository.create({ pageId: 1, locale: 'en', slug: 'home', title: 'Home', content: {} })
	 */
	async create(data: {
		pageId: number;
		locale: string;
		slug: string;
		title: string;
		content: PageContent;
		metaTitle?: string | null;
		metaDescription?: string | null;
		status?: PageStatus;
	}): Promise<PageTranslation> {
		return PageTranslation.create(
			{
				...data,
				status: data.status ?? 'draft',
			},
			this.client(),
		);
	}

	/**
	 * Updates an existing translation.
	 *
	 * @param translation - The {@link PageTranslation} instance to update.
	 * @param data - Partial fields to merge into the translation.
	 * @returns The updated {@link PageTranslation}.
	 *
	 * @example
	 * const updated = await pageTranslationRepository.update(translation, { title: 'New Title' })
	 */
	async update(
		translation: PageTranslation,
		data: Partial<{
			slug: string;
			title: string;
			content: PageContent;
			metaTitle: string | null;
			metaDescription: string | null;
			status: PageStatus;
			publishedAt: DateTime | null;
		}>,
	): Promise<PageTranslation> {
		translation.merge(data as any);
		await transactionContext.merge(translation);
		await translation.save();
		return translation;
	}

	/**
	 * Creates or updates the translation for a given page + locale.
	 * Used when copying a page to a new locale.
	 *
	 * @param pageId - The primary key of the parent page.
	 * @param locale - The target locale code.
	 * @param data - The translation fields to create or update.
	 * @returns The persisted {@link PageTranslation}.
	 *
	 * @example
	 * const translation = await pageTranslationRepository.upsert(1, 'fr', { slug: 'a-propos', title: 'A propos', content: {} })
	 */
	async upsert(
		pageId: number,
		locale: string,
		data: {
			slug: string;
			title: string;
			content: PageContent;
			metaTitle?: string | null;
			metaDescription?: string | null;
			status?: PageStatus;
		},
	): Promise<PageTranslation> {
		return PageTranslation.updateOrCreate(
			{ pageId, locale },
			{
				...data,
				status: data.status ?? 'draft',
			},
			this.client(),
		);
	}

	/**
	 * Checks whether a translation with the given slug already exists.
	 *
	 * @param slug - The slug to check.
	 * @param excludeId - Optional translation ID to exclude from the check (for updates).
	 * @returns `true` if a translation with that slug exists, `false` otherwise.
	 *
	 * @example
	 * const taken = await pageTranslationRepository.slugExists('about-us')
	 */
	async slugExists(slug: string, excludeId?: number): Promise<boolean> {
		const query = PageTranslation.query(this.client()).where('slug', slug);
		if (excludeId) query.whereNot('id', excludeId);
		const result = await query.first();
		return !!result;
	}

	/**
	 * Counts translations grouped by status with a single aggregate query,
	 * without loading rows. Statuses absent from the table report `0`.
	 *
	 * @returns The number of translations per {@link PageStatus}.
	 *
	 * @example
	 * const counts = await pageTranslationRepository.countByStatus()
	 * // { draft: 3, published: 12, archived: 1 }
	 */
	async countByStatus(): Promise<Record<PageStatus, number>> {
		const rows = await PageTranslation.query(this.client()).select('status').count('* as total').groupBy('status');

		const counts: Record<PageStatus, number> = { draft: 0, published: 0, archived: 0 };
		for (const row of rows) {
			if (row.status in counts) {
				counts[row.status] = Number(row.$extras.total);
			}
		}
		return counts;
	}

	/**
	 * Counts the unique locales having at least one published translation.
	 *
	 * @returns The number of distinct published locales.
	 *
	 * @example
	 * const locales = await pageTranslationRepository.countPublishedLocales()
	 */
	async countPublishedLocales(): Promise<number> {
		const result = await PageTranslation.query(this.client())
			.where('status', 'published')
			.countDistinct('locale as total');
		return Number(result[0].$extras.total);
	}

	/**
	 * Lists the most recently published translations, newest first.
	 *
	 * Rows published before `publishedAt` was stamped have a NULL date: the
	 * explicit `NULLS LAST` keeps them at the bottom on both PostgreSQL and
	 * SQLite (their default NULL ordering differs), with `updated_at` as a
	 * deterministic tiebreak.
	 *
	 * @param limit - Maximum number of translations to return.
	 * @returns The latest published {@link PageTranslation} records, bounded to `limit`.
	 *
	 * @example
	 * const latest = await pageTranslationRepository.listRecentlyPublished(5)
	 */
	async listRecentlyPublished(limit: number): Promise<PageTranslation[]> {
		return PageTranslation.query(this.client())
			.where('status', 'published')
			.orderByRaw('published_at DESC NULLS LAST, updated_at DESC')
			.limit(limit);
	}
}
