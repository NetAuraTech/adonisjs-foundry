import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ListUsersAction } from '#actions/user/list_users_action'
import { DeleteUserAction } from '#actions/user/delete_user_action'
import { deleteValidator, listValidator } from '#validators/user'
import { I18nService } from '#services/i18n_service'
import { ListAllRolesAction } from '#actions/role/list_all_roles_action'
import UserTransformer from '#transformers/user_transformer'
import RoleTransformer from '#transformers/role_transformer'
import { stripEmptyStrings } from '#helpers/core/strip_empty_strings'
import { extractPagination } from '#helpers/pagination/extract_pagination'
import { TranslationNodes } from '#types/translations'

@inject()
export default class UsersController {
  constructor(
    protected i18n: I18nService,
    protected listUsersAction: ListUsersAction,
    protected deleteUserAction: DeleteUserAction,
    protected listAllRolesAction: ListAllRolesAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, request } = ctx

    const pagination = await extractPagination(request)

    const roles = await this.listAllRolesAction.execute()
    const allowed = roles.map((role) => String(role.id))

    const data = stripEmptyStrings(request.all())

    const payload = await listValidator(allowed).validate(data)

    const users = await this.listUsersAction.execute({
      search: payload.search,
      role: payload.role,
      pagination,
    })

    return inertia.render('auth/cms/index', {
      users: UserTransformer.paginate(users.all(), users.getMeta()),
      roles: RoleTransformer.transform(roles),
      filters: payload,
      translations: this.i18n.buildPayload({
        title: 'cms.users.list.title',
        action: 'cms.users.list.action',
        search: {
          value: 'cms.users.search.value',
          placeholder: 'cms.users.search.placeholder',
          filter: 'cms.users.search.filter',
        },
        roles: {
          value: 'cms.users.roles.value',
          placeholder: 'cms.users.roles.placeholder',
          ...roles.reduce((acc, role) => {
            acc[role.slug] = {
              value: `cms.users.roles.${role.slug}.value`,
              description: `cms.users.roles.${role.slug}.description`,
            }
            return acc
          }, {} as TranslationNodes),
        },
        status: {
          verified: 'cms.users.status.verified',
          unverified: 'cms.users.status.unverified',
          pending_invite: 'cms.users.status.pending_invite',
          value: 'cms.users.status.value',
        },
        empty: 'cms.users.list.empty',
        register_on: 'cms.users.list.register_on',
        value: 'cms.users.value',
        value_one: 'cms.users.value_one',
        actions: {
          value: 'cms.users.actions',
          show: this.i18n.entry('cms.users.show.title', { username: '{username}' }),
          edit: this.i18n.entry('cms.users.edit.title', { username: '{username}' }),
          delete: this.i18n.entry('cms.users.delete.title', { username: '{username}' }),
        },
      }),
    })
  }

  async destroy(ctx: HttpContext) {
    const { response, params, session } = ctx

    const payload = await deleteValidator.validate(params)

    await this.deleteUserAction.execute({ id: payload.id })

    session.flash('success', this.i18n.translate('cms.users.deleted'))

    return response.redirect().toRoute('admin.users.render')
  }
}
