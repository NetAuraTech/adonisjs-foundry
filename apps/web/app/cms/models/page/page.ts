import { belongsTo, hasMany, scope } from '@adonisjs/lucid/orm';
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import PageTranslation from '#cms/models/page/page_translation';
import { PageSchema } from '#database/schema';
import User from '#identity/models/user';
import File from '#models/file/file';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';

export default class Page extends PageSchema {
	@hasMany(() => PageTranslation, { foreignKey: 'pageId' })
	declare translations: HasMany<typeof PageTranslation>;

	@belongsTo(() => File, { foreignKey: 'metaImageId' })
	declare metaImage: BelongsTo<typeof File>;

	@belongsTo(() => User, { foreignKey: 'createdBy' })
	declare author: BelongsTo<typeof User>;

	// ─── Scopes ───────────────────────────────────────────────────────────────

	/**
	 * Filters pages that have at least one published translation.
	 */
	public static published = scope((query: ModelQueryBuilderContract<typeof Page>) => {
		query.whereHas('translations', (t) => {
			t.where('status', 'published');
		});
	});

	/**
	 * Returns the translation for a given locale, falling back to the
	 * default locale if the requested locale is not available.
	 */
	translationFor(locale: string): PageTranslation | undefined {
		return (
			this.translations?.find((t) => t.locale === locale) ??
			this.translations?.find((t) => t.locale === this.defaultLocale)
		);
	}
}
