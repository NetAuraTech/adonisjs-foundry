/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  api: {
    v1: {
      account: {
        profile: {
          show: typeof routes['api.v1.account.profile.show']
          update: typeof routes['api.v1.account.profile.update']
        }
        account: {
          update: typeof routes['api.v1.account.account.update']
          destroy: typeof routes['api.v1.account.account.destroy']
        }
      }
      admin: {
        account: {
          preferences: {
            execute: typeof routes['api.v1.admin.account.preferences.execute']
          }
        }
        core: {
          dashboard: {
            index: typeof routes['api.v1.admin.core.dashboard.index']
          }
          maintenance: {
            index: typeof routes['api.v1.admin.core.maintenance.index']
            update: typeof routes['api.v1.admin.core.maintenance.update']
            toggle: typeof routes['api.v1.admin.core.maintenance.toggle']
          }
        }
        file: {
          files: {
            index: typeof routes['api.v1.admin.file.files.index']
            store: typeof routes['api.v1.admin.file.files.store']
            show: typeof routes['api.v1.admin.file.files.show']
            move: typeof routes['api.v1.admin.file.files.move']
            destroy: typeof routes['api.v1.admin.file.files.destroy']
            upsertAlt: typeof routes['api.v1.admin.file.files.upsert_alt']
            deleteAlt: typeof routes['api.v1.admin.file.files.delete_alt']
          }
          folders: {
            index: typeof routes['api.v1.admin.file.folders.index']
            store: typeof routes['api.v1.admin.file.folders.store']
            show: typeof routes['api.v1.admin.file.folders.show']
            children: typeof routes['api.v1.admin.file.folders.children']
            update: typeof routes['api.v1.admin.file.folders.update']
            destroy: typeof routes['api.v1.admin.file.folders.destroy']
          }
        }
        identity: {
          users: {
            index: typeof routes['api.v1.admin.identity.users.index']
            store: typeof routes['api.v1.admin.identity.users.store']
            show: typeof routes['api.v1.admin.identity.users.show']
            update: typeof routes['api.v1.admin.identity.users.update']
            destroy: typeof routes['api.v1.admin.identity.users.destroy']
          }
          roles: {
            index: typeof routes['api.v1.admin.identity.roles.index']
            store: typeof routes['api.v1.admin.identity.roles.store']
            show: typeof routes['api.v1.admin.identity.roles.show']
            update: typeof routes['api.v1.admin.identity.roles.update']
            destroy: typeof routes['api.v1.admin.identity.roles.destroy']
          }
          permissions: {
            index: typeof routes['api.v1.admin.identity.permissions.index']
          }
        }
        log: {
          logs: {
            index: typeof routes['api.v1.admin.log.logs.index']
          }
        }
      }
      auth: {
        login: {
          execute: typeof routes['api.v1.auth.login.execute']
        }
        register: {
          store: typeof routes['api.v1.auth.register.store']
        }
        forgotPassword: {
          store: typeof routes['api.v1.auth.forgot_password.store']
        }
        resetPassword: {
          store: typeof routes['api.v1.auth.reset_password.store']
        }
        emailVerification: {
          store: typeof routes['api.v1.auth.email_verification.store']
        }
        acceptInvitation: {
          store: typeof routes['api.v1.auth.accept_invitation.store']
        }
        logout: {
          destroy: typeof routes['api.v1.auth.logout.destroy']
        }
        me: {
          show: typeof routes['api.v1.auth.me.show']
        }
      }
    }
  }
  health: {
    liveness: typeof routes['health.liveness']
    readiness: typeof routes['health.readiness']
  }
  auth: {
    social: {
      redirect: typeof routes['auth.social.redirect']
      callback: typeof routes['auth.social.callback']
    }
  }
}
