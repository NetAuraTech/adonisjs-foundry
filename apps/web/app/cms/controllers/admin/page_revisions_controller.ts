import { inject } from '@adonisjs/core';
import { buildPageRevisionsPayload } from '#app/cms/helpers/i18n_payloads/page_revisions';
import PageRevisionTransformer from '#app/cms/transformers/page_revision_transformer';
import { revisionValidator } from '#app/cms/validators/page';
import { ListRevisionsAction } from '#cms/actions/page/list_revisions_action';
import { RestoreRevisionAction } from '#cms/actions/page/restore_revision_action';
import { ToggleRevisionKeepAction } from '#cms/actions/page/toggle_revision_keep_action';
import { extractPagination } from '#helpers/pagination/extract_pagination';
import { I18nService } from '#services/i18n_service';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class PageRevisionsController {
	constructor(
		protected i18n: I18nService,
		protected listRevisionsAction: ListRevisionsAction,
		protected restoreRevisionAction: RestoreRevisionAction,
		protected toggleRevisionKeepAction: ToggleRevisionKeepAction,
	) {}

	async index(ctx: HttpContext) {
		const { inertia, params, request } = ctx;

		const pagination = await extractPagination(request);
		const revisions = await this.listRevisionsAction.execute({
			pageId: Number(params.translationId),
			pagination,
		});

		return inertia.render('cms/page/admin/revisions', {
			revisions: PageRevisionTransformer.transform(revisions.all()),
			translation_id: params.translationId,
			page_id: params.id,
			translations: buildPageRevisionsPayload(this.i18n),
		});
	}

	async restore(ctx: HttpContext) {
		const { params, response, auth, session } = ctx;

		const payload = await revisionValidator.validate(params);
		const user = auth.getUserOrFail();

		await this.restoreRevisionAction.execute({
			translationId: payload.translationId,
			revisionId: payload.revisionId,
			userId: user.id,
		});

		session.flash('success', this.i18n.translate('cms.page.revision.restored'));

		return response.redirect().back();
	}

	async toggleKeep(ctx: HttpContext) {
		const { params, response, session } = ctx;

		const payload = await revisionValidator.validate(params);

		await this.toggleRevisionKeepAction.execute({ revisionId: payload.revisionId });

		session.flash('success', this.i18n.translate('cms.page.revision.keep_toggled'));

		return response.redirect().back();
	}
}
