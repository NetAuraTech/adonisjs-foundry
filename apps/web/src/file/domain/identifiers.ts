/**
 * File-domain identifier types.
 *
 * Lucid models use numeric primary keys, so each identifier is a thin branded
 * wrapper around a number. They give the pure domain objects a distinct,
 * self-documenting identity type while remaining trivially convertible back to
 * the numeric key the persistence layer and transformers use (`.value`).
 */

export class FileIdentifier {
	private constructor(readonly value: number) {}

	static of(value: number): FileIdentifier {
		return new FileIdentifier(value);
	}

	toString(): string {
		return String(this.value);
	}

	equals(other: FileIdentifier): boolean {
		return this.value === other.value;
	}
}

export class FileFolderIdentifier {
	private constructor(readonly value: number) {}

	static of(value: number): FileFolderIdentifier {
		return new FileFolderIdentifier(value);
	}

	toString(): string {
		return String(this.value);
	}

	equals(other: FileFolderIdentifier): boolean {
		return this.value === other.value;
	}
}
