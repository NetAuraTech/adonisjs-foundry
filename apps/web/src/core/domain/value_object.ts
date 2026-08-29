/**
 * Base class for all domain value objects.
 *
 * A value object is a pure domain object without an identity: two value
 * objects are interchangeable when their properties are equal. Subclasses
 * hand their properties to the base constructor and inherit `props` and the
 * value-based `equals`.
 */
export abstract class ValueObject<T extends Record<string, any>> {
	props: T;

	constructor(props: T) {
		this.props = {
			...props,
		};
	}

	equals(vo?: ValueObject<T>): boolean {
		if (vo === null || vo === undefined) {
			return false;
		}

		if (vo.props === undefined) {
			return false;
		}

		return JSON.stringify(this.props) === JSON.stringify(vo.props);
	}
}
