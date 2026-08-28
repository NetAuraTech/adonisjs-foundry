import { Form } from '@adonisjs/inertia/react';
import { Button } from '@foundry/design-system/button';
import { Card } from '@foundry/design-system/card';
import { NavLink } from '@foundry/design-system/nav-link';
import { Paragraph } from '@foundry/design-system/paragraph';
import { Section } from '@foundry/design-system/section';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { urlFor } from '~/client';
import { AuthIntro } from '~/components/molecules/auth/auth_intro';
import { AuthProviders } from '~/components/molecules/auth/auth_providers';
import { Field } from '~/components/molecules/field';
import { toLooseErrors } from '~/helpers/form_errors';
import { presets } from '~/helpers/validation_rules';
import { useFormValidation } from '~/hooks/use_form_validation';
import { useTranslation } from '~/hooks/use_translation';
import type { RegisterTranslations } from '#app/auth/helpers/i18n_payloads/register';
import type { OAuthProvider } from '#auth/types/auth';

interface RegisterPageProps {
	providers: OAuthProvider[];
	translations: RegisterTranslations;
}

export default function RegisterPage(props: RegisterPageProps) {
	const { providers, translations } = props;
	const { t } = useTranslation(translations);

	const loginHref = urlFor('auth.session.render');

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const validation = useFormValidation({
		email: presets.email(t('email.value')),
		password: presets.password(t('password.value')),
		password_confirmation: presets.passwordConfirmation(
			password,
			t('password.confirmation.value'),
			t('password.value'),
		),
	});

	return (
		<main>
			<Head title={t('title')} />
			<Section>
				<div className="container">
					<AuthIntro
						title={t('title')}
						text={t('sub_title')}
						icon={
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						}
					/>
					<Card
						footer={
							<div className="text-center">
								<Paragraph fs="sm">
									{t('account.has')} <NavLink href={loginHref} label={t('account.login')} fs="sm" />
								</Paragraph>
							</div>
						}
					>
						<Form
							action={urlFor('auth.register.execute')}
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
										placeholder={t('email.placeholder')}
										errorMessage={errors.email || validation.getValidationMessage('email')}
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
										label={t('password.value')}
										name="password"
										type="password"
										errorMessage={errors.password || validation.getValidationMessage('password')}
										onChange={(event) => {
											setPassword(event.target.value);
											validation.handleChange('password', event.target.value);
											validation.handleChange('password_confirmation', confirmPassword);
										}}
										onBlur={(event) => {
											setPassword(event!.target.value);
											validation.handleBlur('password', event!.target.value);
											validation.handleBlur('password_confirmation', confirmPassword);
										}}
										required
										sanitize={false}
										helpText={t('password.help')}
										helpClassName={validation.getHelpClassName('password')}
									/>
									<Field
										label={t('password.confirmation.value')}
										name="password_confirmation"
										type="password"
										errorMessage={
											toLooseErrors(errors).password_confirmation ||
											validation.getValidationMessage('password_confirmation')
										}
										onChange={(event) => {
											setConfirmPassword(event.target.value);
											validation.handleChange('password_confirmation', event.target.value);
										}}
										onBlur={(event) => {
											setConfirmPassword(event!.target.value);
											validation.handleBlur('password_confirmation', event!.target.value);
										}}
										required
										sanitize={false}
										helpText={t('password.confirmation.help')}
										helpClassName={validation.getHelpClassName('password_confirmation')}
									/>
									<Button loading={processing} type={'submit'} fitContent>
										{t('submit')}
									</Button>
								</>
							)}
						</Form>
						<AuthProviders providers={providers} translations={translations} />
					</Card>
				</div>
			</Section>
		</main>
	);
}
