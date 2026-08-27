import Template from '#cms/models/template/template';
import { transactionContext } from '#core/services/transaction_context';
import { BaseRepository } from '#repositories/base_repository';
import type { BlockType, PageContent } from '#cms/types/page';
import type { TemplateType } from '#cms/types/template';

interface ListFilters {
	type?: TemplateType;
	blockType?: BlockType;
	search?: string;
}

/**
 * Handles all database operations for the {@link Template} model.
 *
 * Manages reusable content templates that can be applied to pages or used
 * as building blocks for page compositions.
 */
export class TemplateRepository extends BaseRepository {
	/**
	 * Finds a template by its primary key, preloading the thumbnail image.
	 *
	 * @param id - The template's primary key.
	 * @returns The matching {@link Template}, or `null` if not found.
	 *
	 * @example
	 * const template = await templateRepository.findById(1)
	 */
	async findById(id: number): Promise<Template | null> {
		return Template.query(this.client()).where('id', id).preload('thumbnail').first();
	}

	/**
	 * Finds a template by its primary key, preloading the thumbnail image.
	 * Throws if not found.
	 *
	 * @param id - The template's primary key.
	 * @returns The matching {@link Template}.
	 * @throws {Exception} With code `E_ROW_NOT_FOUND` if no record exists for `id`.
	 *
	 * @example
	 * const template = await templateRepository.findByIdOrFail(1)
	 */
	async findByIdOrFail(id: number): Promise<Template> {
		return Template.query(this.client()).where('id', id).preload('thumbnail').firstOrFail();
	}

	/**
	 * Returns templates with optional filters, sorted alphabetically by name.
	 *
	 * @param filters - Optional filters for type, block type, and search term.
	 * @returns An array of {@link Template} records with thumbnail preloaded.
	 *
	 * @example
	 * const templates = await templateRepository.list({ type: 'page' })
	 */
	async list(filters: ListFilters): Promise<Template[]> {
		const query = Template.query(this.client()).preload('thumbnail').orderBy('name', 'asc');

		if (filters.type) {
			query.where('type', filters.type);
		}

		if (filters.blockType) {
			query.where('block_type', filters.blockType);
		}

		if (filters.search) {
			query.whereILike('name', `%${filters.search}%`);
		}

		return query;
	}

	/**
	 * Counts every template with a single aggregate query, without loading rows.
	 *
	 * @returns The total number of templates.
	 *
	 * @example
	 * const total = await templateRepository.count()
	 */
	async count(): Promise<number> {
		const result = await Template.query(this.client()).count('* as total');
		return Number(result[0].$extras.total);
	}

	/**
	 * Creates and persists a new template.
	 *
	 * @param data - The template data including name, type, and content.
	 * @returns The newly created {@link Template}.
	 *
	 * @example
	 * const template = await templateRepository.create({ name: 'Hero', type: 'block', content: {} })
	 */
	async create(data: {
		name: string;
		description?: string | null;
		thumbnailId?: number | null;
		type: TemplateType;
		blockType?: BlockType | null;
		content: PageContent;
		createdBy: number | null;
	}): Promise<Template> {
		return Template.create(data, this.client());
	}

	/**
	 * Updates an existing template.
	 *
	 * @param template - The {@link Template} instance to update.
	 * @param data - Partial fields to merge into the template.
	 * @returns The updated {@link Template}.
	 *
	 * @example
	 * const updated = await templateRepository.update(template, { name: 'New Name' })
	 */
	async update(
		template: Template,
		data: Partial<{
			name: string;
			description: string | null;
			thumbnailId: number | null;
			content: PageContent;
			blockType: BlockType | null;
		}>,
	): Promise<Template> {
		template.merge(data as any);
		await transactionContext.merge(template);
		await template.save();
		return template;
	}

	/**
	 * Deletes a template by its primary key.
	 *
	 * @param id - The primary key of the template to delete.
	 *
	 * @example
	 * await templateRepository.delete(1)
	 */
	async delete(id: number): Promise<void> {
		const template = await Template.query(this.client()).where('id', id).firstOrFail();
		await template.delete();
	}
}
