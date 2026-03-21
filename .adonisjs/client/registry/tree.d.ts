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
    acceptInvitation: {
      render: typeof routes['auth.accept_invitation.render']
      execute: typeof routes['auth.accept_invitation.execute']
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
  settings: {
    profile: {
      render: typeof routes['settings.profile.render']
      execute: typeof routes['settings.profile.execute']
    }
    account: {
      render: typeof routes['settings.account.render']
      execute: typeof routes['settings.account.execute']
      destroy: typeof routes['settings.account.destroy']
    }
    emailChange: {
      render: typeof routes['settings.email_change.render']
      execute: typeof routes['settings.email_change.execute']
    }
    preferences: {
      render: typeof routes['settings.preferences.render']
      execute: typeof routes['settings.preferences.execute']
    }
    index: typeof routes['settings.index']
  }
  admin: {
    dashboard: {
      render: typeof routes['admin.dashboard.render']
    }
    users: {
      render: typeof routes['admin.users.render']
      destroy: typeof routes['admin.users.destroy']
    }
    usersCreate: {
      render: typeof routes['admin.users_create.render']
      execute: typeof routes['admin.users_create.execute']
    }
    usersShow: {
      render: typeof routes['admin.users_show.render']
    }
    usersUpdate: {
      render: typeof routes['admin.users_update.render']
      execute: typeof routes['admin.users_update.execute']
    }
  }
  theme: {
    execute: typeof routes['theme.execute']
  }
}
