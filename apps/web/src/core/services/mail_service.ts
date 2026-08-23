import type { MailClientContract, MailClientMessage } from '#core/contracts/mail_client';

/**
 * Generic mail service.
 *
 * Parameterised over a mail payload type {@link TPayload} so each mail
 * use-case can supply a strongly-typed payload (it must at least carry the
 * {@link MailClientMessage} envelope). The service delegates delivery to the
 * injected {@link MailClientContract}, which the application binds to a
 * wrapper around the framework mail driver.
 *
 * @example
 * interface ResetPasswordPayload extends MailClientMessage {
 *   token: string
 * }
 *
 * const mail = new MailService<ResetPasswordPayload>(mailClient)
 * await mail.send({ to, subject, template: 'auth.reset_password', data: { token } })
 */
export class MailService<TPayload extends MailClientMessage> {
	#client: MailClientContract;

	constructor(client: MailClientContract) {
		this.#client = client;
	}

	/** Compose and send a mail from a typed payload. */
	send(payload: TPayload): Promise<void> {
		return this.#client.send(payload);
	}
}
