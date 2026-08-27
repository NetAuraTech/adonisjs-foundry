import { inject } from '@adonisjs/core';
import router from '@adonisjs/core/services/router';
import { filterRoutes } from '#app/cms/helpers/filter_routes';
import { buildPageEditorPayload } from '#app/cms/helpers/i18n_payloads/page_editor';
import PageTransformer from '#app/cms/transformers/page_transformer';
import { showPageValidator, updatePageValidator, publishPageValidator } from '#app/cms/validators/page';
import { I18nService } from '#app/core/helpers/i18n_service';
import { ChangePageStatusAction } from '#cms/actions/page/change_page_status_action';
import { GetAvailablePagesForLinkAction } from '#cms/actions/page/get_available_pages_for_link_action';
import { GetPageDetailAction } from '#cms/actions/page/get_page_detail_action';
import { UpdatePageAction } from '#cms/actions/page/update_page_action';
import type { HttpContext } from '@adonisjs/core/http';

const SHARED_EXCLUSIONS = ['admin.', 'api.', 'auth.', 'pages.show', 'settings.'];

@inject()
export default class PagesUpdateController {
	constructor(
		protected i18n: I18nService,
		protected getPageDetailAction: GetPageDetailAction,
		protected updatePageAction: UpdatePageAction,
		protected changePageStatusAction: ChangePageStatusAction,
		protected getAvailablePagesForLinkAction: GetAvailablePagesForLinkAction,
	) {}

	async render(ctx: HttpContext) {
		const { inertia, params } = ctx;

		const allRoutes = router.toJSON().root;

		const availableRoutes = filterRoutes(allRoutes, 'GET', SHARED_EXCLUSIONS);

		const availablePostRoutes = filterRoutes(allRoutes, 'POST', [...SHARED_EXCLUSIONS, 'subscribe', 'unsubscribe']);

		const availablePages = await this.getAvailablePagesForLinkAction.execute();

		const { id } = await showPageValidator.validate(params);
		const page = await this.getPageDetailAction.execute({ id });

		return inertia.render('cms/page/admin/edit', {
			page: PageTransformer.transform(page),
			availableRoutes,
			availablePages,
			availablePostRoutes,
			translations: buildPageEditorPayload(this.i18n),
		});
	}

	async execute(ctx: HttpContext) {
		const { params, request, response, auth, session } = ctx;

		const { id } = await showPageValidator.validate(params);
		const payload = await updatePageValidator.validate(request.all());
		const user = auth.getUserOrFail();

		const { locale, ...data } = payload;

		await this.updatePageAction.execute({
			pageId: id,
			locale,
			slug: data.slug,
			title: data.title,
			content: data.content,
			metaTitle: data.metaTitle,
			metaDescription: data.metaDescription,
			metaImageId: data.metaImageId,
			userId: user.id,
		});

		session.flash('success', this.i18n.translate('cms.page.saved'));

		return response.redirect().back();
	}

	async publish(ctx: HttpContext) {
		const { params, request, response, session, auth } = ctx;

		const { id } = await showPageValidator.validate(params);
		const { locale } = await publishPageValidator.validate(request.all());

		await this.changePageStatusAction.execute({
			pageId: id,
			locale,
			status: 'published',
			userId: auth.user?.id,
		});

		session.flash('success', this.i18n.translate('cms.page.published'));

		return response.redirect().back();
	}

	async unpublish(ctx: HttpContext) {
		const { params, request, response, session, auth } = ctx;

		const { id } = await showPageValidator.validate(params);
		const { locale } = await publishPageValidator.validate(request.all());

		await this.changePageStatusAction.execute({
			pageId: id,
			locale,
			status: 'draft',
			userId: auth.user?.id,
		});

		session.flash('success', this.i18n.translate('cms.page.unpublished'));

		return response.redirect().back();
	}
}
