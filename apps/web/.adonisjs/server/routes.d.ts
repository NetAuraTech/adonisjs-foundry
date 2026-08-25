import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'admin.identity.users.render': { paramsTuple?: []; params?: {} }
    'admin.identity.users_create.render': { paramsTuple?: []; params?: {} }
    'admin.identity.users_create.execute': { paramsTuple?: []; params?: {} }
    'admin.identity.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.users_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.users_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.users_update.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.roles.render': { paramsTuple?: []; params?: {} }
    'admin.identity.roles_create.render': { paramsTuple?: []; params?: {} }
    'admin.identity.roles_create.execute': { paramsTuple?: []; params?: {} }
    'admin.identity.roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.roles_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.roles_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.roles_update.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.permissions.render': { paramsTuple?: []; params?: {} }
    'admin.identity.permissions_create.render': { paramsTuple?: []; params?: {} }
    'admin.identity.permissions_create.execute': { paramsTuple?: []; params?: {} }
    'admin.identity.permissions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.permissions_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.permissions_update.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.users.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.identity.users.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.identity.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.roles.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.identity.roles.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.identity.roles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.roles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.permissions.index': { paramsTuple?: []; params?: {} }
    'event_stream': { paramsTuple?: []; params?: {} }
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'health.liveness': { paramsTuple?: []; params?: {} }
    'health.readiness': { paramsTuple?: []; params?: {} }
    'sitemap.show': { paramsTuple?: []; params?: {} }
    'robots.show': { paramsTuple?: []; params?: {} }
    'auth.session.render': { paramsTuple?: []; params?: {} }
    'auth.session.execute': { paramsTuple?: []; params?: {} }
    'auth.register.render': { paramsTuple?: []; params?: {} }
    'auth.register.execute': { paramsTuple?: []; params?: {} }
    'auth.forgot_password.render': { paramsTuple?: []; params?: {} }
    'auth.forgot_password.execute': { paramsTuple?: []; params?: {} }
    'auth.reset_password.render': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.reset_password.execute': { paramsTuple?: []; params?: {} }
    'auth.accept_invitation.render': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.accept_invitation.execute': { paramsTuple?: []; params?: {} }
    'auth.session.destroy': { paramsTuple?: []; params?: {} }
    'auth.email_verification.execute': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.social.render': { paramsTuple?: []; params?: {} }
    'auth.social.execute': { paramsTuple?: []; params?: {} }
    'auth.social.redirect': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'auth.social.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'auth.social.unlink': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'settings.profile.render': { paramsTuple?: []; params?: {} }
    'settings.profile.execute': { paramsTuple?: []; params?: {} }
    'settings.account.render': { paramsTuple?: []; params?: {} }
    'settings.account.execute': { paramsTuple?: []; params?: {} }
    'settings.account.destroy': { paramsTuple?: []; params?: {} }
    'settings.email_change.render': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'settings.email_change.execute': { paramsTuple?: []; params?: {} }
    'settings.preferences.render': { paramsTuple?: []; params?: {} }
    'settings.preferences.execute': { paramsTuple?: []; params?: {} }
    'settings.index': { paramsTuple?: []; params?: {} }
    'admin.dashboard.render': { paramsTuple?: []; params?: {} }
    'admin.files.render': { paramsTuple?: []; params?: {} }
    'admin.files.upload': { paramsTuple?: []; params?: {} }
    'admin.files.move': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.files.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.files.upsert_alt': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.files.delete_alt': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.file_folders.render': { paramsTuple?: []; params?: {} }
    'admin.file_folders.execute': { paramsTuple?: []; params?: {} }
    'admin.file_folders.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.file_folders.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.maintenance.render': { paramsTuple?: []; params?: {} }
    'admin.settings.maintenance.update': { paramsTuple?: []; params?: {} }
    'admin.settings.maintenance.toggle': { paramsTuple?: []; params?: {} }
    'admin.logs.render': { paramsTuple?: []; params?: {} }
    'api.v1.admin.files_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.files_upload_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.files_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.files_api.move': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.files_delete_api.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.files_alt_api.upsert_alt': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.files_alt_api.delete_alt': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.folders_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.folders_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.folders_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.folders_show_api.children': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.folders_update_api.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.folders_delete_api.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.theme.execute': { paramsTuple?: []; params?: {} }
    'api.v1.admin.dashboard_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.logs_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.maintenance_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.maintenance_api.update': { paramsTuple?: []; params?: {} }
    'api.v1.admin.maintenance_api.toggle': { paramsTuple?: []; params?: {} }
    'api.v1.admin.pages_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.pages_create_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.pages_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_update_api.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_delete_api.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_update_api.publish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_update_api.unpublish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_api.set_homepage': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.page_translations_api.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.page_revisions_api.index': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue} }
    'api.v1.admin.page_revisions_api.restore': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue,'revisionId': ParamValue} }
    'api.v1.admin.page_revisions_api.toggle': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue,'revisionId': ParamValue} }
    'api.v1.admin.pages_preview_token.token': { paramsTuple?: []; params?: {} }
    'api.v1.admin.templates.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.templates.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.templates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.templates.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.templates.create_from_page': { paramsTuple?: []; params?: {} }
    'api.v1.admin.templates_preview_token.token': { paramsTuple?: []; params?: {} }
    'api.v1.admin.builder_operations.execute': { paramsTuple?: []; params?: {} }
    'api.v1.admin.builder_operations.presence': { paramsTuple: [ParamValue]; params: {'translationId': ParamValue} }
    'api.v1.admin.builder_operations.save_draft': { paramsTuple: [ParamValue]; params: {'translationId': ParamValue} }
    'admin.pages.render': { paramsTuple?: []; params?: {} }
    'admin.pages_create.render': { paramsTuple?: []; params?: {} }
    'admin.pages_create.execute': { paramsTuple?: []; params?: {} }
    'admin.pages_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages_update.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages_update.publish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages_update.unpublish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages.set_homepage': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.page_translations.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.page_revisions.index': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue} }
    'admin.page_revisions.restore': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue,'revisionId': ParamValue} }
    'admin.page_revisions.toggle_keep': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue,'revisionId': ParamValue} }
    'admin.pages_preview.render': { paramsTuple: [ParamValue]; params: {'pageId': ParamValue} }
    'admin.templates.render': { paramsTuple?: []; params?: {} }
    'admin.templates.execute': { paramsTuple?: []; params?: {} }
    'admin.templates.apply_to_page': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates_preview.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'contact.execute': { paramsTuple?: []; params?: {} }
    'page.home': { paramsTuple?: []; params?: {} }
    'page.localised.render': { paramsTuple: [ParamValue,ParamValue]; params: {'locale': ParamValue,'slug': ParamValue} }
    'page.render': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'api.v1.auth.token.execute': { paramsTuple?: []; params?: {} }
    'api.v1.auth.register_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.forgot_password_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.reset_password_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.email_verification_api.store': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'api.v1.auth.accept_invitation_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.token.destroy': { paramsTuple?: []; params?: {} }
    'api.v1.auth.me.show': { paramsTuple?: []; params?: {} }
    'api.v1.profile.profile_api.show': { paramsTuple?: []; params?: {} }
    'api.v1.profile.profile_api.update': { paramsTuple?: []; params?: {} }
    'api.v1.account.account_api.update': { paramsTuple?: []; params?: {} }
    'api.v1.account.account_api.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'admin.identity.users.render': { paramsTuple?: []; params?: {} }
    'admin.identity.users_create.render': { paramsTuple?: []; params?: {} }
    'admin.identity.users_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.users_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.roles.render': { paramsTuple?: []; params?: {} }
    'admin.identity.roles_create.render': { paramsTuple?: []; params?: {} }
    'admin.identity.roles_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.roles_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.permissions.render': { paramsTuple?: []; params?: {} }
    'admin.identity.permissions_create.render': { paramsTuple?: []; params?: {} }
    'admin.identity.permissions_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.users.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.identity.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.roles.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.identity.roles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.permissions.index': { paramsTuple?: []; params?: {} }
    'event_stream': { paramsTuple?: []; params?: {} }
    'health.liveness': { paramsTuple?: []; params?: {} }
    'health.readiness': { paramsTuple?: []; params?: {} }
    'sitemap.show': { paramsTuple?: []; params?: {} }
    'robots.show': { paramsTuple?: []; params?: {} }
    'auth.session.render': { paramsTuple?: []; params?: {} }
    'auth.register.render': { paramsTuple?: []; params?: {} }
    'auth.forgot_password.render': { paramsTuple?: []; params?: {} }
    'auth.reset_password.render': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.accept_invitation.render': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.email_verification.execute': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.social.render': { paramsTuple?: []; params?: {} }
    'auth.social.redirect': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'auth.social.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'settings.profile.render': { paramsTuple?: []; params?: {} }
    'settings.account.render': { paramsTuple?: []; params?: {} }
    'settings.email_change.render': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'settings.preferences.render': { paramsTuple?: []; params?: {} }
    'settings.index': { paramsTuple?: []; params?: {} }
    'admin.dashboard.render': { paramsTuple?: []; params?: {} }
    'admin.files.render': { paramsTuple?: []; params?: {} }
    'admin.file_folders.render': { paramsTuple?: []; params?: {} }
    'admin.settings.maintenance.render': { paramsTuple?: []; params?: {} }
    'admin.logs.render': { paramsTuple?: []; params?: {} }
    'api.v1.admin.files_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.files_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.folders_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.folders_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.folders_show_api.children': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.dashboard_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.logs_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.maintenance_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.pages_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.pages_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.page_revisions_api.index': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue} }
    'api.v1.admin.pages_preview_token.token': { paramsTuple?: []; params?: {} }
    'api.v1.admin.templates.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.templates_preview_token.token': { paramsTuple?: []; params?: {} }
    'api.v1.admin.builder_operations.presence': { paramsTuple: [ParamValue]; params: {'translationId': ParamValue} }
    'admin.pages.render': { paramsTuple?: []; params?: {} }
    'admin.pages_create.render': { paramsTuple?: []; params?: {} }
    'admin.pages_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.page_revisions.index': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue} }
    'admin.pages_preview.render': { paramsTuple: [ParamValue]; params: {'pageId': ParamValue} }
    'admin.templates.render': { paramsTuple?: []; params?: {} }
    'admin.templates_preview.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'page.home': { paramsTuple?: []; params?: {} }
    'page.localised.render': { paramsTuple: [ParamValue,ParamValue]; params: {'locale': ParamValue,'slug': ParamValue} }
    'page.render': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'api.v1.auth.me.show': { paramsTuple?: []; params?: {} }
    'api.v1.profile.profile_api.show': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'admin.identity.users.render': { paramsTuple?: []; params?: {} }
    'admin.identity.users_create.render': { paramsTuple?: []; params?: {} }
    'admin.identity.users_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.users_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.roles.render': { paramsTuple?: []; params?: {} }
    'admin.identity.roles_create.render': { paramsTuple?: []; params?: {} }
    'admin.identity.roles_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.roles_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.permissions.render': { paramsTuple?: []; params?: {} }
    'admin.identity.permissions_create.render': { paramsTuple?: []; params?: {} }
    'admin.identity.permissions_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.users.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.identity.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.roles.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.identity.roles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.permissions.index': { paramsTuple?: []; params?: {} }
    'event_stream': { paramsTuple?: []; params?: {} }
    'health.liveness': { paramsTuple?: []; params?: {} }
    'health.readiness': { paramsTuple?: []; params?: {} }
    'sitemap.show': { paramsTuple?: []; params?: {} }
    'robots.show': { paramsTuple?: []; params?: {} }
    'auth.session.render': { paramsTuple?: []; params?: {} }
    'auth.register.render': { paramsTuple?: []; params?: {} }
    'auth.forgot_password.render': { paramsTuple?: []; params?: {} }
    'auth.reset_password.render': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.accept_invitation.render': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.email_verification.execute': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.social.render': { paramsTuple?: []; params?: {} }
    'auth.social.redirect': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'auth.social.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'settings.profile.render': { paramsTuple?: []; params?: {} }
    'settings.account.render': { paramsTuple?: []; params?: {} }
    'settings.email_change.render': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'settings.preferences.render': { paramsTuple?: []; params?: {} }
    'settings.index': { paramsTuple?: []; params?: {} }
    'admin.dashboard.render': { paramsTuple?: []; params?: {} }
    'admin.files.render': { paramsTuple?: []; params?: {} }
    'admin.file_folders.render': { paramsTuple?: []; params?: {} }
    'admin.settings.maintenance.render': { paramsTuple?: []; params?: {} }
    'admin.logs.render': { paramsTuple?: []; params?: {} }
    'api.v1.admin.files_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.files_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.folders_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.folders_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.folders_show_api.children': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.dashboard_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.logs_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.maintenance_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.pages_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.pages_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.page_revisions_api.index': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue} }
    'api.v1.admin.pages_preview_token.token': { paramsTuple?: []; params?: {} }
    'api.v1.admin.templates.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.templates_preview_token.token': { paramsTuple?: []; params?: {} }
    'api.v1.admin.builder_operations.presence': { paramsTuple: [ParamValue]; params: {'translationId': ParamValue} }
    'admin.pages.render': { paramsTuple?: []; params?: {} }
    'admin.pages_create.render': { paramsTuple?: []; params?: {} }
    'admin.pages_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.page_revisions.index': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue} }
    'admin.pages_preview.render': { paramsTuple: [ParamValue]; params: {'pageId': ParamValue} }
    'admin.templates.render': { paramsTuple?: []; params?: {} }
    'admin.templates_preview.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'page.home': { paramsTuple?: []; params?: {} }
    'page.localised.render': { paramsTuple: [ParamValue,ParamValue]; params: {'locale': ParamValue,'slug': ParamValue} }
    'page.render': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'api.v1.auth.me.show': { paramsTuple?: []; params?: {} }
    'api.v1.profile.profile_api.show': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'admin.identity.users_create.execute': { paramsTuple?: []; params?: {} }
    'admin.identity.users_update.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.roles_create.execute': { paramsTuple?: []; params?: {} }
    'admin.identity.roles_update.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.permissions_create.execute': { paramsTuple?: []; params?: {} }
    'admin.identity.permissions_update.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.users.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.identity.roles.store': { paramsTuple?: []; params?: {} }
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'auth.session.execute': { paramsTuple?: []; params?: {} }
    'auth.register.execute': { paramsTuple?: []; params?: {} }
    'auth.forgot_password.execute': { paramsTuple?: []; params?: {} }
    'auth.reset_password.execute': { paramsTuple?: []; params?: {} }
    'auth.accept_invitation.execute': { paramsTuple?: []; params?: {} }
    'auth.session.destroy': { paramsTuple?: []; params?: {} }
    'auth.social.execute': { paramsTuple?: []; params?: {} }
    'auth.social.unlink': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'settings.profile.execute': { paramsTuple?: []; params?: {} }
    'settings.account.execute': { paramsTuple?: []; params?: {} }
    'settings.email_change.execute': { paramsTuple?: []; params?: {} }
    'settings.preferences.execute': { paramsTuple?: []; params?: {} }
    'admin.files.upload': { paramsTuple?: []; params?: {} }
    'admin.files.move': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.files.upsert_alt': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.file_folders.execute': { paramsTuple?: []; params?: {} }
    'admin.settings.maintenance.update': { paramsTuple?: []; params?: {} }
    'admin.settings.maintenance.toggle': { paramsTuple?: []; params?: {} }
    'api.v1.admin.files_upload_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.folders_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.theme.execute': { paramsTuple?: []; params?: {} }
    'api.v1.admin.pages_create_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.page_translations_api.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.page_revisions_api.restore': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue,'revisionId': ParamValue} }
    'api.v1.admin.templates.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.templates.create_from_page': { paramsTuple?: []; params?: {} }
    'api.v1.admin.builder_operations.execute': { paramsTuple?: []; params?: {} }
    'api.v1.admin.builder_operations.save_draft': { paramsTuple: [ParamValue]; params: {'translationId': ParamValue} }
    'admin.pages_create.execute': { paramsTuple?: []; params?: {} }
    'admin.pages_update.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages_update.publish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages_update.unpublish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages.set_homepage': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.page_translations.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.page_revisions.restore': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue,'revisionId': ParamValue} }
    'admin.page_revisions.toggle_keep': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue,'revisionId': ParamValue} }
    'admin.templates.execute': { paramsTuple?: []; params?: {} }
    'admin.templates.apply_to_page': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'contact.execute': { paramsTuple?: []; params?: {} }
    'api.v1.auth.token.execute': { paramsTuple?: []; params?: {} }
    'api.v1.auth.register_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.forgot_password_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.reset_password_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.email_verification_api.store': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'api.v1.auth.accept_invitation_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.token.destroy': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'admin.identity.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.identity.permissions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.account.destroy': { paramsTuple?: []; params?: {} }
    'admin.files.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.files.delete_alt': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.file_folders.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.files_delete_api.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.files_alt_api.delete_alt': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.folders_delete_api.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_delete_api.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.templates.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.account.account_api.destroy': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'api.v1.admin.identity.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.roles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.file_folders.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.files_api.move': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.files_alt_api.upsert_alt': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.folders_update_api.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.maintenance_api.update': { paramsTuple?: []; params?: {} }
    'api.v1.admin.maintenance_api.toggle': { paramsTuple?: []; params?: {} }
    'api.v1.admin.pages_update_api.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_update_api.publish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_update_api.unpublish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_api.set_homepage': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.page_revisions_api.toggle': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue,'revisionId': ParamValue} }
    'api.v1.admin.templates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.profile.profile_api.update': { paramsTuple?: []; params?: {} }
    'api.v1.account.account_api.update': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}