import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
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
    'theme.execute': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
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
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
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
  }
  POST: {
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
    'theme.execute': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'settings.account.destroy': { paramsTuple?: []; params?: {} }
    'admin.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}