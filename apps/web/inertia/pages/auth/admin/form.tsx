import { Form } from '@adonisjs/inertia/react';
import { SharedProps } from '@adonisjs/inertia/types';
import { Button } from '@foundry/design-system/button';
import { Card } from '@foundry/design-system/card';
import { Icon } from '@foundry/design-system/icon';
import { SelectOption } from '@foundry/design-system/select';
import { Data } from '@generated/data';
import { ReactElement } from 'react';
import { urlFor } from '~/client';
import { Field } from '~/components/molecules/field';
import { AdminMain } from '~/components/organisms/admin/admin_main';
import { CanAccess } from '~/guards/can_access';
import { toLooseErrors } from '~/helpers/form_errors';
import { presets, rules } from '~/helpers/validation_rules';
import { useMenu } from '~/hooks/use_admin';
import { useFormValidation } from '~/hooks/use_form_validation';
import { useTranslation } from '~/hooks/use_translation';
import Layout from '~/layouts/admin';
import type { AdminUsersFormTranslations } from '#app/identity/helpers/i18n_payloads/users_form';

type PageProps = {
	user?: Data.Identity.User;
	roles: Data.Identity.Role[];
	translations: AdminUsersFormTranslations;
};

export default function UsersFormPage(props: PageProps) {
	const { user, roles, translations } = props;
	const { t } = useTranslation(translations);

	const isEditing = user !== undefined;

	const { getEntryIcon } = useMenu();

	const validation = useFormValidation({
		email: presets.email(t('email.value')),
		username: presets.username(t('username.value')),
		role_id: [...presets.selectWithOptions([...roles.map((r) => r.id)], 'role_id'), rules.required('role_id')],
	});

	return (
		<AdminMain
			title={isEditing ? t('title.edit', { username: user!.username }) : t('title.create')}
			icon={getEntryIcon('admin.identity.users.render')}
		>
			<Card
				header={
					<div className="flex items-center justify-between gap-3">
						<CanAccess permission="users.view">
							<Button variant="icon" href={urlFor('admin.identity.users.render')} title={t('actions.list')} fitContent>
								<Icon name="ArrowLeft" />
							</Button>
						</CanAccess>
					</div>
				}
			>
				<Form
					route={isEditing ? 'admin.identity.users_update.execute' : 'admin.identity.users_create.execute'}
					routeParams={isEditing ? { id: user!.id } : {}}
					className="grid gap-6"
					onBefore={(visit) => {
						const isValid = validation.validateAll(visit.data as Record<string, any>);
						if (!isValid) return false;
					}}
				>
					{({ errors, processing }) => (
						<>
							<Field
								label={t('email.value')}
								name="email"
								type="email"
								defaultValue={user?.email}
								placeholder={t('email.placeholder')}
								errorMessage={toLooseErrors(errors).email || validation.getValidationMessage('email')}
								onChange={(event) => {
									validation.handleChange('email', event.target.value);
								}}
								onBlur={(event) => {
									validation.handleBlur('email', event!.target.value);
								}}
								required
								sanitize
							/>
							<Field
								label={t('username.value')}
								name="username"
								type="text"
								defaultValue={user?.username}
								placeholder={t('username.placeholder')}
								errorMessage={toLooseErrors(errors).username || validation.getValidationMessage('username')}
								onChange={(event) => {
									validation.handleChange('username', event.target.value);
								}}
								onBlur={(event) => {
									validation.handleBlur('username', event!.target.value);
								}}
								required
								sanitize
							/>
							<Field
								label={t('roles.value')}
								name="role_id"
								type="select"
								defaultValue={user?.role?.id}
								placeholder={t('roles.placeholder')}
								errorMessage={toLooseErrors(errors).role_id || validation.getValidationMessage('role_id')}
								onChange={(event) => {
									validation.handleChange('role_id', event.target.value);
								}}
								onBlur={(event) => {
									validation.handleBlur('role_id', event!.target.value);
								}}
								required
								sanitize
							>
								{roles &&
									roles.map((role) => (
										<SelectOption key={`role-${role.id}`} label={t(role.name as any)} value={role.id} />
									))}
							</Field>
							<Button loading={processing} type={'submit'} fitContent>
								{t('submit')}
							</Button>
						</>
					)}
				</Form>
			</Card>
		</AdminMain>
	);
}

UsersFormPage.layout = (page: ReactElement<SharedProps>) => <Layout>{page}</Layout>;
