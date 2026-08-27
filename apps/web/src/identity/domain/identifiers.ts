/**
 * Identity-domain identifier types.
 *
 * Lucid models use numeric primary keys, so each identifier is a thin branded
 * wrapper around a number. They give the pure domain objects a distinct,
 * self-documenting identity type while remaining trivially convertible back to
 * the numeric key the persistence layer and transformers use (`.value`).
 */

export class UserIdentifier {
	private constructor(readonly value: number) {}

	static of(value: number): UserIdentifier {
		return new UserIdentifier(value);
	}

	toString(): string {
		return String(this.value);
	}

	equals(other: UserIdentifier): boolean {
		return this.value === other.value;
	}
}

export class RoleIdentifier {
	private constructor(readonly value: number) {}

	static of(value: number): RoleIdentifier {
		return new RoleIdentifier(value);
	}

	toString(): string {
		return String(this.value);
	}

	equals(other: RoleIdentifier): boolean {
		return this.value === other.value;
	}
}

export class PermissionIdentifier {
	private constructor(readonly value: number) {}

	static of(value: number): PermissionIdentifier {
		return new PermissionIdentifier(value);
	}

	toString(): string {
		return String(this.value);
	}

	equals(other: PermissionIdentifier): boolean {
		return this.value === other.value;
	}
}
