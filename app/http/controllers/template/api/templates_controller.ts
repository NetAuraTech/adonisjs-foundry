import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import TemplatesResource from '#rest/templates'

/**
 * JSON API consumed by the page builder and admin Templates library.
 *
 * Thin transport adapters over the endpoints of the
 * {@link TemplatesResource}; the endpoint declarations are executed by the
 * shared REST pipeline.
 */
@inject()
export default class TemplatesApiController {
  constructor(protected templatesResource: TemplatesResource) {}

  async index(ctx: HttpContext): Promise<void> {
    await this.templatesResource.handle('index', ctx)
  }

  async store(ctx: HttpContext): Promise<void> {
    await this.templatesResource.handle('store', ctx)
  }

  async createFromPage(ctx: HttpContext): Promise<void> {
    await this.templatesResource.handle('createFromPage', ctx)
  }

  async update(ctx: HttpContext): Promise<void> {
    await this.templatesResource.handle('update', ctx)
  }

  async destroy(ctx: HttpContext): Promise<void> {
    await this.templatesResource.handle('destroy', ctx)
  }
}
