import { Form } from '@adonisjs/inertia/react';
import { Banner } from '@foundry/design-system/banner';
import { Button } from '@foundry/design-system/button';
import { Card } from '@foundry/design-system/card';
import { Field } from '@foundry/design-system/field';
import { Data } from '@generated/data';
import { useState } from 'react';
import { urlFor } from '~/client';
import { SettingsLayout } from '~/components/organisms/settings_layout';
import { getIcon } from '~/helpers/oauth';
import { sanitizeEmail } from '~/helpers/sanitization';
import { presets } from '~/helpers/validation_rules';
import { useFormValidation } from '~/hooks/use_form_validation';
import { useTranslation } from '~/hooks/use_translation';
import { capitalize } from '~/lib/string';
import type { SettingsAccountTranslations } from '#app/account/helpers/i18n_payloads/account';
import type { OAuthProvider } from '#auth/types/auth';

interface PageProps {
	user: Data.Identity.User;
	providers: OAuthProvider[];
	translations: SettingsAccountTranslations;
}

export default function AccountPage(props: PageProps) {
	const { user, providers, translations } = props;

	const { t } = useTranslation(translations);

	const validationEmailForm = useFormValidation({
		email: presets.email(t('email.value')),
	});

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const validationPasswordForm = useFormValidation({
		current_password: presets.password(t('password.current.value')),
		password: presets.password(t('password.new.value')),
		password_confirmation: presets.passwordConfirmation(password, t('password.confirm.value')),
	});

	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const validationDeleteForm = useFormValidation({
		password: presets.password(t('delete.password')),
	});

	return (
		<main>
			<SettingsLayout tab="account" translations={translations}>
				<Card title={t('email.title')} subtitle={t('email.sub_title')}>
					<Form
						action={urlFor('account.account.execute')}
						className="grid gap-6"
						onBefore={(visit) => {
							const isValid = validationEmailForm.validateAll(visit.data as Record<string, any>);
							if (!isValid) return false;
						}}
					>
						{({ errors, processing }) => (
							<>
								<input type="hidden" name="_action" value="update_email" />
								<Field
									label={t('email.value')}
									name="email"
									type="email"
									defaultValue={user.email || ''}
									placeholder={t('email.placeholder')}
									validation={validationEmailForm}
									errors={errors}
									required
									sanitizeValue={sanitizeEmail}
								/>
								<Button loading={processing} type={'submit'} fitContent name="update_email_submit">
									{t('email.submit')}
								</Button>
							</>
						)}
					</Form>
				</Card>
				<Card title={t('oauth.title')} subtitle={t('oauth.sub_title')}>
					<div className="divide-y divide-edge">
						{providers.map((provider) => {
							const isConnected = user.connectedProviders[provider];

							return (
								<div key={provider} className="flex items-center justify-between py-3">
									<div className="flex items-center gap-3">
										{getIcon(provider)}
										<div>
											<p className="text-sm font-medium text-ink">{capitalize(provider)}</p>
											<p className={`text-xs ${isConnected ? 'text-success' : 'text-ink-muted'}`}>
												{isConnected ? t('oauth.connected') : t('oauth.not_connected')}
											</p>
										</div>
									</div>

									{isConnected ? (
										<Form
											action={urlFor('auth.social.unlink', { provider: provider })}
											onBefore={() => confirm(t('oauth.unlink.confirm', { provider: capitalize(provider) }))}
										>
											<button
												type="submit"
												className="cursor-pointer text-sm px-3 py-1.5 border border-danger text-danger rounded-lg hover:bg-danger-soft transition"
												title={t('oauth.unlink')}
											>
												{t('oauth.unlink.value')}
											</button>
										</Form>
									) : (
										<a
											href={urlFor('auth.social.redirect', { provider: provider })}
											className="text-sm px-3 py-1.5 border text-ink-muted border-edge rounded-lg hover:bg-sunken transition"
											title={t('oauth.link')}
										>
											{t('oauth.link')}
										</a>
									)}
								</div>
							);
						})}
					</div>
				</Card>
				<Card title={t('password.title')} subtitle={t('password.sub_title')}>
					<Form
						action={urlFor('account.account.execute')}
						className="grid gap-6"
						onBefore={(visit) => {
							const isValid = validationPasswordForm.validateAll(visit.data as Record<string, any>);
							if (!isValid) return false;
						}}
					>
						{({ errors, processing }) => (
							<>
								<input type="hidden" name="_action" value="update_password" />
								<Field
									label={t('password.current.value')}
									name="current_password"
									type="password"
									validation={validationPasswordForm}
									errors={errors}
									required
								/>
								<Field
									label={t('password.new.value')}
									name="password"
									type="password"
									validation={validationPasswordForm}
									errors={errors}
									onChange={(event) => {
										setPassword(event.target.value);
										validationPasswordForm.handleChange('password', event.target.value);
										validationPasswordForm.handleChange('password_confirmation', confirmPassword);
									}}
									onBlur={(event) => {
										setPassword(event!.target.value);
										validationPasswordForm.handleBlur('password', event!.target.value);
										validationPasswordForm.handleBlur('password_confirmation', confirmPassword);
									}}
									required
									helpText={t('password.new.help')}
								/>
								<Field
									label={t('password.confirm.value')}
									name="password_confirmation"
									type="password"
									validation={validationPasswordForm}
									errors={errors}
									onChange={(event) => {
										setConfirmPassword(event.target.value);
										validationPasswordForm.handleChange('password_confirmation', event.target.value);
									}}
									onBlur={(event) => {
										setConfirmPassword(event!.target.value);
										validationPasswordForm.handleBlur('password_confirmation', event!.target.value);
									}}
									required
									helpText={t('password.confirm.help')}
								/>
								<Button loading={processing} type={'submit'} fitContent name="update_password_submit">
									{t('password.submit')}
								</Button>
							</>
						)}
					</Form>
				</Card>
				<Card title={t('delete.title')} subtitle={t('delete.sub_title')} border="danger">
					{!showDeleteConfirm ? (
						<Button variant="danger" fitContent onClick={() => setShowDeleteConfirm(true)} name="delete_account_show">
							{t('delete.submit')}
						</Button>
					) : (
						<div className="grid gap-4">
							<Banner title={t('delete.confirm.title')} message={t('delete.confirm.sub_title')} type="danger" />
							<Form
								action={urlFor('account.account.destroy')}
								method="delete"
								className="grid gap-6"
								onBefore={(visit) => {
									const isValid = validationDeleteForm.validateAll(visit.data as Record<string, any>);
									if (!isValid) return false;
								}}
							>
								{({ errors, processing, reset }) => (
									<>
										<Field
											label={t('delete.password')}
											name="password"
											type="password"
											validation={validationDeleteForm}
											errors={errors}
											required
										/>
										<div className="flex gap-3">
											<Button
												type="button"
												variant="outline"
												fitContent
												onClick={() => {
													setShowDeleteConfirm(false);
													reset('password');
													validationDeleteForm.reset();
												}}
												name="delete_account_cancel"
											>
												{t('delete.cancel')}
											</Button>
											<Button
												loading={processing}
												type={'submit'}
												fitContent
												variant="danger"
												name="delete_account_submit"
											>
												{t('delete.submit')}
											</Button>
										</div>
									</>
								)}
							</Form>
						</div>
					)}
				</Card>
			</SettingsLayout>
		</main>
	);
}
