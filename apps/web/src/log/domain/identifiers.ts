/**
 * Log-domain identifier types.
 *
 * Lucid models use numeric primary keys, so the identifier is a thin branded
 * wrapper around a number. It gives the pure domain objects a distinct,
 * self-documenting identity type while remaining trivially convertible back to
 * the numeric key the persistence layer and transformers use (`.value`).
 */
export class LogEntryIdentifier {
	private constructor(readonly value: number) {}

	static of(value: number): LogEntryIdentifier {
		return new LogEntryIdentifier(value);
	}

	toString(): string {
		return String(this.value);
	}

	equals(other: LogEntryIdentifier): boolean {
		return this.value === other.value;
	}
}
