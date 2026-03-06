import emitter from '@adonisjs/core/services/emitter'
import { events } from '#generated/events'
import { listeners } from '#generated/listeners'

emitter.on(events.auth.UserRegistered, [listeners.auth.SendVerificationEmail, 'handle'])

emitter.on(events.auth.ForgotPassword, [listeners.auth.SendForgotPasswordEmail, 'handle'])
