/*
|--------------------------------------------------------------------------
| Auth API routes
|--------------------------------------------------------------------------
|
| Versioned token API (`/api/v1/auth/*`) for non-browser clients. Self-
| registers on import (see `app/auth/routes.ts`), gated by the `adminApi`
| feature flag and the `api` access-token guard (session cookies are never
| consulted). Route names carry the `api.v1.auth` prefix.
|
*/

import vine from '@vinejs/vine';
import router from '@adonisjs/core/services/router';
import { enabledAuthGuards } from '#config/auth';
import features from '#config/features';
import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import { apiClientThrottle, throttle } from '#start/limiter';
import {
	loginValidator,
	registerValidator,
	forgotPasswordValidator,
	resetPasswordValidator,
} from '#transport/auth/validators/auth';
import { maintenanceMiddleware } from '#transport/core/maintenance';
import { registerApiDoc, type JsonSchema } from '#transport/core/openapi/api_docs_registry';
import { dateTime, errorSchema, validationErrorSchema, messageSchema, dataEnvelope } from '#transport/core/openapi/schemas';
import { email, password } from '#transport/core/validators/rules';

const userSchema: JsonSchema = {
	type: 'object',
	properties: {
		id: { type: 'number' },
		username: { type: 'string' },
		email: { type: 'string', format: 'email' },
		status: { type: 'string' },
		emailVerifiedAt: dateTime,
		createdAt: dateTime,
		updatedAt: dateTime,
		connectedProviders: {
			type: 'object',
			properties: {
				github: { type: 'boolean' },
				google: { type: 'boolean' },
				facebook: { type: 'boolean' },
			},
		},
		role: { type: 'object', nullable: true },
		permissions: { type: 'array', items: { type: 'string' } },
	},
};

const acceptInvitationBodyValidator = vine.create({
	token: vine.string(),
	email: email(),
	username: vine.string().trim().minLength(2).maxLength(255),
	password: password().confirmed({ confirmationField: 'password_confirmation' }),
});

if (features.adminApi && enabledAuthGuards.api) {
	registerApiDoc('api.v1.auth.login.execute', {
		summary: 'Log in',
		description: 'Verifies email/password credentials and issues an opaque API access token.',
		tags: ['Auth'],
		request: [{ validator: loginValidator, in: 'body' }],
		responses: {
			'200': {
				description: 'The issued access token (returned once, in clear text).',
				schema: dataEnvelope({
					type: 'object',
					properties: {
						token: { type: 'string' },
						expiresAt: dateTime,
					},
				}),
			},
			'401': { description: 'The credentials are invalid.', schema: errorSchema },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.auth.register.store', {
		summary: 'Register a new account',
		description: 'Creates the user and dispatches the email-verification flow.',
		tags: ['Auth'],
		request: [{ validator: registerValidator, in: 'body' }],
		responses: {
			'201': { description: 'The created user.', schema: dataEnvelope(userSchema) },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.auth.forgot_password.store', {
		summary: 'Request a password-reset email',
		description: 'Always succeeds (even for unknown emails) to avoid account enumeration.',
		tags: ['Auth'],
		request: [{ validator: forgotPasswordValidator, in: 'body' }],
		responses: {
			'200': { description: 'The reset email was requested.', schema: messageSchema },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.auth.reset_password.store', {
		summary: 'Reset the password with a token',
		tags: ['Auth'],
		request: [{ validator: resetPasswordValidator, in: 'body' }],
		responses: {
			'200': { description: 'The password was reset.', schema: messageSchema },
			'404': { description: 'The token is invalid or has expired.', schema: errorSchema },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.auth.email_verification.store', {
		summary: 'Verify the email address with a token',
		tags: ['Auth'],
		request: [{ validator: vine.create({ token: vine.string() }), in: 'path' }],
		responses: {
			'200': { description: 'The email address was verified.', schema: messageSchema },
			'404': { description: 'The token is invalid or has expired.', schema: errorSchema },
		},
	});
	registerApiDoc('api.v1.auth.accept_invitation.store', {
		summary: 'Accept an invitation and set a password',
		tags: ['Auth'],
		request: [{ validator: acceptInvitationBodyValidator, in: 'body' }],
		responses: {
			'200': { description: 'The accepted user.', schema: dataEnvelope(userSchema) },
			'404': { description: 'The invitation token is invalid or has expired.', schema: errorSchema },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.auth.logout.destroy', {
		summary: 'Log out',
		description: 'Revokes the access token presented on the request; other tokens keep working.',
		tags: ['Auth'],
		responses: {
			'204': { description: 'The token was revoked.' },
			'401': { description: 'No valid access token was presented.', schema: errorSchema },
		},
	});
	registerApiDoc('api.v1.auth.me.show', {
		summary: 'Show the authenticated user',
		tags: ['Auth'],
		responses: {
			'200': { description: 'The user authenticated by the bearer token.', schema: dataEnvelope(userSchema) },
			'401': { description: 'No valid access token was presented.', schema: errorSchema },
		},
	});

	router
		.group(() => {
			router
				.group(() => {
					// Same credential-stuffing budget as the session login.
					router.post('login', [controllers.auth.api.Login, 'execute']).use([throttle(5, 900)]);

					router.post('register', [controllers.auth.api.Register, 'store']).use([throttle(3, 3600)]);
					router.post('forgot-password', [controllers.auth.api.ForgotPassword, 'store']).use([throttle(3, 3600)]);
					// Token-consumption endpoints: same budgets as their front
					// (browser) counterparts, so a client cannot replay or
					// brute-force tokens faster through the API than the web.
					router.post('reset-password', [controllers.auth.api.ResetPassword, 'store']).use([throttle(3, 900)]);
					router.post('verify-email/:token', [controllers.auth.api.EmailVerification, 'store']).use([throttle(3, 900)]);
					router.post('accept-invitation', [controllers.auth.api.AcceptInvitation, 'store']).use([throttle(3, 900)]);

					router
						.group(() => {
							router.post('logout', [controllers.auth.api.Logout, 'destroy']);
							router.get('me', [controllers.auth.api.Me, 'show']);
						})
						.use([middleware.auth({ guards: ['api'] }), apiClientThrottle()]);
				})
				.prefix('auth')
				.as('auth')
				.use(maintenanceMiddleware);
		})
		.prefix('api/v1')
		.as('api.v1');
}
