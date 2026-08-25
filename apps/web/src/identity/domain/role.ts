import { RoleIdentifier } from '#identity/domain/identifiers';

/**
 * Pure domain object for an identity {@link Role}.
 *
 * Encapsulates the business invariants of a role outside the persistence
 * layer. The Lucid `Role` model is the persistence representation; this
 * object carries the rules that decide whether a role may be modified,
 * deleted, or grants a specific permission. Hydrate one from a model with
 * {@link Role.fromModel}.
 */
export class Role {
	private constructor(
		readonly id: RoleIdentifier,
		readonly slug: string,
		readonly isSystem: boolean,
		private readonly permissionSlugs: ReadonlySet<string>,
	) {}

	/**
	 * Hydrate a domain role from its Lucid model representation.
	 *
	 * @param model - The persisted role, with its `permissions` relation loaded.
	 */
	static fromModel(model: {
		id: number;
		slug: string;
		isSystem: boolean;
		permissions: { slug: string }[] | null | undefined;
	}): Role {
		return new Role(
			RoleIdentifier.of(model.id),
			model.slug,
			model.isSystem,
			new Set((model.permissions ?? []).map((permission) => permission.slug)),
		);
	}

	/**
	 * The administrator role slug. System roles are seeded under this slug and
	 * carry every permission.
	 */
	static readonly ADMIN_SLUG = 'admin';

	/** Whether this role is the administrator role. */
	isAdmin(): boolean {
		return this.slug === Role.ADMIN_SLUG;
	}

	/** Whether this role may be modified. System roles are immutable. */
	canBeModified(): boolean {
		return !this.isSystem;
	}

	/** Whether this role may be deleted. System roles are undeletable. */
	canBeDeleted(): boolean {
		return !this.isSystem;
	}

	/** Whether this role grants the given permission slug. */
	hasPermission(permissionSlug: string): boolean {
		return this.permissionSlugs.has(permissionSlug);
	}
}
