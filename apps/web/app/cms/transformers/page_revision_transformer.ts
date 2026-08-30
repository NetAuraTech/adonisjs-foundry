import { BaseTransformer } from '@adonisjs/core/transformers';
import type PageRevision from '#cms/models/page/page_revision';
/**
 * Maps a CMS {@link PageRevision} model to the Inertia revisions payload.
 */
export default class PageRevisionTransformer extends BaseTransformer<PageRevision> {
	/**
	 * Build the revision payload.
	 *
	 * `created_by` is a minimal author reference and `null` when the
	 * revision has no author.
	 */
	toObject() {
		return {
			...this.pick(this.resource, ['id', 'keep', 'createdAt']),
			created_by: this.resource.author
				? {
						id: this.resource.author.id,
						username: this.resource.author.username,
					}
				: null,
		};
	}
}
