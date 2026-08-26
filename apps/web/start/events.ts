import emitter from '@adonisjs/core/services/emitter';
import { events } from '#generated/events';
import { listeners } from '#generated/listeners';

emitter.on(events.page.ContactFormSubmitted, [listeners.page.SendContactFormEmail, 'handle']);
