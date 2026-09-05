import { inject } from '@adonisjs/core';
import i18nManager from '@adonisjs/i18n/services/main';
import { MailClientContract, type MailClientMessage } from '#core/contracts/mail_client';
import { routePath } from '#core/services/route_path';
import env from '#start/env';

/**
 * Options of a shared mail dispatch.
 */
export interface MailDispatchOptions {
	/** Recipient locale, resolved by the domain flow from the user's preferences. */
	locale: string;
}

/**
 * The kernel mail service: the single dispatch home of every mail flow.
 *
 * Generic over the mail payload type {@link TPayload} (which must at least
 * carry the {@link MailClientMessage} envelope) so each flow can supply a
 * strongly-typed payload. Delivery is delegated to the injected
 * {@link MailClientContract}, which the application binds to a wrapper
 * around the framework mail driver.
 *
 * The service owns the shared dispatch — locale handling, link building and
 * sending. Per-domain mail services keep building their domain-specific
 * payload (i18n strings, token, template data) and go through this service;
 * the kernel never imports a domain, so the domain side resolves what the
 * dispatch needs (the recipient's locale) and hands it over.
 *
 * @example
 * const mailService = await app.container.make(MailService)
 * await mailService.send(
 *   { to: user.email, subject: 'Verify your email', template: 'emails/auth_email', data },
 *   { locale },
 * )
 */
@inject()
export class MailService<TPayload extends MailClientMessage = MailClientMessage> {
	constructor(protected mailClient: MailClientContract) {}

	/**
	 * Normalises the recipient's preferred locale, falling back to the app's
	 * default locale when it is unset.
	 *
	 * @param locale - The locale the domain flow resolved from the user's preferences.
	 * @returns The locale to render the mail in.
	 *
	 * @example
	 * const locale = mailService.resolveLocale(preferences.locale)
	 */
	resolveLocale(locale?: string): string {
		return locale || i18nManager.defaultLocale;
	}

	/**
	 * Compose and send a typed mail payload through the bound mail client.
	 *
	 * The resolved locale is stamped into the template data before delivery,
	 * so every mail template can read it (e.g. `<html lang="{{ locale }}">`)
	 * without the domain flow carrying it in the payload.
	 *
	 * @param payload - The typed mail envelope to dispatch.
	 * @param options - The dispatch options (the resolved recipient locale).
	 *
	 * @example
	 * await mailService.send(
	 *   { to: user.email, subject, template: 'emails/auth_email', data },
	 *   { locale },
	 * )
	 */
	async send(payload: TPayload, options: MailDispatchOptions): Promise<void> {
		await this.mailClient.send({
			...payload,
			data: { locale: options.locale, ...payload.data },
		});
	}

	/**
	 * Builds the mail link for the current flavor.
	 *
	 * The full flavor links to the session pages; the headless `api` flavor
	 * falls back to the token API endpoints. The first registered route wins.
	 *
	 * @param routeNames - Candidate route names, in priority order.
	 * @param token - The full `<selector>.<validator>` token carried by the link.
	 * @returns The absolute URL, or an empty string when no candidate is
	 *   registered.
	 *
	 * @example
	 * const link = mailService.buildLink(
	 *   ['auth.reset_password.render', 'api.v1.auth.reset_password.store'],
	 *   token,
	 * )
	 */
	buildLink(routeNames: string[], token: string): string {
		for (const name of routeNames) {
			const path = routePath(name, { token });
			if (path) return `${env.get('APP_URL')}${path}`;
		}
		return '';
	}
}
