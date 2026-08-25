import emitter from '@adonisjs/core/services/emitter';
import { events } from '#generated/events';
import { listeners } from '#generated/listeners';

emitter.on(events.account.InitiateEmailChange, [listeners.account.SendChangeEmailNotificationEmail, 'handle']);

emitter.on(events.account.InitiateEmailChange, [listeners.account.SendChangeEmailConfirmationEmail, 'handle']);

emitter.on(events.page.ContactFormSubmitted, [listeners.page.SendContactFormEmail, 'handle']);
