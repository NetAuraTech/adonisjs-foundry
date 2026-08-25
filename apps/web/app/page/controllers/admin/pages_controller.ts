import { inject } from '@adonisjs/core';
import { DeletePageAction } from '#cms/domain/actions/page/delete_page_action';
import { ListPagesAction } from '#cms/domain/actions/page/list_pages_action';
import { SetHomepageAction } from '#cms/domain/actions/page/set_homepage_action';
import { listPageValidator, showPageValidator } from '#cms/validators/page';
import { stripEmptyStrings } from '#helpers/core/strip_empty_strings';
import { buildPagesIndexPayload } from '#helpers/i18n_payloads/pages_index';
import { extractPagination } from '#helpers/pagination/extract_pagination';
import { I18nService } from '#services/i18n_service';
import PageTransformer from '#app/page/transformers/page_transformer';
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

		return inertia.render('cms/page/admin/index', {
			pages: PageTransformer.paginate(pages.all(), pages.getMeta()),
			filters: payload,
			translations: buildPagesIndexPayload(this.i18n),
		});
	}

	async destroy(ctx: HttpContext) {
		const { response, params, session } = ctx;

		const payload = await showPageValidator.validate(params);

		await this.deletePageAction.execute({ id: payload.id });

		session.flash('success', this.i18n.translate('page.deleted'));

		return response.redirect().toRoute('admin.pages.render');
	}

	async setHomepage(ctx: HttpContext) {
		const { params, response, auth } = ctx;
		const user = auth.getUserOrFail();
		await this.setHomepageAction.execute({ pageId: Number(params.id), userId: user.id });
		return response.redirect().toRoute('admin.pages_show.render', { id: params.id });
	}
}
