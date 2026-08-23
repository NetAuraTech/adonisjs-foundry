import { Form } from '@adonisjs/inertia/react';
import { Data } from '@generated/data';
import { Avatar } from '~/components/atoms/avatar';
import { Button } from '~/components/atoms/button';
import { Card } from '~/components/atoms/card';
import { Label } from '~/components/atoms/label';
import { Field } from '~/components/molecules/field';
import { SettingsLayout } from '~/components/organisms/settings_layout';
import { toLooseErrors } from '~/helpers/form_errors';
import { presets } from '~/helpers/validation_rules';
import { useFormValidation } from '~/hooks/use_form_validation';
import { useTranslation } from '~/hooks/use_translation';
import type { SettingsProfileTranslations } from '#helpers/i18n_payloads/profile';

interface PageProps {
	user: Data.User;
	translations: SettingsProfileTranslations;
}

export default function ProfilePage(props: PageProps) {
	const { user, translations } = props;

	const { t } = useTranslation(translations);

	const validation = useFormValidation({
		username: presets.username(t('username.value')),
	});

	return (
		<main>
			<SettingsLayout tab="profile" translations={translations}>
				<Card title={t('title')} subtitle={t('sub_title')}>
					<Form
						route="settings.profile.execute"
						className="grid gap-6"
						onBefore={(visit) => {
							const isValid = validation.validateAll(visit.data as Record<string, any>);
							if (!isValid) return false;
						}}
					>
						{({ errors, processing }) => (
							<>
								<div className="grid gap-2">
									<Label label={t('avatar.value')} htmlFor="avatar" />
									<div className="flex gap-4">
										<Avatar />
										<Button variant="outline" fitContent>
											{t('avatar.change')}
										</Button>
									</div>
								</div>
								<Field
									label={t('username.value')}
									name="username"
									type="text"
									defaultValue={user.username || ''}
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
								<Button loading={processing} type={'submit'} fitContent>
									{t('submit')}
								</Button>
							</>
						)}
					</Form>
				</Card>
			</SettingsLayout>
		</main>
	);
}
