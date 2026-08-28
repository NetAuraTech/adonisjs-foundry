import { Form } from '@adonisjs/inertia/react';
import { SharedProps } from '@adonisjs/inertia/types';
import { Button } from '@foundry/design-system/button';
import { Card } from '@foundry/design-system/card';
import { Field } from '@foundry/design-system/field';
import { Icon } from '@foundry/design-system/icon';
import { Data } from '@generated/data';
import { ReactElement } from 'react';
import { urlFor } from '~/client';
import { AdminMain } from '~/components/organisms/admin/admin_main';
import { CanAccess } from '~/guards/can_access';
import { sanitizeRichText, sanitizeText } from '~/helpers/sanitization';
import { rules } from '~/helpers/validation_rules';
import { useMenu } from '~/hooks/use_admin';
import { useFormValidation } from '~/hooks/use_form_validation';
import { useTranslation } from '~/hooks/use_translation';
import Layout from '~/layouts/admin';
import type { AdminPermissionsFormTranslations } from '#app/identity/helpers/i18n_payloads/permissions_form';

type PageProps = {
	permission: Data.Identity.Permission | null;
	translations: AdminPermissionsFormTranslations;
};

export default function PermissionsFormPage(props: PageProps) {
	const { permission, translations } = props;
	const { t } = useTranslation(translations);

	const isEditing = permission !== null;

	const { getEntryIcon } = useMenu();

	const validation = useFormValidation({
		name: [rules.required(t('name.value')), rules.minLength(2, t('name.value')), rules.maxLength(100, t('name.value'))],
		slug: [
			rules.required(t('slug.value')),
			rules.minLength(2, t('slug.value')),
			rules.maxLength(100, t('slug.value')),
			rules.pattern(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/, 'slug_format'),
		],
		category: [
			rules.required(t('category.value')),
			rules.minLength(2, t('category.value')),
			rules.maxLength(50, t('category.value')),
		],
		description: [rules.maxLength(255, t('description.value'))],
	});

	return (
		<AdminMain
			title={isEditing ? t('title.edit', { name: permission.name }) : t('title.create')}
			icon={getEntryIcon('admin.identity.permissions.render')}
		>
			<Card
				header={
					<div className="flex items-center justify-between gap-3">
						<CanAccess permission="permissions.view">
							<Button
								variant="icon"
								href={urlFor('admin.identity.permissions.render')}
								title={t('actions.list')}
								fitContent
							>
								<Icon name="ArrowLeft" />
							</Button>
						</CanAccess>
					</div>
				}
			>
				<Form
					action={
						isEditing
							? urlFor('admin.identity.permissions_update.execute', { id: permission.id })
							: urlFor('admin.identity.permissions_create.execute')
					}
					className="grid gap-6"
					onBefore={(visit) => {
						const isValid = validation.validateAll(visit.data as Record<string, any>);
						if (!isValid) return false;
					}}
				>
					{({ errors, processing }) => (
						<>
							<Field
								label={t('name.value')}
								name="name"
								type="text"
								defaultValue={permission?.name}
								placeholder={t('name.placeholder')}
								errorMessage={errors.name || validation.getValidationMessage('name')}
								onChange={(event) => {
									validation.handleChange('name', event.target.value);
								}}
								onBlur={(event) => {
									validation.handleBlur('name', event!.target.value);
								}}
								required
								sanitizeValue={sanitizeText}
							/>
							<Field
								label={t('slug.value')}
								name="slug"
								type="text"
								defaultValue={permission?.slug}
								placeholder={t('slug.placeholder')}
								errorMessage={errors.slug || validation.getValidationMessage('slug')}
								onChange={(event) => {
									validation.handleChange('slug', event.target.value);
								}}
								onBlur={(event) => {
									validation.handleBlur('slug', event!.target.value);
								}}
								required
								sanitizeValue={sanitizeText}
							/>
							<Field
								label={t('category.value')}
								name="category"
								type="text"
								defaultValue={permission?.category}
								placeholder={t('category.placeholder')}
								errorMessage={errors.category || validation.getValidationMessage('category')}
								onChange={(event) => {
									validation.handleChange('category', event.target.value);
								}}
								onBlur={(event) => {
									validation.handleBlur('category', event!.target.value);
								}}
								required
								sanitizeValue={sanitizeText}
							/>
							<Field
								label={t('description.value')}
								name="description"
								type="textarea"
								defaultValue={permission?.description ?? ''}
								placeholder={t('description.placeholder')}
								errorMessage={errors.description || validation.getValidationMessage('description')}
								onChange={(event) => {
									validation.handleChange('description', event.target.value);
								}}
								onBlur={(event) => {
									validation.handleBlur('description', event!.target.value);
								}}
								sanitizeValue={sanitizeRichText}
							/>
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

PermissionsFormPage.layout = (page: ReactElement<SharedProps>) => <Layout>{page}</Layout>;
