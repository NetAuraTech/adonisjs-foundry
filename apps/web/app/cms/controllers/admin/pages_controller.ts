import { inject } from '@adonisjs/core';
import { DeletePageAction } from '#cms/actions/page/delete_page_action';
import { ListPagesAction } from '#cms/actions/page/list_pages_action';
import { SetHomepageAction } from '#cms/actions/page/set_homepage_action';
import { buildPagesIndexPayload } from '#transport/cms/helpers/i18n_payloads/pages_index';
import PageTransformer from '#transport/cms/transformers/page_transformer';
import { listPageValidator, showPageValidator } from '#transport/cms/validators/page';
import { extractPagination } from '#transport/core/helpers/extract_pagination';
import { I18nService } from '#transport/core/helpers/i18n_service';
import { renderInertiaPage } from '#transport/core/helpers/inertia_render';
import { stripEmptyStrings } from '#transport/core/helpers/strip_empty_strings';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class PagesController {
	constructor(
		protected i18n: I18nService,
		protected listPagesAction: ListPagesAction,
		protected deletePageAction: DeletePageAction,
		protected setHomepageAction: SetHomepageAction,
	) {}

	async render(ctx: HttpContext) {
		const { inertia, request } = ctx;

		const pagination = await extractPagination(request);
		const data = stripEmptyStrings(request.all());
		const payload = await listPageValidator.validate(data);

		const pages = await this.listPagesAction.execute({
			status: payload.status,
			locale: payload.locale,
			search: payload.search,
			pagination,
		});

		return renderInertiaPage(inertia, 'cms/page/admin/index', {
			pages: PageTransformer.paginate(pages.all(), pages.getMeta()),
			filters: payload,
			translations: buildPagesIndexPayload(this.i18n),
		});
	}

	async destroy(ctx: HttpContext) {
		const { response, params, session } = ctx;

		const payload = await showPageValidator.validate(params);

		await this.deletePageAction.execute({ id: payload.id });

		session.flash('success', this.i18n.translate('cms.page.deleted'));

		return response.redirect().toRoute('admin.cms.pages.render');
	}

	async setHomepage(ctx: HttpContext) {
		const { params, response, auth } = ctx;
		const user = auth.getUserOrFail();
		await this.setHomepageAction.execute({ pageId: Number(params.id), userId: user.id });
		return response.redirect().toRoute('admin.cms.pages_show.render', { id: params.id });
	}
}
