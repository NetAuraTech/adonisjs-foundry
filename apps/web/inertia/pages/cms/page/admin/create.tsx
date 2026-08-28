import { Form } from '@adonisjs/inertia/react';
import { SharedProps } from '@adonisjs/inertia/types';
import { Button } from '@foundry/design-system/button';
import { Card } from '@foundry/design-system/card';
import { Heading } from '@foundry/design-system/heading';
import { Icon } from '@foundry/design-system/icon';
import { Paragraph } from '@foundry/design-system/paragraph';
import { SelectOption } from '@foundry/design-system/select';
import { Separator } from '@foundry/design-system/separator';
import { ReactElement } from 'react';
import { urlFor } from '~/client';
import { Field } from '~/components/molecules/field';
import { AdminMain } from '~/components/organisms/admin/admin_main';
import { CanAccess } from '~/guards/can_access';
import { presets, rules } from '~/helpers/validation_rules';
import { useMenu } from '~/hooks/use_admin';
import { useFormValidation } from '~/hooks/use_form_validation';
import { locales, useTranslation } from '~/hooks/use_translation';
import Layout from '~/layouts/admin';
import type { AdminPagesCreateTranslations } from '#app/cms/helpers/i18n_payloads/pages_create';

interface PagesCreatePageProps {
	translations: AdminPagesCreateTranslations;
}

export default function PagesCreatePage(props: PagesCreatePageProps) {
	const { translations } = props;
	const { t } = useTranslation(translations);

	const { getEntryIcon } = useMenu();

	const validation = useFormValidation({
		locale: [
			...presets.selectWithOptions([...locales.map((locale) => locale)], t('locale')),
			rules.required(t('locale')),
		],
		title: presets.title(t('page_title.value')),
		slug: presets.slug(t('slug')),
		metaTitle: [rules.maxLength(150, t('meta.title.value'))],
		metaDescription: [rules.maxLength(500, t('meta.description.value'))],
	});

	return (
		<>
			<AdminMain title={t('title')} icon={getEntryIcon('admin.cms.pages.render')}>
				<Card
					header={
						<div className="flex items-center justify-between gap-3">
							<CanAccess permission="pages.view">
								<Button variant="icon" href={urlFor('admin.cms.pages.render')} title={t('action')} fitContent>
									<Icon name="ArrowLeft" />
								</Button>
							</CanAccess>
						</div>
					}
				>
					<Form
						route="admin.cms.pages_create.execute"
						className="grid gap-3"
						onBefore={(visit) => {
							const isValid = validation.validateAll(visit.data as Record<string, any>);
							if (!isValid) return false;
						}}
					>
						{({ processing, errors }) => (
							<>
								<div className="grid gap-3">
									<Heading level={3}>{t('details')}</Heading>
									<Separator />
									<Field
										type="select"
										name="locale"
										label={t('locale')}
										errorMessage={errors.locale || validation.getValidationMessage('locale')}
										onChange={(event) => {
											validation.handleChange('locale', event.target.value);
										}}
										onBlur={(event) => {
											validation.handleBlur('locale', event!.target.value);
										}}
										required
										sanitize
									>
										{locales.map((l) => (
											<SelectOption key={l} value={l} label={l.toUpperCase()} />
										))}
									</Field>
									<Field
										type="text"
										name="title"
										label={t('page_title.value')}
										placeholder={t('page_title.placeholder')}
										errorMessage={errors.title || validation.getValidationMessage('title')}
										onChange={(event) => {
											validation.handleChange('title', event.target.value);
										}}
										onBlur={(event) => {
											validation.handleBlur('title', event!.target.value);
										}}
										required
										sanitize
									/>
									<Field
										type="text"
										name="slug"
										label={t('slug')}
										errorMessage={errors.slug || validation.getValidationMessage('slug')}
										onChange={(event) => {
											validation.handleChange('slug', event.target.value);
										}}
										onBlur={(event) => {
											validation.handleBlur('slug', event!.target.value);
										}}
										required
										sanitize
									/>
								</div>
								<div className="grid gap-3 mt-5">
									<Heading level={3}>{t('seo.value')}</Heading>
									<Paragraph variant="muted" spacing="xs">
										{t('seo.help', { title: t('page_title.value') })}
									</Paragraph>
									<Separator />
									<Field
										type="text"
										name="metaTitle"
										label={t('meta.title.value')}
										placeholder={t('meta.title.placeholder')}
										errorMessage={errors.metaTitle || validation.getValidationMessage('metaTitle')}
										onChange={(event) => {
											validation.handleChange('metaTitle', event.target.value);
										}}
										onBlur={(event) => {
											validation.handleBlur('metaTitle', event!.target.value);
										}}
										sanitize
									/>
									<Field
										type="textarea"
										name="metaDescription"
										label={t('meta.description.value')}
										placeholder={t('meta.description.placeholder')}
										errorMessage={errors.metaDescription || validation.getValidationMessage('metaDescription')}
										onChange={(event) => {
											validation.handleChange('metaDescription', event.target.value);
										}}
										onBlur={(event) => {
											validation.handleBlur('metaDescription', event!.target.value);
										}}
										sanitize
									/>
								</div>
								<Button loading={processing} type={'submit'} fitContent>
									{t('submit')}
								</Button>
							</>
						)}
					</Form>
				</Card>
			</AdminMain>
		</>
	);
}

PagesCreatePage.layout = (page: ReactElement<SharedProps>) => <Layout>{page}</Layout>;
