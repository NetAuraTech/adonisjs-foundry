import { test } from '@japa/runner';
import { ValueObject } from '#core/domain/value_object';

/** A minimal concrete value object for exercising the {@link ValueObject} base. */
class TestValueObject extends ValueObject<{ a: number; b: string }> {
	constructor(a: number, b: string) {
		super({ a, b });
	}
}

/**
 * Unit tests for the kernel {@link ValueObject} base — the shared base of
 * every domain value object.
 */
test.group('ValueObject', () => {
	test('copies the props into the instance', ({ assert }) => {
		const vo = new TestValueObject(1, 'x');
		const source = { a: 1, b: 'x' };
		source.a = 2;

		assert.deepEqual(vo.props, { a: 1, b: 'x' });
	});

	test('equals() is true for two value objects with the same props', ({ assert }) => {
		const a = new TestValueObject(1, 'x');
		const b = new TestValueObject(1, 'x');

		assert.isTrue(a.equals(b));
	});

	test('equals() is false for two value objects with different props', ({ assert }) => {
		const a = new TestValueObject(1, 'x');
		const b = new TestValueObject(2, 'x');

		assert.isFalse(a.equals(b));
	});

	test('equals() is false for null or undefined', ({ assert }) => {
		const a = new TestValueObject(1, 'x');

		assert.isFalse(a.equals(null as any));
		assert.isFalse(a.equals(undefined));
	});
});
