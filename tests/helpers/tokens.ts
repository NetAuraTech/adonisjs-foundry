import app from '@adonisjs/core/services/app';
import hash from '@adonisjs/core/services/hash';
import { DateTime } from 'luxon';
import { generateSplitToken } from '#helpers/core/crypto';
import { TokenRepository } from '#repositories/core/token_repository';
import { type TokenType } from '#types/core';
import type User from '#models/auth/user';

/**
 * Creates a `selector.validator` token row for a user of the given type and
 * returns the full `selector.validator` token.
 *
 * The `expiresIn` (luxon duration object, e.g. `{ hours: 1 }`) controls whether
 * the token is live or already expired (e.g. `{ hours: -1 }`).
 */
export async function createSplitToken(
	user: User,
	type: TokenType,
	expiresIn: Record<string, number> = { hours: 1 },
): Promise<string> {
	const tokenRepo = await app.container.make(TokenRepository);
	const { selector, validator, token } = generateSplitToken();
	await tokenRepo.create({
		userId: user.id,
		type,
		selector,
		token: await hash.make(validator),
		expiresAt: DateTime.now().plus(expiresIn),
	});
	return token;
}
