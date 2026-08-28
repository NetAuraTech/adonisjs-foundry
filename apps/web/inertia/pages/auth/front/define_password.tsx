import { Form } from '@adonisjs/inertia/react';
import { Button } from '@foundry/design-system/button';
import { Card } from '@foundry/design-system/card';
import { Section } from '@foundry/design-system/section';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { AuthIntro } from '~/components/molecules/auth/auth_intro';
import { Field } from '~/components/molecules/field';
import { toLooseErrors } from '~/helpers/form_errors';
import { presets } from '~/helpers/validation_rules';
import { useFormValidation } from '~/hooks/use_form_validation';
import { useTranslation } from '~/hooks/use_translation';
import type { DefinePasswordTranslations } from '#app/auth/helpers/i18n_payloads/social_define_password';

interface DefinePasswordPageProps {
	translations: DefinePasswordTranslations;
}

export default function DefinePasswordPage(props: DefinePasswordPageProps) {
	const { translations } = props;
	const { t } = useTranslation(translations);

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const validation = useFormValidation({
		password: presets.password(t('password.value')),
		password_confirmation: presets.passwordConfirmation(password, t('password.confirmation.value')),
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
					<Card>
						<Form
							route="auth.social.execute"
							className="grid gap-6"
							onBefore={(visit) => {
								const isValid = validation.validateAll(visit.data as Record<string, any>);
								if (!isValid) return false;
							}}
						>
							{({ errors, processing }) => (
								<>
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
					</Card>
				</div>
			</Section>
		</main>
	);
}
