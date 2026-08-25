import app from '@adonisjs/core/services/app';
import emitter from '@adonisjs/core/services/emitter';
import { test } from '@japa/runner';
import { SendPasswordResetAction } from '#actions/password/send_password_reset_action';
import { events } from '#generated/events';
import User from '#identity/models/user';

test.group('SendPasswordResetAction', () => {
	test('execute() dispatches ForgotPassword event', async ({ assert }) => {
		const action = await app.container.make(SendPasswordResetAction);
		const user = await User.create({
			email: 'forgot@test.com',
			username: 'forgot',
			password: 'pwd',
		});

		const fakeEmitter = emitter.fake();
		await action.execute({ user });

		assert.isTrue(fakeEmitter.exists(events.auth.ForgotPassword));

		emitter.restore();
	});
});
