import { inject } from '@adonisjs/core';
import { GetPageDetailAction } from '#cms/domain/actions/page/get_page_detail_action';
import { showPageValidator } from '#cms/validators/page';
import { buildPagesShowPayload } from '#helpers/i18n_payloads/pages_show';
import { I18nService } from '#services/i18n_service';
import PageTransformer from '#app/page/transformers/page_transformer';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class PagesShowController {
	constructor(
		protected i18n: I18nService,
		protected getPageDetailAction: GetPageDetailAction,
	) {}

	async render(ctx: HttpContext) {
		const { inertia, params } = ctx;

		const { id } = await showPageValidator.validate(params);
		const page = await this.getPageDetailAction.execute({ id });

		return inertia.render('cms/page/admin/show', {
			page: PageTransformer.transform(page),
			translations: buildPagesShowPayload(this.i18n),
		});
	}
}
