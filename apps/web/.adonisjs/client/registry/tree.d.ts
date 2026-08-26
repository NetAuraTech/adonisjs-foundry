/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  account: {
    profile: {
      render: typeof routes['account.profile.render']
      execute: typeof routes['account.profile.execute']
    }
    account: {
      render: typeof routes['account.account.render']
      execute: typeof routes['account.account.execute']
      destroy: typeof routes['account.account.destroy']
    }
    emailChange: {
      render: typeof routes['account.email_change.render']
      execute: typeof routes['account.email_change.execute']
    }
    preferences: {
      render: typeof routes['account.preferences.render']
      execute: typeof routes['account.preferences.execute']
    }
    index: typeof routes['account.index']
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
        filesApi: {
          index: typeof routes['api.v1.admin.files_api.index']
          move: typeof routes['api.v1.admin.files_api.move']
        }
        filesUploadApi: {
          store: typeof routes['api.v1.admin.files_upload_api.store']
        }
        filesShowApi: {
          show: typeof routes['api.v1.admin.files_show_api.show']
        }
        filesDeleteApi: {
          destroy: typeof routes['api.v1.admin.files_delete_api.destroy']
        }
        filesAltApi: {
          upsertAlt: typeof routes['api.v1.admin.files_alt_api.upsert_alt']
          deleteAlt: typeof routes['api.v1.admin.files_alt_api.delete_alt']
        }
        foldersApi: {
          index: typeof routes['api.v1.admin.folders_api.index']
          store: typeof routes['api.v1.admin.folders_api.store']
        }
        foldersShowApi: {
          show: typeof routes['api.v1.admin.folders_show_api.show']
          children: typeof routes['api.v1.admin.folders_show_api.children']
        }
        foldersUpdateApi: {
          update: typeof routes['api.v1.admin.folders_update_api.update']
        }
        foldersDeleteApi: {
          destroy: typeof routes['api.v1.admin.folders_delete_api.destroy']
        }
        dashboardApi: {
          index: typeof routes['api.v1.admin.dashboard_api.index']
        }
        logsApi: {
          index: typeof routes['api.v1.admin.logs_api.index']
        }
        maintenanceApi: {
          index: typeof routes['api.v1.admin.maintenance_api.index']
          update: typeof routes['api.v1.admin.maintenance_api.update']
          toggle: typeof routes['api.v1.admin.maintenance_api.toggle']
        }
        pagesApi: {
          index: typeof routes['api.v1.admin.pages_api.index']
          setHomepage: typeof routes['api.v1.admin.pages_api.set_homepage']
        }
        pagesCreateApi: {
          store: typeof routes['api.v1.admin.pages_create_api.store']
        }
        pagesShowApi: {
          show: typeof routes['api.v1.admin.pages_show_api.show']
        }
        pagesUpdateApi: {
          update: typeof routes['api.v1.admin.pages_update_api.update']
          publish: typeof routes['api.v1.admin.pages_update_api.publish']
          unpublish: typeof routes['api.v1.admin.pages_update_api.unpublish']
        }
        pagesDeleteApi: {
          destroy: typeof routes['api.v1.admin.pages_delete_api.destroy']
        }
        pageTranslationsApi: {
          store: typeof routes['api.v1.admin.page_translations_api.store']
        }
        pageRevisionsApi: {
          index: typeof routes['api.v1.admin.page_revisions_api.index']
          restore: typeof routes['api.v1.admin.page_revisions_api.restore']
          toggle: typeof routes['api.v1.admin.page_revisions_api.toggle']
        }
        pagesPreviewToken: {
          token: typeof routes['api.v1.admin.pages_preview_token.token']
        }
        templates: {
          index: typeof routes['api.v1.admin.templates.index']
          store: typeof routes['api.v1.admin.templates.store']
          update: typeof routes['api.v1.admin.templates.update']
          destroy: typeof routes['api.v1.admin.templates.destroy']
          createFromPage: typeof routes['api.v1.admin.templates.create_from_page']
        }
        templatesPreviewToken: {
          token: typeof routes['api.v1.admin.templates_preview_token.token']
        }
        builderOperations: {
          execute: typeof routes['api.v1.admin.builder_operations.execute']
          presence: typeof routes['api.v1.admin.builder_operations.presence']
          saveDraft: typeof routes['api.v1.admin.builder_operations.save_draft']
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
  admin: {
    identity: {
      users: {
        render: typeof routes['admin.identity.users.render']
        destroy: typeof routes['admin.identity.users.destroy']
      }
      usersCreate: {
        render: typeof routes['admin.identity.users_create.render']
        execute: typeof routes['admin.identity.users_create.execute']
      }
      usersShow: {
        render: typeof routes['admin.identity.users_show.render']
      }
      usersUpdate: {
        render: typeof routes['admin.identity.users_update.render']
        execute: typeof routes['admin.identity.users_update.execute']
      }
      roles: {
        render: typeof routes['admin.identity.roles.render']
        destroy: typeof routes['admin.identity.roles.destroy']
      }
      rolesCreate: {
        render: typeof routes['admin.identity.roles_create.render']
        execute: typeof routes['admin.identity.roles_create.execute']
      }
      rolesShow: {
        render: typeof routes['admin.identity.roles_show.render']
      }
      rolesUpdate: {
        render: typeof routes['admin.identity.roles_update.render']
        execute: typeof routes['admin.identity.roles_update.execute']
      }
      permissions: {
        render: typeof routes['admin.identity.permissions.render']
        destroy: typeof routes['admin.identity.permissions.destroy']
      }
      permissionsCreate: {
        render: typeof routes['admin.identity.permissions_create.render']
        execute: typeof routes['admin.identity.permissions_create.execute']
      }
      permissionsUpdate: {
        render: typeof routes['admin.identity.permissions_update.render']
        execute: typeof routes['admin.identity.permissions_update.execute']
      }
    }
    dashboard: {
      render: typeof routes['admin.dashboard.render']
    }
    files: {
      render: typeof routes['admin.files.render']
      upload: typeof routes['admin.files.upload']
      move: typeof routes['admin.files.move']
      destroy: typeof routes['admin.files.destroy']
      upsertAlt: typeof routes['admin.files.upsert_alt']
      deleteAlt: typeof routes['admin.files.delete_alt']
    }
    fileFolders: {
      render: typeof routes['admin.file_folders.render']
      execute: typeof routes['admin.file_folders.execute']
      update: typeof routes['admin.file_folders.update']
      destroy: typeof routes['admin.file_folders.destroy']
    }
    settings: {
      maintenance: {
        render: typeof routes['admin.settings.maintenance.render']
        update: typeof routes['admin.settings.maintenance.update']
        toggle: typeof routes['admin.settings.maintenance.toggle']
      }
    }
    logs: {
      render: typeof routes['admin.logs.render']
    }
    pages: {
      render: typeof routes['admin.pages.render']
      setHomepage: typeof routes['admin.pages.set_homepage']
      destroy: typeof routes['admin.pages.destroy']
    }
    pagesCreate: {
      render: typeof routes['admin.pages_create.render']
      execute: typeof routes['admin.pages_create.execute']
    }
    pagesShow: {
      render: typeof routes['admin.pages_show.render']
    }
    pagesUpdate: {
      render: typeof routes['admin.pages_update.render']
      execute: typeof routes['admin.pages_update.execute']
      publish: typeof routes['admin.pages_update.publish']
      unpublish: typeof routes['admin.pages_update.unpublish']
    }
    pageTranslations: {
      execute: typeof routes['admin.page_translations.execute']
    }
    pageRevisions: {
      index: typeof routes['admin.page_revisions.index']
      restore: typeof routes['admin.page_revisions.restore']
      toggleKeep: typeof routes['admin.page_revisions.toggle_keep']
    }
    pagesPreview: {
      render: typeof routes['admin.pages_preview.render']
    }
    templates: {
      render: typeof routes['admin.templates.render']
      execute: typeof routes['admin.templates.execute']
      applyToPage: typeof routes['admin.templates.apply_to_page']
      update: typeof routes['admin.templates.update']
      destroy: typeof routes['admin.templates.destroy']
      edit: typeof routes['admin.templates.edit']
    }
    templatesPreview: {
      render: typeof routes['admin.templates_preview.render']
    }
  }
  eventStream: typeof routes['event_stream']
  subscribe: typeof routes['subscribe']
  unsubscribe: typeof routes['unsubscribe']
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
  health: {
    liveness: typeof routes['health.liveness']
    readiness: typeof routes['health.readiness']
  }
  sitemap: {
    show: typeof routes['sitemap.show']
  }
  robots: {
    show: typeof routes['robots.show']
  }
  contact: {
    execute: typeof routes['contact.execute']
  }
  page: {
    home: typeof routes['page.home']
    localised: {
      render: typeof routes['page.localised.render']
    }
    render: typeof routes['page.render']
  }
}
