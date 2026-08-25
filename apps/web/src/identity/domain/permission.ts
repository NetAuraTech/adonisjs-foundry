/**
 * Pure domain object for an identity {@link Permission}.
 *
 * Encapsulates the business invariants of a permission outside the
 * persistence layer. System permissions (seeded from the permission catalog)
 * are immutable; custom permissions may be modified and deleted. Hydrate one
 * from a model with {@link Permission.fromModel}.
 */
export class Permission {
	private constructor(
		readonly id: number,
		readonly slug: string,
		readonly category: string,
		readonly isSystem: boolean,
	) {}

	/**
	 * Hydrate a domain permission from its Lucid model representation.
	 *
	 * @param model - The persisted permission.
	 */
	static fromModel(model: { id: number; slug: string; category: string; isSystem: boolean }): Permission {
		return new Permission(model.id, model.slug, model.category, model.isSystem);
	}

	/** Whether this permission may be modified. System permissions are immutable. */
	canBeModified(): boolean {
		return !this.isSystem;
	}

	/** Whether this permission may be deleted. System permissions are undeletable. */
	canBeDeleted(): boolean {
		return !this.isSystem;
	}
}
