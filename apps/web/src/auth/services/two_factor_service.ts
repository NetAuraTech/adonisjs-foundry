import { inject } from '@adonisjs/core';
import { Totp } from '#auth/domain/totp';
import { createTwoFactorCipher } from '#auth/domain/two_factor_cipher';
import InvalidTwoFactorCodeException from '#auth/exceptions/invalid_two_factor_code_exception';
import { UserRepository } from '#identity/repositories/user_repository';
import { LogService } from '#log/services/log_service';
import env from '#start/env';
import type User from '#identity/models/user';

/**
 * Business logic for TOTP-based two-factor authentication.
 *
 * Owns the secret's lifecycle: generating a fresh secret for enrollment,
 * persisting it **encrypted at rest**, and verifying codes at both
 * enrollment-confirmation and login time. The plaintext secret is only ever
 * held in-memory (or in the caller's transient session) — it is never written
 * to the database.
 */
@inject()
export class TwoFactorService {
	/**
	 * AES-256-GCM cipher keyed on the application key. Constructed once per
	 * instance; the key is stable for the process lifetime.
	 */
	private readonly cipher = createTwoFactorCipher(env.get('APP_KEY').release());

	constructor(
		protected userRepository: UserRepository,
		protected logService: LogService,
	) {}

	/**
	 * Begins an enrollment: generates a fresh secret and its `otpauth://`
	 * provisioning URI.
	 *
	 * Nothing is persisted — the caller is responsible for holding the
	 * plaintext secret (typically the server-side session) until the user
	 * confirms it with a valid code via {@link confirmEnrollment}.
	 *
	 * @param user - The user enrolling.
	 * @returns The plaintext base32 secret and its provisioning URI.
	 */
	beginEnrollment(user: User): { secret: string; otpauthUri: string } {
		const secret = Totp.generateSecret();
		const otpauthUri = Totp.otpauthUri(secret, user.email, env.get('APP_NAME'));
		return { secret, otpauthUri };
	}

	/**
	 * Confirms an enrollment: verifies the code against the pending secret,
	 * then stores the encrypted secret and enables 2FA for the user.
	 *
	 * @param user - The user enrolling.
	 * @param code - The 6-digit code the user entered from their authenticator.
	 * @param pendingSecret - The plaintext secret from {@link beginEnrollment}.
	 * @returns The updated {@link User} with 2FA enabled.
	 * @throws {InvalidTwoFactorCodeException} If the code does not match.
	 */
	async confirmEnrollment(user: User, code: string, pendingSecret: string): Promise<User> {
		if (!Totp.verify(pendingSecret, code)) {
			this.logService.logSecurity('two_factor.enrollment_failed', {
				userId: user.id,
				userEmail: user.email,
			});
			throw new InvalidTwoFactorCodeException();
		}

		const updated = await this.userRepository.update(user, {
			twoFactorSecret: this.cipher.encrypt(pendingSecret),
			twoFactorEnabled: true,
		});

		this.logService.logAuth('two_factor.enrolled', {
			userId: updated.id,
			userEmail: updated.email,
		});

		return updated;
	}

	/**
	 * Verifies a login code for a user who has 2FA enabled.
	 *
	 * Decrypts the stored secret and checks the code against it (with the
	 * standard time window). On any failure it records a security event and
	 * throws.
	 *
	 * @param user - The user attempting to log in (2FA must be enabled).
	 * @param code - The 6-digit code entered at the login challenge.
	 * @returns The {@link User} if the code is valid.
	 * @throws {InvalidTwoFactorCodeException} If the code is invalid or the
	 *   stored secret cannot be read.
	 */
	async verifyLoginCode(user: User, code: string): Promise<User> {
		if (!user.twoFactorSecret) {
			throw new InvalidTwoFactorCodeException();
		}

		let secret: string;
		try {
			secret = this.cipher.decrypt(user.twoFactorSecret);
		} catch {
			this.logService.logSecurity('two_factor.login.failed_decrypt', {
				userId: user.id,
				userEmail: user.email,
			});
			throw new InvalidTwoFactorCodeException();
		}

		if (!Totp.verify(secret, code)) {
			this.logService.logSecurity('two_factor.login.failed', {
				userId: user.id,
				userEmail: user.email,
			});
			throw new InvalidTwoFactorCodeException();
		}

		return user;
	}
}
