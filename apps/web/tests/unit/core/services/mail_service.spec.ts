import app from '@adonisjs/core/services/app';
import router from '@adonisjs/core/services/router';
import { test } from '@japa/runner';
import { MailService } from '#core/services/mail_service';
import env from '#start/env';
import { restoreMailClient, swapMailClient } from '#tests/helpers/mail';

const PROBE_DOMAIN = 'root';
const PROBE_PATTERN = '/probe/mail_link/:token';
const PROBE_NAME = 'probe.mail_link';

/**
 * Register a self-contained probe route on the router's committed route table
 * so `buildLink()` can resolve it.
 *
 * `buildLink()` resolves candidates through the runtime table (`router.has` +
 * the URL builder), but the unit env never starts the HTTP server, so routes
 * registered at module load time sit uncommitted in the router's staging area
 * and stay unresolvable. `router.toJSON()` returns a live reference to that
 * table, so pushing the probe straight in makes it resolvable regardless of
 * whether an earlier suite already committed — and, unlike a real domain
 * route, it is flavor-agnostic (the `api` flavor prunes the front `:token`
 * routes the production mail links point at).
 */
function registerProbeRoute(): void {
	const table = router.toJSON() as Record<string, Array<Record<string, unknown>>>;
	table[PROBE_DOMAIN] ??= [];
	table[PROBE_DOMAIN].push({
		domain: PROBE_DOMAIN,
		pattern: PROBE_PATTERN,
		name: PROBE_NAME,
		methods: ['GET', 'HEAD'],
		tokens: router.parsePattern(PROBE_PATTERN, {}),
		matchers: {},
		meta: {},
		handler: () => 'ok',
		middleware: [],
	});
}

test.group('MailService', () => {
	test('send() dispatches the payload and stamps the resolved locale into the template data', async ({ assert }) => {
		const mail = swapMailClient();
		const service = await app.container.make(MailService);

		await service.send(
			{ to: 'kernel@test.com', subject: 'Hello', template: 'emails/auth_email', data: { foo: 'bar' } },
			{ locale: 'fr' },
		);

		restoreMailClient();

		assert.equal(mail.sent.length, 1);
		assert.equal(mail.sent[0].to, 'kernel@test.com');
		assert.equal(mail.sent[0].subject, 'Hello');
		assert.equal(mail.sent[0].template, 'emails/auth_email');
		assert.deepEqual(mail.sent[0].data, { locale: 'fr', foo: 'bar' });
	});

	test('send() dispatches a payload without template data', async ({ assert }) => {
		const mail = swapMailClient();
		const service = await app.container.make(MailService);

		await service.send({ to: 'kernel@test.com', subject: 'Hello', template: 'emails/auth_email' }, { locale: 'en' });

		restoreMailClient();

		assert.equal(mail.sent.length, 1);
		assert.deepEqual(mail.sent[0].data, { locale: 'en' });
	});

	test('resolveLocale() falls back to the app default locale when the preference is unset', async ({ assert }) => {
		const service = await app.container.make(MailService);

		assert.equal(service.resolveLocale(), 'en');
		assert.equal(service.resolveLocale(''), 'en');
		assert.equal(service.resolveLocale('fr'), 'fr');
	});

	test('buildLink() returns an empty string when no candidate route is registered', async ({ assert }) => {
		const service = await app.container.make(MailService);

		assert.equal(service.buildLink(['probe.no_such_route'], 'selector.validator'), '');
	});

	test('buildLink() returns the absolute URL of the first registered candidate', async ({ assert }) => {
		registerProbeRoute();
		const service = await app.container.make(MailService);

		assert.equal(
			service.buildLink(['probe.no_such_route', PROBE_NAME], 'selector.validator'),
			`${env.get('APP_URL')}${PROBE_PATTERN.replace(':token', 'selector.validator')}`,
		);
	});
});
