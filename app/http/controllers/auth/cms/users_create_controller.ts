import type { HttpContext } from '@adonisjs/core/http'
import { CreateUserAction } from '#actions/user/create_user_action'
import { inject } from '@adonisjs/core'
import { createValidator } from '#validators/user'
import { ListAllRolesAction } from '#actions/role/list_all_roles_action'
import RoleTransformer from '#transformers/role_transformer'
import { TranslationNodes } from '#types/translations'

@inject()
export default class UsersCreateController {
  constructor(
    protected createUserAction: CreateUserAction,
    protected listAllRolesAction: ListAllRolesAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, i18n } = ctx

    const roles = await this.listAllRolesAction.execute()

    return inertia.render('auth/cms/form', {
      roles: RoleTransformer.transform(roles),
      translations: {
        title: {
          create: i18n.t('cms.users.create.title'),
          edit: i18n.t('cms.users.edit.title', { username: '{username}' }),
        },
        email: {
          value: i18n.t('cms.users.form.email.value'),
          placeholder: i18n.t('cms.users.form.email.placeholder'),
        },
        username: {
          value: i18n.t('cms.users.form.username.value'),
          placeholder: i18n.t('cms.users.form.username.placeholder'),
        },
        roles: {
          value: i18n.t('cms.users.form.role.value'),
          placeholder: i18n.t('cms.users.form.role.placeholder'),
          ...roles.reduce((acc, role) => {
            acc[role.slug] = {
              value: i18n.t(`cms.users.roles.${role.slug}.value`),
              description: i18n.t(`cms.users.roles.${role.slug}.description`),
            }
            return acc
          }, {} as TranslationNodes),
        },
        submit: i18n.t('cms.users.form.submit'),
        actions: {
          list: i18n.t('cms.users.list.title'),
        },
      },
    })
  }

  async execute(ctx: HttpContext) {
    const { request, response, session, i18n } = ctx

    const roles = await this.listAllRolesAction.execute()
    const allowed = roles.map((role) => String(role.id))

    const payload = await createValidator(allowed).validate(request.all())

    const user = await this.createUserAction.execute({
      email: payload.email,
      roleId: payload.role_id ? Number(payload.role_id) : undefined,
    })

    session.flash(
      'success',
      i18n.t('cms.users.created', { email: user.email, username: user.username })
    )

    return response.redirect().toRoute('admin.users_show.render', { id: user.id })
  }
}
