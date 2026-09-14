import { inject } from '@adonisjs/core';
import hash from '@adonisjs/core/services/hash';
import { DateTime } from 'luxon';
import { Token } from '#auth/domain/token';
import { type FullToken, type TokenType } from '#auth/enums/token_type';
import InvalidTokenException from '#auth/exceptions/invalid_token_exception';
import MaxAttemptsExceededException from '#auth/exceptions/max_attempts_exceeded_exception';
import TokenModel from '#auth/models/token';
import { TokenRepository } from '#auth/repositories/token_repository';
import { LogService } from '#log/services/log_service';
import type User from '#identity/models/user';

/**
 * The single module for the Token lifecycle (selector/validator credentials).
 *
 * Sits on top of the pure-query {@link TokenRepository} and owns every token
 * policy: the issuance choreography (expire outstanding tokens → generate
 * the split token → hash the validator → persist), full verification with
 * attempt accounting and brute-force lockout, token → user resolution, and
 * the exclusive row lock that makes consuming flows atomic. Every token flow
 * — email verification, password reset, email change, pending invites —
 * issues, verifies, and resolves tokens exclusively through this module, so
 * each token invariant is enforced exactly once.
 *
 * Failure semantics: every operation throws the typed token exceptions —
 * {@link InvalidTokenException} for a malformed, unknown, expired, or
 * invalid token, {@link MaxAttemptsExceededException} for a locked token —
 * so callers never handle a `null` return. A locked token is a distinct,
 * client-relevant state (HTTP 429), never a plain "invalid token".
 */
@inject()
export class TokenService {
	/**
	 * Maximum verification attempts allowed for any token type before the
	 * token is locked against brute-force verification.
	 */
	readonly MAX_ATTEMPTS = 3;

	constructor(
		protected tokenRepository: TokenRepository,
		protected logService: LogService,
	) {}

	/**
	 * Issues a new token for a user: expires the user's outstanding tokens of
	 * the type, generates a fresh split token (`selector`, `validator`),
	 * hashes the validator, and persists the record.
	 *
	 * The single issuance path for every token type — the mail flows
	 * (verification, reset, invitation, email change) all delegate here
	 * instead of re-deriving the choreography.
	 *
	 * @param user - The token owner.
	 * @param type - The token type to issue.
	 * @param expiresInHours - Token lifetime in hours.
	 * @returns The raw `selector.validator` token to hand to the user.
	 *
	 * @example
	 * const token = await tokenService.issue(user, TOKEN_TYPES.PASSWORD_RESET, 1)
	 */
	async issue(user: User, type: TokenType, expiresInHours: number): Promise<FullToken> {
		await this.tokenRepository.expireTokensByType(user, type);

		const { selector, validator, token } = Token.generateSplit();
		const hashedValidator = await hash.make(validator);

		await this.tokenRepository.create({
			userId: user.id,
			type,
			selector,
			token: hashedValidator,
			attempts: 0,
			expiresAt: DateTime.now().plus({ hours: expiresInHours }),
		});

		return token;
	}

	/**
	 * Fully verifies a token: enforces the brute-force lockout, records one
	 * verification attempt, and validates the validator hash against the
	 * stored record.
	 *
	 * Every presentation consumes exactly one attempt against an existing
	 * record (valid, invalid, or expired alike); an unknown selector or a
	 * malformed token consumes nothing — there is no record to increment.
	 * Once the counter reaches {@link MAX_ATTEMPTS}, further presentations
	 * throw {@link MaxAttemptsExceededException} without incrementing.
	 *
	 * @param token - The raw `selector.validator` token.
	 * @param type - The expected token type.
	 * @throws {InvalidTokenException} When the token is malformed, unknown,
	 *   expired, or its validator does not match.
	 * @throws {MaxAttemptsExceededException} When the attempt counter has
	 *   reached or exceeded the maximum allowed attempts.
	 *
	 * @example
	 * await tokenService.verify(token, TOKEN_TYPES.PASSWORD_RESET)
	 */
	async verify(token: FullToken, type: TokenType): Promise<void> {
		const parts = Token.split(token);

		if (!parts) {
			this.logInvalid(token, type);
			throw new InvalidTokenException();
		}

		const outcome = await this.tokenRepository.checkAndIncrementAttempt(parts.selector, this.MAX_ATTEMPTS);

		if (outcome?.lockedOut) {
			throw new MaxAttemptsExceededException();
		}

		const record = await this.tokenRepository.findBySelector(parts.selector, type);

		if (!record || !(await hash.verify(record.token, parts.validator))) {
			this.logInvalid(token, type, record?.userId ?? undefined);
			throw new InvalidTokenException();
		}
	}

	/**
	 * Resolves a valid token to its associated {@link User}, with the user's
	 * role and permissions preloaded.
	 *
	 * Runs the full {@link verify} first, so the presentation consumes one
	 * attempt and a locked token throws the distinct 429 state.
	 *
	 * @param token - The raw `selector.validator` token.
	 * @param type - The expected token type.
	 * @returns The associated {@link User}.
	 * @throws {InvalidTokenException} When the token is malformed, unknown,
	 *   expired, invalid, or its user no longer exists.
	 * @throws {MaxAttemptsExceededException} When the attempt counter has
	 *   reached or exceeded the maximum allowed attempts.
	 *
	 * @example
	 * const user = await tokenService.resolveUser(token, TOKEN_TYPES.PASSWORD_RESET)
	 */
	async resolveUser(token: FullToken, type: TokenType): Promise<User> {
		const parts = Token.split(token);

		if (!parts) {
			this.logInvalid(token, type);
			throw new InvalidTokenException();
		}

		await this.verify(token, type);

		const user = await this.tokenRepository.findUserBySelector(parts.selector, type);

		if (!user) {
			this.logInvalid(token, type);
			throw new InvalidTokenException();
		}

		return user;
	}

	/**
	 * Re-acquires a token row with an exclusive lock and re-asserts that it is
	 * still usable, making the read and the act atomic.
	 *
	 * Must be the **first query** inside the transaction that acts on the
	 * token (see /docs/agents/toctou-protection.md): the exclusive
	 * `SELECT ... FOR UPDATE` serializes concurrent presentations of the same
	 * token, so by the time a second transaction reaches this query the first
	 * has already committed — and a consumed token is expired, so the re-check
	 * below rejects it.
	 *
	 * A rejected presentation is audited with `logSecurity` before the
	 * exception is thrown — a token consumed concurrently is a security
	 * signal, not an ordinary invalid-token case.
	 *
	 * @param token - The raw `selector.validator` token.
	 * @param type - The expected token type.
	 * @returns The locked token record, still valid and not expired.
	 * @throws {InvalidTokenException} If the token is malformed, missing, or
	 *   no longer valid (e.g. consumed by a concurrent presentation).
	 *
	 * @example
	 * await withTransaction(async () => {
	 *   await tokenService.lockUsableToken(token, TOKEN_TYPES.PASSWORD_RESET)
	 *   // safe to act on the token — no concurrent transaction can modify this row
	 * })
	 */
	async lockUsableToken(token: FullToken, type: TokenType): Promise<TokenModel> {
		const parts = Token.split(token);

		if (!parts) {
			throw new InvalidTokenException();
		}

		const record = await this.tokenRepository.lockBySelector(parts.selector, type);

		if (!record || record.isExpired) {
			this.logService.logSecurity('core.token.double_use_rejected', {
				userId: record?.userId ?? undefined,
				type,
				token: Token.mask(token),
			});

			throw new InvalidTokenException();
		}

		return record;
	}

	/**
	 * Records a failed token presentation in the audit trail with a masked
	 * token.
	 *
	 * @param token - The raw `selector.validator` token.
	 * @param type - The token type the presentation was made against.
	 * @param userId - The token owner, when the record was found.
	 */
	protected logInvalid(token: FullToken, type: TokenType, userId?: number) {
		this.logService.logAuth('core.token.invalid', {
			userId,
			type,
			token: Token.mask(token),
		});
	}
}
