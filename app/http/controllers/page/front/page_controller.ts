import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { PageService } from '#services/page/page_service'
import { StorageService } from '#services/file/storage_service'
import { PageResolverService } from '#services/page/page_resolver_service'

@inject()
export default class PageController {
  constructor(
    protected pageService: PageService,
    protected resolverService: PageResolverService,
    protected storageService: StorageService
  ) {}

  /**
   * Renders a published page by its slug.
   * The locale is resolved from the URL param, then the request locale,
   * then the page's default locale — in that priority order.
   * Returns 404 when the slug doesn't exist or the matching translation
   * is not in `published` status.
   */
  async render(ctx: HttpContext) {
    const { params, request, inertia, response } = ctx

    const page = await this.pageService.findBySlug(params.slug)

    if (!page) {
      return response.notFound()
    }

    const locale: string = params.locale ?? (request as any).locale ?? page.defaultLocale
    const translation = page.translationFor(locale)

    if (!translation || translation.status !== 'published') {
      return response.notFound()
    }

    const resolvedContent = await this.resolverService.resolve(translation.content, locale)

    // Resolve the og:image if set on the page
    let metaImageUrl: string | null = null
    if (page.metaImage) {
      metaImageUrl = await this.storageService.url(page.metaImage.path, page.metaImage.disk)
    }

    return inertia.render('page/front/show', {
      id: page.id,
      locale,
      title: translation.title,
      metaTitle: translation.metaTitle,
      metaDescription: translation.metaDescription,
      metaImage: metaImageUrl,
      content: resolvedContent,
    })
  }
}
