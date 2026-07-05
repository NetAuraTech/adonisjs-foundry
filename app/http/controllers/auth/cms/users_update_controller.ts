import type { HttpContext } from '@adonisjs/core/http'
import { GetUserDetailAction } from '#actions/user/get_user_detail_action'
import { UpdateUserAction } from '#actions/user/update_user_action'
import { inject } from '@adonisjs/core'
import { editValidator, updateValidator } from '#validators/user'
import { I18nService } from '#services/i18n_service'
import { ListAllRolesAction } from '#actions/role/list_all_roles_action'
import UserTransformer from '#transformers/user_transformer'
import RoleTransformer from '#transformers/role_transformer'
import { TranslationNodes } from '#types/translations'

@inject()
export default class UsersUpdateController {
  constructor(
    protected i18n: I18nService,
    protected getUserDetailAction: GetUserDetailAction,
    protected updateUserAction: UpdateUserAction,
    protected listAllRolesAction: ListAllRolesAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, params } = ctx

    const payload = await editValidator.validate(params)

    const user = await this.getUserDetailAction.execute({ id: payload.id })

    const roles = await this.listAllRolesAction.execute()

    return inertia.render('auth/cms/form', {
      user: UserTransformer.transform(user),
      roles: RoleTransformer.transform(roles),
      translations: this.i18n.buildPayload({
        title: {
          create: 'cms.users.create.title',
          edit: this.i18n.entry('cms.users.edit.title', { username: '{username}' }),
        },
        email: {
          value: 'cms.users.form.email.value',
          placeholder: 'cms.users.form.email.placeholder',
        },
        username: {
          value: 'cms.users.form.username.value',
          placeholder: 'cms.users.form.username.placeholder',
        },
        roles: {
          value: 'cms.users.form.role.value',
          placeholder: 'cms.users.form.role.placeholder',
          ...roles.reduce((acc, role) => {
            acc[role.slug] = {
              value: `cms.users.roles.${role.slug}.value`,
              description: `cms.users.roles.${role.slug}.description`,
            }
            return acc
          }, {} as TranslationNodes),
        },
        submit: 'cms.users.form.submit',
        actions: {
          list: 'cms.users.list.title',
        },
      }),
    })
  }

  async execute(ctx: HttpContext) {
    const { params, request, response, session } = ctx

    const { id } = await editValidator.validate(params)

    const roles = await this.listAllRolesAction.execute()
    const allowed = roles.map((role) => String(role.id))

    const payload = await updateValidator(id, allowed).validate(request.all())

    const updated = await this.updateUserAction.execute({
      id,
      email: payload.email,
      username: payload.username,
      roleId: payload.role_id ? Number(payload.role_id) : undefined,
    })

    let flash = this.i18n.translate('cms.users.updated')

    if (updated?.pendingEmail === payload.email) {
      flash = `${flash} ${this.i18n.translate('cms.users.updated_email')}`
    }

    session.flash('success', flash)

    return response.redirect().toRoute('admin.users_show.render', { id })
  }
}
