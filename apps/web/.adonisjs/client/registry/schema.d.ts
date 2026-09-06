/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'drive.fs.serve': {
    methods: ["GET","HEAD"]
    pattern: '/uploads/*'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { '*': ParamValue[] }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'api.v1.account.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#transport/account/controllers/api/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/account/controllers/api/profile_controller').default['show']>>>
    }
  }
  'api.v1.account.profile.update': {
    methods: ["PUT"]
    pattern: '/api/v1/profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/account/validators/profile').profileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#transport/account/validators/profile').profileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/account/controllers/api/profile_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/account/controllers/api/profile_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.account.account.update': {
    methods: ["PUT"]
    pattern: '/api/v1/account'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#transport/account/controllers/api/account_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/account/controllers/api/account_controller').default['update']>>>
    }
  }
  'api.v1.account.account.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/account'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/account/validators/account').deleteAccountValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#transport/account/validators/account').deleteAccountValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/account/controllers/api/account_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/account/controllers/api/account_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.account.preferences.execute': {
    methods: ["POST"]
    pattern: '/api/v1/admin/preferences/theme'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/account/validators/preference').updateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#transport/account/validators/preference').updateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/account/controllers/api/preferences_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/account/controllers/api/preferences_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.core.dashboard.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#transport/core/controllers/api/dashboard_api_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/core/controllers/api/dashboard_api_controller').default['index']>>>
    }
  }
  'api.v1.admin.core.maintenance.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/maintenance'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#transport/core/controllers/api/maintenance_api_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/core/controllers/api/maintenance_api_controller').default['index']>>>
    }
  }
  'api.v1.admin.core.maintenance.update': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/maintenance'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/core/validators/maintenance').updateMaintenanceValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#transport/core/validators/maintenance').updateMaintenanceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/core/controllers/api/maintenance_api_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/core/controllers/api/maintenance_api_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.core.maintenance.toggle': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/maintenance/toggle'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/core/validators/maintenance').toggleMaintenanceValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#transport/core/validators/maintenance').toggleMaintenanceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/core/controllers/api/maintenance_api_controller').default['toggle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/core/controllers/api/maintenance_api_controller').default['toggle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.file.files.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/files'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#transport/file/validators/file').listFileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/file/controllers/api/files_api_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/file/controllers/api/files_api_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.file.files.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/files'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#transport/file/controllers/api/files_upload_api_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/file/controllers/api/files_upload_api_controller').default['store']>>>
    }
  }
  'api.v1.admin.file.files.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/files/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#transport/file/validators/file').showFileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/file/controllers/api/files_show_api_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/file/controllers/api/files_show_api_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.file.files.move': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/files/:id/move'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/file/validators/file').moveFileValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#transport/file/validators/file').moveFileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/file/controllers/api/files_api_controller').default['move']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/file/controllers/api/files_api_controller').default['move']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.file.files.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/files/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/file/validators/file').showFileValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#transport/file/validators/file').showFileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/file/controllers/api/files_delete_api_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/file/controllers/api/files_delete_api_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.file.files.upsert_alt': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/files/:id/alt'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/file/validators/file').upsertAltValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#transport/file/validators/file').upsertAltValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/file/controllers/api/files_alt_api_controller').default['upsertAlt']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/file/controllers/api/files_alt_api_controller').default['upsertAlt']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.file.files.delete_alt': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/files/:id/alt'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/file/validators/file').deleteAltValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#transport/file/validators/file').deleteAltValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/file/controllers/api/files_alt_api_controller').default['deleteAlt']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/file/controllers/api/files_alt_api_controller').default['deleteAlt']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.file.folders.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/folders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#transport/file/controllers/api/folders_api_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/file/controllers/api/folders_api_controller').default['index']>>>
    }
  }
  'api.v1.admin.file.folders.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/folders'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/file/validators/file').createFolderValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#transport/file/validators/file').createFolderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/file/controllers/api/folders_api_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/file/controllers/api/folders_api_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.file.folders.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/folders/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#transport/file/validators/file').showFileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/file/controllers/api/folders_show_api_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/file/controllers/api/folders_show_api_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.file.folders.children': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/folders/:id/children'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#transport/file/controllers/api/folders_show_api_controller').default['children']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/file/controllers/api/folders_show_api_controller').default['children']>>>
    }
  }
  'api.v1.admin.file.folders.update': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/folders/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/file/validators/file').updateFolderValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#transport/file/validators/file').updateFolderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/file/controllers/api/folders_update_api_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/file/controllers/api/folders_update_api_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.file.folders.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/folders/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/file/validators/file').showFileValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#transport/file/validators/file').showFileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/file/controllers/api/folders_delete_api_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/file/controllers/api/folders_delete_api_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.identity.users.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#transport/identity/validators/user').listValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/users_api_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/users_api_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.identity.users.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/users'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/identity/validators/user').createValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#transport/identity/validators/user').createValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/users_create_api_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/users_create_api_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.identity.users.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#transport/identity/validators/user').restIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/users_show_api_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/users_show_api_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.identity.users.update': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/identity/validators/user').updateValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#transport/identity/validators/user').updateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/users_update_api_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/users_update_api_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.identity.users.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/identity/validators/user').restIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#transport/identity/validators/user').restIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/users_delete_api_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/users_delete_api_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.identity.roles.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/roles'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#transport/identity/validators/role').listRolesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/roles_api_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/roles_api_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.identity.roles.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/roles'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/identity/validators/role').createRoleValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#transport/identity/validators/role').createRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/roles_create_api_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/roles_create_api_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.identity.roles.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/roles/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#transport/identity/validators/role').restRoleIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/roles_show_api_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/roles_show_api_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.identity.roles.update': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/roles/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/identity/validators/role').updateRoleValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#transport/identity/validators/role').updateRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/roles_update_api_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/roles_update_api_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.identity.roles.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/roles/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/identity/validators/role').restRoleIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#transport/identity/validators/role').restRoleIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/roles_delete_api_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/roles_delete_api_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.identity.permissions.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/permissions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/permissions_api_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/identity/controllers/api/permissions_api_controller').default['index']>>>
    }
  }
  'api.v1.admin.log.logs.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/logs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#transport/log/validators/log').listLogsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/log/controllers/api/logs_api_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/log/controllers/api/logs_api_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.auth.login.execute': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/auth/validators/auth').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#transport/auth/validators/auth').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/login_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/login_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.auth.register.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/register'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/auth/validators/auth').registerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#transport/auth/validators/auth').registerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/register_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/register_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.auth.forgot_password.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/forgot-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/auth/validators/auth').forgotPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#transport/auth/validators/auth').forgotPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/forgot_password_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/forgot_password_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.auth.reset_password.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/reset-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/auth/validators/auth').resetPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#transport/auth/validators/auth').resetPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/reset_password_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/reset_password_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.auth.email_verification.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/verify-email/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/email_verification_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/email_verification_controller').default['store']>>>
    }
  }
  'api.v1.auth.accept_invitation.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/accept-invitation'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transport/auth/validators/auth').invitationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#transport/auth/validators/auth').invitationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/accept_invitation_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/accept_invitation_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.auth.logout.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/logout_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/logout_controller').default['destroy']>>>
    }
  }
  'api.v1.auth.me.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/me_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/me_controller').default['show']>>>
    }
  }
  'health.liveness': {
    methods: ["GET","HEAD"]
    pattern: '/health'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#transport/core/controllers/health_controller').default['liveness']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/core/controllers/health_controller').default['liveness']>>>
    }
  }
  'health.readiness': {
    methods: ["GET","HEAD"]
    pattern: '/health/ready'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#transport/core/controllers/health_controller').default['readiness']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/core/controllers/health_controller').default['readiness']>>>
    }
  }
  'auth.social.redirect': {
    methods: ["GET","HEAD"]
    pattern: '/oauth/:provider'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { provider: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/social_api_controller').default['redirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/social_api_controller').default['redirect']>>>
    }
  }
  'auth.social.callback': {
    methods: ["GET","HEAD"]
    pattern: '/oauth/:provider/callback'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { provider: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/social_api_controller').default['callback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#transport/auth/controllers/api/social_api_controller').default['callback']>>>
    }
  }
}
