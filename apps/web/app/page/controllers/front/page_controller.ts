import { inject } from '@adonisjs/core';
import { FindHomepageAction } from '#cms/domain/actions/page/find_homepage_action';
import { FindPageBySlugAction } from '#cms/domain/actions/page/find_page_by_slug_action';
import { PageResolverService } from '#cms/domain/services/page/page_resolver_service';
import { ResolvedPageContent } from '#cms/types/page';
import { StorageService } from '#file/services/storage_service';
import { I18nService } from '#services/i18n_service';
import { CacheService } from '#shared/services/cache_service';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class PageController {
	constructor(
		protected i18n: I18nService,
		protected findHomepageAction: FindHomepageAction,
		protected findPageBySlugAction: FindPageBySlugAction,
		protected resolverService: PageResolverService,
		protected storageService: StorageService,
		protected cache: CacheService,
	) {}

	/**
	 * Renders the homepage — the page flagged as `is_homepage = true`.
	 * Called by `GET /`.
	 */
	async home(ctx: HttpContext) {
		const { inertia, request, response } = ctx;

		const locale: string = request.input('locale', this.i18n.getLocale());

		const page = await this.findHomepageAction.execute();

		if (!page) {
			return response.notFound();
		}

		const translation = page.translationFor(locale) ?? page.translationFor(page.defaultLocale);

		if (!translation || translation.status !== 'published') {
			return response.notFound();
		}

		const cacheKey = `page_render:home:${page.id}:${translation.locale}:${translation.updatedAt!.toMillis()}`;

		const resolvedContent = await this.cache.remember<ResolvedPageContent>(
			cacheKey,
			async () => {
				return await this.resolverService.resolve(translation.content, translation.locale);
			},
			3600,
		);

		let metaImageUrl: string | null = null;
		if (page.metaImage) {
			metaImageUrl = await this.storageService.url(page.metaImage.path, page.metaImage.disk);
		}

		return (inertia.render as any)('cms/page/front/show', {
			id: page.id,
			locale,
			title: translation.title,
			metaTitle: translation.metaTitle,
			metaDescription: translation.metaDescription,
			metaImage: metaImageUrl,
			content: resolvedContent,
		});
	}

	/**
	 * Renders a published page by its slug.
	 * The locale is resolved from the URL param, then the request locale,
	 * then the page's default locale — in that priority order.
	 * Returns 404 when the slug doesn't exist or the matching translation
	 * is not in `published` status.
	 */
	async render(ctx: HttpContext) {
		const { inertia, params, request, response } = ctx;

		const page = await this.findPageBySlugAction.execute({ slug: params.slug });

		if (!page) {
			return response.notFound();
		}

		const locale: string = params.locale ?? (request as any).locale ?? page.defaultLocale;
		const translation = page.translationFor(locale);

		if (!translation || translation.status !== 'published') {
			return response.notFound();
		}

		const cacheKey = `page_render:${page.id}:${locale}:${translation.updatedAt!.toMillis()}`;

		const resolvedContent = await this.cache.remember<ResolvedPageContent>(
			cacheKey,
			async () => {
				return await this.resolverService.resolve(translation.content, locale);
			},
			3600,
		);

		// Resolve the og:image if set on the page
		let metaImageUrl: string | null = null;
		if (page.metaImage) {
			metaImageUrl = await this.storageService.url(page.metaImage.path, page.metaImage.disk);
		}

		return (inertia.render as any)('cms/page/front/show', {
			id: page.id,
			locale,
			title: translation.title,
			metaTitle: translation.metaTitle,
			metaDescription: translation.metaDescription,
			metaImage: metaImageUrl,
			content: resolvedContent,
		});
	}
}
