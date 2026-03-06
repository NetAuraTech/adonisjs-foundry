/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  auth: {
    session: {
      render: typeof routes['auth.session.render']
      execute: typeof routes['auth.session.execute']
      destroy: typeof routes['auth.session.destroy']
    }
    register: {
      render: typeof routes['auth.register.render']
      execute: typeof routes['auth.register.execute']
    }
    forgotPassword: {
      render: typeof routes['auth.forgot_password.render']
      execute: typeof routes['auth.forgot_password.execute']
    }
    resetPassword: {
      render: typeof routes['auth.reset_password.render']
      execute: typeof routes['auth.reset_password.execute']
    }
    emailVerification: {
      execute: typeof routes['auth.email_verification.execute']
    }
    social: {
      render: typeof routes['auth.social.render']
      execute: typeof routes['auth.social.execute']
      redirect: typeof routes['auth.social.redirect']
      callback: typeof routes['auth.social.callback']
      unlink: typeof routes['auth.social.unlink']
    }
  }
}
