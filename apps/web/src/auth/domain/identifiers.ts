/**
 * Auth-domain identifier types.
 *
 * Lucid models use numeric primary keys, so each identifier is a thin branded
 * wrapper around a number. It gives the pure domain objects a distinct,
 * self-documenting identity type while remaining trivially convertible back
 * to the numeric key the persistence layer uses (`.value`).
 */

export class TokenIdentifier {
	private constructor(readonly value: number) {}

	static of(value: number): TokenIdentifier {
		return new TokenIdentifier(value);
	}

	toString(): string {
		return String(this.value);
	}

	equals(other: TokenIdentifier): boolean {
		return this.value === other.value;
	}
}
