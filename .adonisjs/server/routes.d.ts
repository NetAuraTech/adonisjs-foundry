import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
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
    'admin.users.render': { paramsTuple?: []; params?: {} }
    'admin.users_create.render': { paramsTuple?: []; params?: {} }
    'admin.users_create.execute': { paramsTuple?: []; params?: {} }
    'admin.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users_update.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.roles.render': { paramsTuple?: []; params?: {} }
    'admin.roles_create.render': { paramsTuple?: []; params?: {} }
    'admin.roles_create.execute': { paramsTuple?: []; params?: {} }
    'admin.roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.roles_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.roles_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.roles_update.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.permissions.render': { paramsTuple?: []; params?: {} }
    'admin.permissions_create.render': { paramsTuple?: []; params?: {} }
    'admin.permissions_create.execute': { paramsTuple?: []; params?: {} }
    'admin.permissions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.permissions_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.permissions_update.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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
    'api.theme.execute': { paramsTuple?: []; params?: {} }
    'api.admin.file.list': { paramsTuple?: []; params?: {} }
    'api.admin.file.find': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.admin.file.upload': { paramsTuple?: []; params?: {} }
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
    'api.admin.builder_operations.execute': { paramsTuple?: []; params?: {} }
    'api.admin.builder_operations.presence': { paramsTuple: [ParamValue]; params: {'translationId': ParamValue} }
    'api.admin.builder_operations.save_draft': { paramsTuple: [ParamValue]; params: {'translationId': ParamValue} }
    'api.admin.pages_preview.token': { paramsTuple?: []; params?: {} }
    'api.admin.templates.index': { paramsTuple?: []; params?: {} }
    'api.admin.templates.store': { paramsTuple?: []; params?: {} }
    'api.admin.templates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.admin.templates.create_from_page': { paramsTuple?: []; params?: {} }
    'api.admin.templates_preview.token': { paramsTuple?: []; params?: {} }
    'contact.execute': { paramsTuple?: []; params?: {} }
    'page.home': { paramsTuple?: []; params?: {} }
    'page.localised.render': { paramsTuple: [ParamValue,ParamValue]; params: {'locale': ParamValue,'slug': ParamValue} }
    'page.render': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'api.v1.auth.token.execute': { paramsTuple?: []; params?: {} }
    'api.v1.auth.token.destroy': { paramsTuple?: []; params?: {} }
    'api.v1.auth.me.show': { paramsTuple?: []; params?: {} }
    'api.v1.admin.users_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.users_create_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.users_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.users_update_api.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.users_delete_api.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.roles_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.roles_create_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.roles_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.roles_update_api.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.roles_delete_api.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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
    'api.v1.admin.permissions_api.index': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
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
    'admin.users.render': { paramsTuple?: []; params?: {} }
    'admin.users_create.render': { paramsTuple?: []; params?: {} }
    'admin.users_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.roles.render': { paramsTuple?: []; params?: {} }
    'admin.roles_create.render': { paramsTuple?: []; params?: {} }
    'admin.roles_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.roles_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.permissions.render': { paramsTuple?: []; params?: {} }
    'admin.permissions_create.render': { paramsTuple?: []; params?: {} }
    'admin.permissions_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.files.render': { paramsTuple?: []; params?: {} }
    'admin.file_folders.render': { paramsTuple?: []; params?: {} }
    'admin.settings.maintenance.render': { paramsTuple?: []; params?: {} }
    'admin.logs.render': { paramsTuple?: []; params?: {} }
    'api.admin.file.list': { paramsTuple?: []; params?: {} }
    'api.admin.file.find': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages.render': { paramsTuple?: []; params?: {} }
    'admin.pages_create.render': { paramsTuple?: []; params?: {} }
    'admin.pages_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.page_revisions.index': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue} }
    'admin.pages_preview.render': { paramsTuple: [ParamValue]; params: {'pageId': ParamValue} }
    'admin.templates.render': { paramsTuple?: []; params?: {} }
    'admin.templates_preview.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.admin.builder_operations.presence': { paramsTuple: [ParamValue]; params: {'translationId': ParamValue} }
    'api.admin.pages_preview.token': { paramsTuple?: []; params?: {} }
    'api.admin.templates.index': { paramsTuple?: []; params?: {} }
    'api.admin.templates_preview.token': { paramsTuple?: []; params?: {} }
    'page.home': { paramsTuple?: []; params?: {} }
    'page.localised.render': { paramsTuple: [ParamValue,ParamValue]; params: {'locale': ParamValue,'slug': ParamValue} }
    'page.render': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'api.v1.auth.me.show': { paramsTuple?: []; params?: {} }
    'api.v1.admin.users_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.users_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.roles_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.roles_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.pages_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.page_revisions_api.index': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue} }
    'api.v1.admin.permissions_api.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
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
    'admin.users.render': { paramsTuple?: []; params?: {} }
    'admin.users_create.render': { paramsTuple?: []; params?: {} }
    'admin.users_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.roles.render': { paramsTuple?: []; params?: {} }
    'admin.roles_create.render': { paramsTuple?: []; params?: {} }
    'admin.roles_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.roles_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.permissions.render': { paramsTuple?: []; params?: {} }
    'admin.permissions_create.render': { paramsTuple?: []; params?: {} }
    'admin.permissions_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.files.render': { paramsTuple?: []; params?: {} }
    'admin.file_folders.render': { paramsTuple?: []; params?: {} }
    'admin.settings.maintenance.render': { paramsTuple?: []; params?: {} }
    'admin.logs.render': { paramsTuple?: []; params?: {} }
    'api.admin.file.list': { paramsTuple?: []; params?: {} }
    'api.admin.file.find': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages.render': { paramsTuple?: []; params?: {} }
    'admin.pages_create.render': { paramsTuple?: []; params?: {} }
    'admin.pages_show.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages_update.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.page_revisions.index': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue} }
    'admin.pages_preview.render': { paramsTuple: [ParamValue]; params: {'pageId': ParamValue} }
    'admin.templates.render': { paramsTuple?: []; params?: {} }
    'admin.templates_preview.render': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.admin.builder_operations.presence': { paramsTuple: [ParamValue]; params: {'translationId': ParamValue} }
    'api.admin.pages_preview.token': { paramsTuple?: []; params?: {} }
    'api.admin.templates.index': { paramsTuple?: []; params?: {} }
    'api.admin.templates_preview.token': { paramsTuple?: []; params?: {} }
    'page.home': { paramsTuple?: []; params?: {} }
    'page.localised.render': { paramsTuple: [ParamValue,ParamValue]; params: {'locale': ParamValue,'slug': ParamValue} }
    'page.render': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'api.v1.auth.me.show': { paramsTuple?: []; params?: {} }
    'api.v1.admin.users_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.users_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.roles_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.roles_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_api.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.pages_show_api.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.page_revisions_api.index': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue} }
    'api.v1.admin.permissions_api.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
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
    'admin.users_create.execute': { paramsTuple?: []; params?: {} }
    'admin.users_update.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.roles_create.execute': { paramsTuple?: []; params?: {} }
    'admin.roles_update.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.permissions_create.execute': { paramsTuple?: []; params?: {} }
    'admin.permissions_update.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.files.upload': { paramsTuple?: []; params?: {} }
    'admin.files.move': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.files.upsert_alt': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.file_folders.execute': { paramsTuple?: []; params?: {} }
    'admin.settings.maintenance.update': { paramsTuple?: []; params?: {} }
    'admin.settings.maintenance.toggle': { paramsTuple?: []; params?: {} }
    'api.theme.execute': { paramsTuple?: []; params?: {} }
    'api.admin.file.upload': { paramsTuple?: []; params?: {} }
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
    'api.admin.builder_operations.execute': { paramsTuple?: []; params?: {} }
    'api.admin.builder_operations.save_draft': { paramsTuple: [ParamValue]; params: {'translationId': ParamValue} }
    'api.admin.templates.store': { paramsTuple?: []; params?: {} }
    'api.admin.templates.create_from_page': { paramsTuple?: []; params?: {} }
    'contact.execute': { paramsTuple?: []; params?: {} }
    'api.v1.auth.token.execute': { paramsTuple?: []; params?: {} }
    'api.v1.auth.token.destroy': { paramsTuple?: []; params?: {} }
    'api.v1.admin.users_create_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.roles_create_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.pages_create_api.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.page_translations_api.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.page_revisions_api.restore': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue,'revisionId': ParamValue} }
  }
  DELETE: {
    'settings.account.destroy': { paramsTuple?: []; params?: {} }
    'admin.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.permissions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.files.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.files.delete_alt': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.file_folders.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.pages.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.users_delete_api.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.roles_delete_api.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_delete_api.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'admin.file_folders.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.admin.templates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.users_update_api.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.roles_update_api.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_update_api.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_update_api.publish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_update_api.unpublish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.pages_api.set_homepage': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.page_revisions_api.toggle': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'translationId': ParamValue,'revisionId': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}