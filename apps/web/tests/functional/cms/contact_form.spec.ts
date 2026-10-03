import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';
import limiter from '@adonisjs/limiter/services/main';
import { test } from '@japa/runner';
import edge from 'edge.js';
import { MailClientContract } from '#core/contracts/mail_client';
import { restoreMailClient, swapMailClient, type RecordingMailClient } from '#tests/helpers/mail';
import { resetSharedState } from '#tests/helpers/shared_state';

/**
 * Functional seam for the public contact form (`POST /contact`).
 *
 * The form delivers a notification mail per submission, which makes it a
 * spam relay when unbounded: the per-IP throttle (5 submissions per hour)
 * is the property under test. The first five submissions are processed
 * (302 back to the page), the sixth is a 429. The notification mail is
 * recorded in-memory so the suite never touches a transport.
 */
test.group('Contact form endpoint', (group) => {
	group.each.setup(() => testUtils.db().truncate());
	group.each.setup(resetSharedState);
	group.each.setup(() => limiter.clear());
	group.each.setup(() => {
		swapMailClient();
		return () => restoreMailClient();
	});
	group.each.teardown(() => limiter.clear());

	test('contact: the endpoint is throttled after exceeding the submission limit', async ({ client, assert }) => {
		const statuses: number[] = [];
		for (let i = 0; i < 6; i++) {
			const res = await client
				.post('/contact')
				.redirects(0)
				.withCsrfToken()
				.accept('json')
				.json({
					name: `Throttle ${i}`,
					email: `throttle-${i}@example.com`,
					message: `Spam attempt ${i}`,
				})
				.send();
			statuses.push(res.status());
		}

		assert.deepEqual(statuses, [302, 302, 302, 302, 302, 429]);
	});

	test('contact: the notification mail renders the submission content', async ({ client, assert }) => {
		const res = await client
			.post('/contact')
			.redirects(0)
			.withCsrfToken()
			.accept('json')
			.json({
				name: 'Jane Doe',
				email: 'jane@example.com',
				message: 'Hello from the regression test',
			})
			.send();
		assert.equal(res.status(), 302);

		const mailClient = (await app.container.make(MailClientContract)) as RecordingMailClient;
		assert.equal(mailClient.sent.length, 1);

		const html = await edge.render(mailClient.sent[0].template, mailClient.sent[0].data ?? {});
		assert.include(html, 'Jane Doe');
		assert.include(html, 'jane@example.com');
		assert.include(html, 'Hello from the regression test');
	});
});
