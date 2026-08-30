import { BaseTransformer } from '@adonisjs/core/transformers';
import { StorageService } from '#file/services/storage_service';
import type Template from '#cms/models/template/template';

/**
 * Maps a CMS {@link Template} model to the Inertia payload, resolving the
 * preloaded thumbnail through storage into a public URL.
 */
export default class TemplateTransformer extends BaseTransformer<Template> {
	protected storageService: StorageService;

	/**
	 * Create the transformer for a template model.
	 *
	 * @param template - The template to transform into the Inertia payload.
	 */
	constructor(template: Template) {
		super(template);
		this.storageService = new StorageService();
	}

	/**
	 * Build the template payload.
	 *
	 * `thumbnail` is `null` unless the relation was preloaded and present.
	 */
	async toObject() {
		const template = this.resource;

		let thumbnail = null;
		if (template.$preloaded && 'thumbnail' in template.$preloaded && template.thumbnail) {
			thumbnail = {
				id: template.thumbnail.id,
				url: await this.storageService.url(template.thumbnail.path, template.thumbnail.disk),
			};
		}

		return {
			...this.pick(template, ['id', 'name', 'description', 'type', 'blockType', 'createdAt']),
			content: template.content,
			thumbnail,
		};
	}
}
