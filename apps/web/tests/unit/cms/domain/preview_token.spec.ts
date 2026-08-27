import { createHmac } from 'node:crypto';
import { test } from '@japa/runner';
import { PreviewTokenHelper } from '#cms/domain/preview_token';

test.group('PreviewTokenHelper', (group) => {
	let helper: PreviewTokenHelper;

	group.each.setup(() => {
		helper = new PreviewTokenHelper('test-secret-key');
	});

	// ─── generate() ──────────────────────────────────────────────────────

	test('produces a token with expires.signature format', ({ assert }) => {
		const token = helper.generate(1, 2, 'en');
		const parts = token.split('.');

		assert.lengthOf(parts, 2);
		assert.equal(Number.isNaN(Number(parts[0])), false);
		assert.isNotEmpty(parts[1]);
	});

	// ─── validate() ──────────────────────────────────────────────────────

	test('accepts a freshly generated token', ({ assert }) => {
		const token = helper.generate(1, 2, 'en');
		assert.isTrue(helper.validate(token, 1, 2, 'en'));
	});

	test('rejects a token with the wrong pageId', ({ assert }) => {
		const token = helper.generate(1, 2, 'en');
		assert.isFalse(helper.validate(token, 99, 2, 'en'));
	});

	test('rejects a token with the wrong userId', ({ assert }) => {
		const token = helper.generate(1, 2, 'en');
		assert.isFalse(helper.validate(token, 1, 99, 'en'));
	});

	test('rejects a token with the wrong locale', ({ assert }) => {
		const token = helper.generate(1, 2, 'en');
		assert.isFalse(helper.validate(token, 1, 2, 'fr'));
	});

	test('rejects a tampered signature', ({ assert }) => {
		const token = helper.generate(1, 2, 'en');
		const [expires] = token.split('.');
		const tampered = `${expires}.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`;
		assert.isFalse(helper.validate(tampered, 1, 2, 'en'));
	});

	test('rejects a malformed token without a dot', ({ assert }) => {
		assert.isFalse(helper.validate('notavalidtoken', 1, 2, 'en'));
	});

	test('rejects a token with an empty signature', ({ assert }) => {
		assert.isFalse(helper.validate('123456.', 1, 2, 'en'));
	});

	test('rejects a token with an empty expiry', ({ assert }) => {
		assert.isFalse(helper.validate('.abcdef', 1, 2, 'en'));
	});

	test('rejects an expired token', ({ assert }) => {
		const pastExpires = Math.floor(Date.now() / 1000) - 600; // 10 min ago
		const payload = `1:2:en:${pastExpires}`;
		const sig = createHmac('sha256', 'test-secret-key').update(payload).digest('hex');
		const expiredToken = `${pastExpires}.${sig}`;
		assert.isFalse(helper.validate(expiredToken, 1, 2, 'en'));
	});

	test('rejects a token signed with a different secret', ({ assert }) => {
		const otherHelper = new PreviewTokenHelper('different-secret');
		const token = otherHelper.generate(1, 2, 'en');
		assert.isFalse(helper.validate(token, 1, 2, 'en'));
	});
});
