import { inject } from '@adonisjs/core';
import { buildPagesShowPayload } from '#app/cms/helpers/i18n_payloads/pages_show';
import PageTransformer from '#app/cms/transformers/page_transformer';
import { showPageValidator } from '#app/cms/validators/page';
import { GetPageDetailAction } from '#cms/actions/page/get_page_detail_action';
import { I18nService } from '#services/i18n_service';
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
