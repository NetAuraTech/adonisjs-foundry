import { BaseTransformer } from '@adonisjs/core/transformers'
import type Template from '#models/template/template'
import { StorageService } from '#services/file/storage_service'

export default class TemplateTransformer extends BaseTransformer<Template> {
  protected storageService: StorageService

  constructor(template: Template) {
    super(template)
    this.storageService = new StorageService()
  }

  async toObject() {
    const template = this.resource

    let thumbnail = null
    if (template.$preloaded && 'thumbnail' in template.$preloaded && template.thumbnail) {
      thumbnail = {
        id: template.thumbnail.id,
        url: await this.storageService.url(template.thumbnail.path, template.thumbnail.disk),
      }
    }

    return {
      ...this.pick(template, ['id', 'name', 'description', 'type', 'blockType', 'createdAt']),
      content: template.content,
      thumbnail,
    }
  }
}
