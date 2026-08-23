import { test } from '@japa/runner';
import { classifyVideoUrl, isAllowedIframeUrl } from '#cms/domain/services/page/embed_policy';

/**
 * Unit tests for the embed policy — the pure seam that decides which remote
 * URLs the `video` and `iframe` blocks are allowed to render.
 *
 * No database or HTTP context required: both functions take their policy
 * (provider list / hostname allowlist) as an argument so tests control it
 * explicitly instead of relying on environment config.
 */
test.group('classifyVideoUrl', () => {
	const providers: Array<'youtube' | 'vimeo'> = ['youtube', 'vimeo'];

	// ─── YouTube ────────────────────────────────────────────────────────────

	test('classifies a youtube.com watch URL as a youtube embed', ({ assert }) => {
		const source = classifyVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', providers);
		assert.deepEqual(source, {
			kind: 'embed',
			provider: 'youtube',
			embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
		});
	});

	test('classifies a youtu.be short URL as a youtube embed', ({ assert }) => {
		const source = classifyVideoUrl('https://youtu.be/dQw4w9WgXcQ', providers);
		assert.deepEqual(source, {
			kind: 'embed',
			provider: 'youtube',
			embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
		});
	});

	test('classifies a youtube.com/embed URL as a youtube embed', ({ assert }) => {
		const source = classifyVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ', providers);
		assert.deepEqual(source, {
			kind: 'embed',
			provider: 'youtube',
			embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
		});
	});

	test('classifies a youtube.com/shorts URL as a youtube embed', ({ assert }) => {
		const source = classifyVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ', providers);
		assert.deepEqual(source, {
			kind: 'embed',
			provider: 'youtube',
			embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
		});
	});

	// ─── Vimeo ──────────────────────────────────────────────────────────────

	test('classifies a vimeo.com URL as a vimeo embed', ({ assert }) => {
		const source = classifyVideoUrl('https://vimeo.com/123456789', providers);
		assert.deepEqual(source, {
			kind: 'embed',
			provider: 'vimeo',
			embedUrl: 'https://player.vimeo.com/video/123456789',
		});
	});

	test('classifies a player.vimeo.com URL as a vimeo embed', ({ assert }) => {
		const source = classifyVideoUrl('https://player.vimeo.com/video/123456789', providers);
		assert.deepEqual(source, {
			kind: 'embed',
			provider: 'vimeo',
			embedUrl: 'https://player.vimeo.com/video/123456789',
		});
	});

	// ─── Direct files ─────────────────────────────────────────────────────────

	test('classifies an https .mp4 URL as a direct file', ({ assert }) => {
		const source = classifyVideoUrl('https://cdn.example.com/media/clip.mp4', providers);
		assert.deepEqual(source, { kind: 'file', url: 'https://cdn.example.com/media/clip.mp4' });
	});

	test('classifies a same-origin relative .webm path as a direct file', ({ assert }) => {
		const source = classifyVideoUrl('/uploads/clip.webm', providers);
		assert.deepEqual(source, { kind: 'file', url: '/uploads/clip.webm' });
	});

	// ─── Rejections ───────────────────────────────────────────────────────────

	test('rejects a youtube URL when youtube is not an enabled provider', ({ assert }) => {
		assert.isNull(classifyVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', ['vimeo']));
	});

	test('rejects an unknown video provider page URL', ({ assert }) => {
		assert.isNull(classifyVideoUrl('https://www.dailymotion.com/video/x8abcd', providers));
	});

	test('rejects an http (non-TLS) video page URL', ({ assert }) => {
		assert.isNull(classifyVideoUrl('http://www.youtube.com/watch?v=dQw4w9WgXcQ', providers));
	});

	test('rejects a youtube URL without a valid video id', ({ assert }) => {
		assert.isNull(classifyVideoUrl('https://www.youtube.com/watch?v=too-short', providers));
	});

	test('rejects a non-media https URL', ({ assert }) => {
		assert.isNull(classifyVideoUrl('https://example.com/some/page', providers));
	});

	test('rejects javascript: URLs', ({ assert }) => {
		assert.isNull(classifyVideoUrl('javascript:alert(1)', providers));
	});

	test('rejects malformed URLs', ({ assert }) => {
		assert.isNull(classifyVideoUrl('not a url at all', providers));
	});

	test('rejects empty input', ({ assert }) => {
		assert.isNull(classifyVideoUrl('', providers));
	});
});

test.group('isAllowedIframeUrl', () => {
	const allowlist = ['maps.google.com', 'open.spotify.com'];

	test('allows an https URL whose hostname is listed exactly', ({ assert }) => {
		assert.isTrue(isAllowedIframeUrl('https://maps.google.com/maps?q=paris&output=embed', allowlist));
	});

	test('allows an https URL on a subdomain of a listed hostname', ({ assert }) => {
		assert.isTrue(isAllowedIframeUrl('https://www.maps.google.com/embed', allowlist));
	});

	test('rejects an https URL whose hostname is not listed', ({ assert }) => {
		assert.isFalse(isAllowedIframeUrl('https://evil.example.com/payload', allowlist));
	});

	test('rejects lookalike hostnames that merely end with the same suffix', ({ assert }) => {
		assert.isFalse(isAllowedIframeUrl('https://fake-maps.google.com.evil.com/', allowlist));
		assert.isFalse(isAllowedIframeUrl('https://evilmaps.google.com/', allowlist));
	});

	test('rejects an http URL even on a listed hostname', ({ assert }) => {
		assert.isFalse(isAllowedIframeUrl('http://maps.google.com/maps', allowlist));
	});

	test('rejects javascript: URLs', ({ assert }) => {
		assert.isFalse(isAllowedIframeUrl('javascript:alert(1)', allowlist));
	});

	test('rejects malformed URLs', ({ assert }) => {
		assert.isFalse(isAllowedIframeUrl('not a url', allowlist));
	});

	test('rejects everything when the allowlist is empty', ({ assert }) => {
		assert.isFalse(isAllowedIframeUrl('https://maps.google.com/maps', []));
	});
});
