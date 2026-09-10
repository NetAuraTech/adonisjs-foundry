import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';
import { PageSearchService } from '#cms/services/page/page_search_service';
import {
	restorePageSearchDriver,
	restoreSearchEnabled,
	setSearchEnabled,
	swapPageSearchDriver,
	type FakePageSearchDriver,
} from '#tests/helpers/page_search';

/** Builds a plain translation-shaped object (the service only reads scalar fields). */
function makeTranslation(overrides: Record<string, any> = {}): any {
	return {
		id: 1,
		pageId: 10,
		locale: 'en',
		slug: 'my-slug',
		title: 'My Title',
		metaTitle: null,
		content: { blocks: [] },
		status: 'draft',
		publishedAt: null,
		...overrides,
	};
}

test.group('PageSearchService', (group) => {
	let service: PageSearchService;
	let fake: FakePageSearchDriver;

	group.each.setup(async () => {
		fake = swapPageSearchDriver();
		service = await app.container.make(PageSearchService);
	});
	group.each.teardown(() => {
		restorePageSearchDriver();
		restoreSearchEnabled();
	});

	test('indexTranslation() is a no-op when search is disabled', async ({ assert }) => {
		setSearchEnabled(false);

		await service.indexTranslation(makeTranslation());

		assert.equal(fake.upserted.length, 0);
	});

	test('indexTranslation() upserts a document when enabled', async ({ assert }) => {
		setSearchEnabled(true);

		await service.indexTranslation(
			makeTranslation({
				id: 42,
				pageId: 7,
				locale: 'fr',
				slug: 'accueil',
				title: 'Accueil',
				status: 'published',
				publishedAt: DateTime.fromMillis(1_700_000_000_000),
			}),
		);

		assert.equal(fake.upserted.length, 1);
		const doc = fake.upserted[0];
		assert.equal(doc.id, 42);
		assert.equal(doc.pageId, 7);
		assert.equal(doc.locale, 'fr');
		assert.equal(doc.slug, 'accueil');
		assert.equal(doc.status, 'published');
		assert.equal(doc.publishedAt, 1_700_000_000_000);
	});

	test('indexTranslation() swallows a driver failure', async ({ assert }) => {
		setSearchEnabled(true);
		fake.fail = true;

		await assert.doesNotReject(async () => {
			await service.indexTranslation(makeTranslation());
		});
	});

	test('removePage() calls the driver when enabled', async ({ assert }) => {
		setSearchEnabled(true);

		await service.removePage(10);

		assert.deepEqual(fake.removedPageIds, [10]);
	});

	test('removePage() is a no-op when disabled', async ({ assert }) => {
		setSearchEnabled(false);

		await service.removePage(10);

		assert.equal(fake.removedPageIds.length, 0);
	});

	test('search() returns the driver hits when enabled', async ({ assert }) => {
		setSearchEnabled(true);
		fake.searchImpl = async () => [
			{ translationId: 1, pageId: 10, locale: 'en', score: 5 },
			{ translationId: 2, pageId: 11, locale: 'fr', score: 3 },
		];

		const hits = await service.search('term');

		assert.isArray(hits);
		assert.equal(hits!.length, 2);
		assert.equal(hits![0].pageId, 10);
	});

	test('search() returns null when disabled', async ({ assert }) => {
		setSearchEnabled(false);

		const hits = await service.search('term');

		assert.isNull(hits);
	});

	test('search() degrades to null when the driver fails', async ({ assert }) => {
		setSearchEnabled(true);
		fake.fail = true;

		const hits = await service.search('term');

		assert.isNull(hits);
	});
});
