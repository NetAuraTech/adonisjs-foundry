import { FileAlt } from '#file/domain/file_alt';
import { FileIdentifier } from '#file/domain/identifiers';

/**
 * Pure domain object for a file.
 *
 * Encapsulates the business rules of a file outside the persistence layer —
 * most importantly the alt-text resolution priority chain that both CMS image
 * blocks and manual front pages share, so alt resolution never drifts between
 * the two rendering paths. The Lucid `File` model is the persistence
 * representation; hydrate one from a model with {@link File.fromModel}.
 */
export class File {
	private constructor(
		readonly id: FileIdentifier,
		readonly filename: string,
		readonly mimeType: string,
		readonly extension: string,
		readonly size: number,
		readonly folderId: number | null,
		private readonly alts: readonly FileAlt[],
	) {}

	/**
	 * Hydrate a domain file from its Lucid model representation.
	 *
	 * @param model - The persisted file, with its `alts` relation loaded.
	 */
	static fromModel(model: {
		id: number;
		filename: string;
		mimeType: string;
		extension: string;
		size: number;
		folderId: number | null;
		alts?: { locale: string; key: string; value: string }[] | null;
	}): File {
		return new File(
			FileIdentifier.of(model.id),
			model.filename,
			model.mimeType,
			model.extension,
			model.size,
			model.folderId,
			(model.alts ?? []).map((alt) => FileAlt.fromModel(alt)),
		);
	}

	/** The alt entries carried by this file, in stored order. */
	getAlts(): readonly FileAlt[] {
		return this.alts;
	}

	/**
	 * Resolve the alt text for a display intent using the priority chain:
	 *
	 * 1. An entry keyed by `key` and matching `locale`
	 * 2. An entry keyed by `key` and matching `defaultLocale`
	 * 3. An entry keyed by `key` in any locale
	 * 4. The first alt entry, regardless of key
	 * 5. An inline `override`, when provided
	 * 6. The empty string
	 *
	 * @param locale - The requested locale.
	 * @param defaultLocale - The fallback locale (typically the app default).
	 * @param key - The alt key to resolve, or `null` to skip the keyed steps.
	 * @param override - An inline override that bypasses the keyed chain.
	 */
	resolveAlt(locale: string, defaultLocale: string, key: string | null, override?: string | null): string {
		if (key) {
			const keyedLocale = this.alts.find((alt) => alt.matches(locale, key));
			if (keyedLocale) {
				return keyedLocale.value;
			}

			const keyedDefault = this.alts.find((alt) => alt.matches(defaultLocale, key));
			if (keyedDefault) {
				return keyedDefault.value;
			}

			const keyedAny = this.alts.find((alt) => alt.matchesKey(key));
			if (keyedAny) {
				return keyedAny.value;
			}
		}

		const first = this.alts[0];
		if (first) {
			return first.value;
		}

		return override ?? '';
	}
}
