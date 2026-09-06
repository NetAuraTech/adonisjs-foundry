import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'api.v1.account.profile.show': { paramsTuple?: []; params?: {} }
    'api.v1.account.profile.update': { paramsTuple?: []; params?: {} }
    'api.v1.account.account.update': { paramsTuple?: []; params?: {} }
    'api.v1.account.account.destroy': { paramsTuple?: []; params?: {} }
    'api.v1.admin.account.preferences.execute': { paramsTuple?: []; params?: {} }
    'api.v1.admin.core.dashboard.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.core.maintenance.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.core.maintenance.update': { paramsTuple?: []; params?: {} }
    'api.v1.admin.core.maintenance.toggle': { paramsTuple?: []; params?: {} }
    'api.v1.admin.file.files.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.file.files.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.file.files.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.files.move': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.files.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.files.upsert_alt': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.files.delete_alt': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.folders.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.file.folders.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.file.folders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.folders.children': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.folders.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.folders.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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
    'api.v1.admin.log.logs.index': { paramsTuple?: []; params?: {} }
    'api.v1.auth.login.execute': { paramsTuple?: []; params?: {} }
    'api.v1.auth.register.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.forgot_password.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.reset_password.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.email_verification.store': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'api.v1.auth.accept_invitation.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.logout.destroy': { paramsTuple?: []; params?: {} }
    'api.v1.auth.me.show': { paramsTuple?: []; params?: {} }
    'health.liveness': { paramsTuple?: []; params?: {} }
    'health.readiness': { paramsTuple?: []; params?: {} }
    'auth.social.redirect': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'auth.social.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'api.v1.account.profile.show': { paramsTuple?: []; params?: {} }
    'api.v1.admin.core.dashboard.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.core.maintenance.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.file.files.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.file.files.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.folders.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.file.folders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.folders.children': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.users.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.identity.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.roles.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.identity.roles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.permissions.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.log.logs.index': { paramsTuple?: []; params?: {} }
    'api.v1.auth.me.show': { paramsTuple?: []; params?: {} }
    'health.liveness': { paramsTuple?: []; params?: {} }
    'health.readiness': { paramsTuple?: []; params?: {} }
    'auth.social.redirect': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'auth.social.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'api.v1.account.profile.show': { paramsTuple?: []; params?: {} }
    'api.v1.admin.core.dashboard.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.core.maintenance.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.file.files.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.file.files.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.folders.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.file.folders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.folders.children': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.users.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.identity.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.roles.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.identity.roles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.permissions.index': { paramsTuple?: []; params?: {} }
    'api.v1.admin.log.logs.index': { paramsTuple?: []; params?: {} }
    'api.v1.auth.me.show': { paramsTuple?: []; params?: {} }
    'health.liveness': { paramsTuple?: []; params?: {} }
    'health.readiness': { paramsTuple?: []; params?: {} }
    'auth.social.redirect': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'auth.social.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
  }
  PUT: {
    'api.v1.account.profile.update': { paramsTuple?: []; params?: {} }
    'api.v1.account.account.update': { paramsTuple?: []; params?: {} }
    'api.v1.admin.core.maintenance.update': { paramsTuple?: []; params?: {} }
    'api.v1.admin.core.maintenance.toggle': { paramsTuple?: []; params?: {} }
    'api.v1.admin.file.files.move': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.files.upsert_alt': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.folders.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.roles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'api.v1.account.account.destroy': { paramsTuple?: []; params?: {} }
    'api.v1.admin.file.files.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.files.delete_alt': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.file.folders.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.admin.identity.roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'api.v1.admin.account.preferences.execute': { paramsTuple?: []; params?: {} }
    'api.v1.admin.file.files.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.file.folders.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.identity.users.store': { paramsTuple?: []; params?: {} }
    'api.v1.admin.identity.roles.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.login.execute': { paramsTuple?: []; params?: {} }
    'api.v1.auth.register.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.forgot_password.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.reset_password.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.email_verification.store': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'api.v1.auth.accept_invitation.store': { paramsTuple?: []; params?: {} }
    'api.v1.auth.logout.destroy': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}