import { randomBytes } from 'node:crypto';
import type { FullToken } from '#auth/enums/token_type';

/**
 * The two parts of a split token.
 *
 * The {@link TokenParts.selector} is stored in plain text in the database for
 * efficient lookup, while the {@link TokenParts.validator} is hashed so that a
 * database leak does not expose usable tokens.
 */
export interface TokenParts {
	selector: string;
	validator: string;
}

/**
 * A generated split token: the parts plus the full `selector.validator`
 * string that is handed to the user (mail link, response body).
 */
export interface GeneratedToken extends TokenParts {
	token: FullToken;
}

/**
 * Pure domain rules for the selector/validator token.
 *
 * Encapsulates token generation, parsing, and masking outside the
 * persistence layer, so the {@link TokenRepository} (persistence) and the
 * mail flows (presentation links) share one implementation.
 */
export const Token = {
	/**
	 * Generates a random hex token string.
	 *
	 * @param length - Length of the token in bytes (default 32, 64 hex chars).
	 * @returns The random hex string.
	 */
	generate(length: number = 32): string {
		return randomBytes(length).toString('hex');
	},

	/**
	 * Generates a selector/validator token pair.
	 *
	 * @param selectorLength - Selector length in bytes (default 32).
	 * @param validatorLength - Validator length in bytes (default 32).
	 * @returns The generated parts and the full `selector.validator` token.
	 *
	 * @example
	 * const { selector, validator, token } = Token.generateSplit()
	 * // selector: "abc123..." (stored in DB as-is)
	 * // validator: "def456..." (hashed before storage)
	 * // token: "abc123....def456..." (sent to the user)
	 */
	generateSplit(selectorLength: number = 32, validatorLength: number = 32): GeneratedToken {
		const selector = this.generate(selectorLength);
		const validator = this.generate(validatorLength);
		const token = `${selector}.${validator}` as FullToken;

		return { selector, validator, token };
	},

	/**
	 * Splits a full `selector.validator` string into its two components.
	 *
	 * @param token - The full token string.
	 * @returns The parts, or `null` when the format is invalid.
	 */
	split(token: FullToken): TokenParts | null {
		const parts = token.split('.');

		if (parts.length !== 2) {
			return null;
		}

		const [selector, validator] = parts;

		if (!selector || !validator) {
			return null;
		}

		return { selector, validator };
	},

	/**
	 * Masks a token for safe logging.
	 *
	 * Keeps the first 8 and last 4 characters and masks the rest, so logs
	 * never expose a usable token.
	 *
	 * @param token - The token (or selector) to mask.
	 * @returns The masked representation.
	 */
	mask(token: string): string {
		if (token.length <= 12) {
			return token;
		}

		const start = token.slice(0, 8);
		const end = token.slice(-4);
		const masked = '*'.repeat(Math.min(token.length - 12, 20));

		return `${start}${masked}${end}`;
	},
} as const;
