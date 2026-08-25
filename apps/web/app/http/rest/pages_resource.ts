import { inject } from '@adonisjs/core';
import { ChangePageStatusAction } from '#cms/domain/actions/page/change_page_status_action';
import { CreatePageAction } from '#cms/domain/actions/page/create_page_action';
import { CreateTranslationAction } from '#cms/domain/actions/page/create_translation_action';
import { DeletePageAction } from '#cms/domain/actions/page/delete_page_action';
import { GetPageDetailAction } from '#cms/domain/actions/page/get_page_detail_action';
import { ListPagesAction } from '#cms/domain/actions/page/list_pages_action';
import { ListRevisionsAction } from '#cms/domain/actions/page/list_revisions_action';
import { RestoreRevisionAction } from '#cms/domain/actions/page/restore_revision_action';
import { SetHomepageAction } from '#cms/domain/actions/page/set_homepage_action';
import { ToggleRevisionKeepAction } from '#cms/domain/actions/page/toggle_revision_keep_action';
import { UpdatePageAction } from '#cms/domain/actions/page/update_page_action';
import {
	listPageValidator,
	showPageValidator,
	createPageValidator,
	updatePageValidator,
	publishPageValidator,
	createTranslationValidator,
} from '#cms/validators/page';
import { type RestEndpoint } from '#rest/rest_adapter';
import PageRevisionTransformer from '#app/page/transformers/page_revision_transformer';
import PageTransformer from '#app/page/transformers/page_transformer';
import type Page from '#cms/models/page/page';
import type PageRevision from '#cms/models/page/page_revision';
import type PageTranslation from '#cms/models/page/page_translation';
import type { Infer } from '@vinejs/vine/types';

type PageListPagination = Awaited<ReturnType<ListPagesAction['execute']>>;
type RevisionListPagination = Awaited<ReturnType<ListRevisionsAction['execute']>>;

type PageListPayload = Infer<typeof listPageValidator>;
type PageIdPayload = Infer<typeof showPageValidator>;
type PageCreatePayload = Infer<typeof createPageValidator>;
type PageUpdatePayload = Infer<typeof updatePageValidator>;
type PagePublishPayload = Infer<typeof publishPageValidator>;
type PageTranslationPayload = Infer<typeof createTranslationValidator>;

/**
 * Endpoint declarations for the pages REST resource.
 */
export interface PagesEndpoints {
	index: RestEndpoint<undefined, PageListPayload, PageListPagination, PageListPagination>;
	show: RestEndpoint<undefined, PageIdPayload, Page, Page>;
	store: RestEndpoint<undefined, PageCreatePayload, Page, Page>;
	update: RestEndpoint<{ id: number }, PageUpdatePayload, PageTranslation, Page>;
	publish: RestEndpoint<{ id: number }, PagePublishPayload, PageTranslation, Page>;
	unpublish: RestEndpoint<{ id: number }, PagePublishPayload, PageTranslation, Page>;
	setHomepage: RestEndpoint<{ id: number }, unknown, void, Page>;
	destroy: RestEndpoint<undefined, PageIdPayload, void, void>;
	storeTranslation: RestEndpoint<{ id: number }, PageTranslationPayload, PageTranslation, Page>;
	listRevisions: RestEndpoint<undefined, unknown, RevisionListPagination, RevisionListPagination>;
	restoreRevision: RestEndpoint<
		{ translationId: number; revisionId: number },
		unknown,
		PageTranslation,
		{ restored: boolean }
	>;
	toggleRevision: RestEndpoint<{ revisionId: number }, unknown, PageRevision, { pinned: PageRevision }>;
}

/**
 * Declarative pages REST resource.
 *
 * Owns the `/api/v1/admin/pages` endpoint declarations (including
 * translations and revisions) consumed by the REST `handle` adapter
 * (`#rest/rest_adapter`); the controllers reduce to one-line dispatch over
 * `endpoints`.
 */
@inject()
export default class PagesResource {
	constructor(
		protected listPagesAction: ListPagesAction,
		protected getPageDetailAction: GetPageDetailAction,
		protected createPageAction: CreatePageAction,
		protected updatePageAction: UpdatePageAction,
		protected changePageStatusAction: ChangePageStatusAction,
		protected setHomepageAction: SetHomepageAction,
		protected deletePageAction: DeletePageAction,
		protected createTranslationAction: CreateTranslationAction,
		protected listRevisionsAction: ListRevisionsAction,
		protected restoreRevisionAction: RestoreRevisionAction,
		protected toggleRevisionKeepAction: ToggleRevisionKeepAction,
	) {}

	readonly endpoints: PagesEndpoints = {
		index: {
			paginated: true,
			strip: true,
			validator: () => listPageValidator,
			execute: (_context, _prepared, payload) =>
				this.listPagesAction.execute({
					status: payload.status,
					locale: payload.locale,
					search: payload.search,
					pagination: _context.pagination!,
				}),
			transform: (entity) => PageTransformer.paginate(entity.all(), entity.getMeta()),
		},
		show: {
			input: (context) => context.params,
			validator: () => showPageValidator,
			execute: (_context, _prepared, payload) => this.getPageDetailAction.execute({ id: payload.id }),
			transform: (entity) => PageTransformer.transform(entity),
		},
		store: {
			status: 201,
			validator: () => createPageValidator,
			execute: (context, _prepared, payload) =>
				this.createPageAction.execute({
					defaultLocale: payload.locale,
					metaImageId: payload.metaImageId,
					translation: {
						locale: payload.locale,
						slug: payload.slug,
						title: payload.title,
						content: payload.content,
						metaTitle: payload.metaTitle,
						metaDescription: payload.metaDescription,
					},
					userId: context.auth.getUserOrFail().id,
				}),
			transform: (entity) => PageTransformer.transform(entity),
		},
		update: {
			prepare: async (context) => {
				const { id } = await showPageValidator.validate(context.params);

				return { id };
			},
			validator: () => updatePageValidator,
			execute: (context, prepared, payload) =>
				this.updatePageAction.execute({
					pageId: prepared.id,
					locale: payload.locale,
					slug: payload.slug,
					title: payload.title,
					content: payload.content,
					metaTitle: payload.metaTitle,
					metaDescription: payload.metaDescription,
					metaImageId: payload.metaImageId,
					userId: context.auth.getUserOrFail().id,
				}),
			refetch: (_context, prepared) => this.getPageDetailAction.execute({ id: prepared.id }),
			transform: (entity) => PageTransformer.transform(entity),
		},
		publish: {
			prepare: async (context) => {
				const { id } = await showPageValidator.validate(context.params);

				return { id };
			},
			validator: () => publishPageValidator,
			execute: (context, prepared, payload) =>
				this.changePageStatusAction.execute({
					pageId: prepared.id,
					locale: payload.locale,
					status: 'published',
					userId: context.auth.getUserOrFail().id,
				}),
			refetch: (_context, prepared) => this.getPageDetailAction.execute({ id: prepared.id }),
			transform: (entity) => PageTransformer.transform(entity),
		},
		unpublish: {
			prepare: async (context) => {
				const { id } = await showPageValidator.validate(context.params);

				return { id };
			},
			validator: () => publishPageValidator,
			execute: (context, prepared, payload) =>
				this.changePageStatusAction.execute({
					pageId: prepared.id,
					locale: payload.locale,
					status: 'draft',
					userId: context.auth.getUserOrFail().id,
				}),
			refetch: (_context, prepared) => this.getPageDetailAction.execute({ id: prepared.id }),
			transform: (entity) => PageTransformer.transform(entity),
		},
		setHomepage: {
			prepare: async (context) => {
				const { id } = await showPageValidator.validate(context.params);

				return { id };
			},
			execute: (context, prepared) =>
				this.setHomepageAction.execute({
					pageId: prepared.id,
					userId: context.auth.getUserOrFail().id,
				}),
			refetch: (_context, prepared) => this.getPageDetailAction.execute({ id: prepared.id }),
			transform: (entity) => PageTransformer.transform(entity),
		},
		destroy: {
			status: 204,
			input: (context) => context.params,
			validator: () => showPageValidator,
			execute: (_context, _prepared, payload) => this.deletePageAction.execute({ id: payload.id }),
		},
		storeTranslation: {
			status: 201,
			prepare: async (context) => {
				const { id } = await showPageValidator.validate(context.params);

				return { id };
			},
			validator: () => createTranslationValidator,
			execute: (_context, prepared, payload) =>
				this.createTranslationAction.execute({
					pageId: prepared.id,
					locale: payload.locale,
					slug: payload.slug,
					title: payload.title,
				}),
			refetch: (_context, prepared) => this.getPageDetailAction.execute({ id: prepared.id }),
			transform: (entity) => PageTransformer.transform(entity),
		},
		listRevisions: {
			paginated: true,
			execute: (context) =>
				this.listRevisionsAction.execute({
					pageId: Number(context.params.id),
					pagination: context.pagination!,
				}),
			transform: (entity) => PageRevisionTransformer.paginate(entity.all(), entity.getMeta()),
		},
		restoreRevision: {
			prepare: async (context) => ({
				translationId: Number(context.params.translationId),
				revisionId: Number(context.params.revisionId),
			}),
			execute: (context, prepared) =>
				this.restoreRevisionAction.execute({
					translationId: prepared.translationId,
					revisionId: prepared.revisionId,
					userId: context.auth.getUserOrFail().id,
				}),
			transform: () => ({ restored: true }),
		},
		toggleRevision: {
			prepare: async (context) => ({ revisionId: Number(context.params.revisionId) }),
			execute: (_context, prepared) => this.toggleRevisionKeepAction.execute({ revisionId: prepared.revisionId }),
			transform: (entity) => ({ pinned: entity }),
		},
	};
}
