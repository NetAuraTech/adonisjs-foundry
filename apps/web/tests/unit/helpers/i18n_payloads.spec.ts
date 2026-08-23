import { test } from '@japa/runner';
import { buildAcceptInvitationPayload } from '#helpers/i18n_payloads/accept_invitation';
import { buildAccountPayload } from '#helpers/i18n_payloads/account';
import { buildCommonPayload } from '#helpers/i18n_payloads/common';
import { buildDashboardPayload } from '#helpers/i18n_payloads/dashboard';
import { buildEmailChangePayload } from '#helpers/i18n_payloads/email_change';
import { buildFileFoldersPayload } from '#helpers/i18n_payloads/file_folders';
import { buildFilesIndexPayload } from '#helpers/i18n_payloads/files_index';
import { buildFilesShowPayload } from '#helpers/i18n_payloads/files_show';
import { buildForgotPasswordPayload } from '#helpers/i18n_payloads/forgot_password';
import { buildHomePayload } from '#helpers/i18n_payloads/home';
import { buildLogsListPayload } from '#helpers/i18n_payloads/logs_list';
import { buildAdminMaintenanceIndexPayload } from '#helpers/i18n_payloads/maintenance_index';
import { buildMaintenanceIndexPayload } from '#helpers/i18n_payloads/maintenance_index';
import { buildPermissionsFormPayload } from '#helpers/i18n_payloads/permissions_form';
import { buildPermissionsListPayload } from '#helpers/i18n_payloads/permissions_list';
import { buildPreferencesPayload } from '#helpers/i18n_payloads/preferences';
import { buildProfilePayload } from '#helpers/i18n_payloads/profile';
import { buildRegisterPayload } from '#helpers/i18n_payloads/register';
import { buildResetPasswordPayload } from '#helpers/i18n_payloads/reset_password';
import { buildRolesFormPayload } from '#helpers/i18n_payloads/roles_form';
import { buildRolesListPayload } from '#helpers/i18n_payloads/roles_list';
import { buildRolesShowPayload } from '#helpers/i18n_payloads/roles_show';
import { buildSessionPayload } from '#helpers/i18n_payloads/session';
import { buildSocialDefinePasswordPayload } from '#helpers/i18n_payloads/social_define_password';
import { buildUsersFormPayload } from '#helpers/i18n_payloads/users_form';
import { buildUsersListPayload } from '#helpers/i18n_payloads/users_list';
import { buildUsersShowPayload } from '#helpers/i18n_payloads/users_show';
import { I18nService } from '#services/i18n_service';
import { FakeI18n } from '#tests/helpers/fake_i18n';
import { LOCALES, loadLang, emptyLeaves } from '#tests/helpers/i18n_lang_loader';
import type Permission from '#models/auth/permission';
import type Role from '#models/auth/role';
import type { I18n } from '@adonisjs/i18n';

// Dummy domain records whose slugs map to keys that exist in both locales.
const DUMMY_ROLE = {
	slug: 'admin',
	name: 'roles.admin.value',
	description: 'roles.admin.description',
} as unknown as Role;

const DUMMY_PERMISSION = {
	slug: 'users.view',
	name: 'permissions.users.view.value',
	description: 'permissions.users.view.description',
	category: 'permissions.category.users',
} as unknown as Permission;

const BUILDER_IDS = [
	'session',
	'social_define_password',
	'forgot_password',
	'reset_password',
	'register',
	'accept_invitation',
	'profile',
	'preferences',
	'account',
	'email_change',
	'home',
	'dashboard',
	'roles_list',
	'roles_form',
	'roles_show',
	'permissions_list',
	'permissions_form',
	'logs_list',
	'admin_maintenance_index',
	'maintenance_index',
	'file_folders',
	'files_index',
	'files_show',
	'users_list',
	'users_form',
	'users_show',
	'common',
] as const;

/**
 * Runs a single builder for the request-scoped i18n and returns its payload.
 * Exhaustive over every payload builder so a newly added builder fails this
 * suite until it is covered.
 */
function buildById(i18n: I18nService, id: (typeof BUILDER_IDS)[number]): any {
	switch (id) {
		case 'session':
			return buildSessionPayload(i18n);
		case 'social_define_password':
			return buildSocialDefinePasswordPayload(i18n);
		case 'forgot_password':
			return buildForgotPasswordPayload(i18n);
		case 'reset_password':
			return buildResetPasswordPayload(i18n);
		case 'register':
			return buildRegisterPayload(i18n);
		case 'accept_invitation':
			return buildAcceptInvitationPayload(i18n, 'user@example.com');
		case 'profile':
			return buildProfilePayload(i18n);
		case 'preferences':
			return buildPreferencesPayload(i18n);
		case 'account':
			return buildAccountPayload(i18n);
		case 'email_change':
			return buildEmailChangePayload(i18n);
		case 'home':
			return buildHomePayload(i18n);
		case 'dashboard':
			return buildDashboardPayload(i18n);
		case 'roles_list':
			return buildRolesListPayload(i18n, [DUMMY_ROLE]);
		case 'roles_form':
			return buildRolesFormPayload(i18n, [DUMMY_PERMISSION]);
		case 'roles_show':
			return buildRolesShowPayload(i18n, DUMMY_ROLE, [DUMMY_PERMISSION]);
		case 'permissions_list':
			return buildPermissionsListPayload(i18n, [DUMMY_PERMISSION]);
		case 'permissions_form':
			return buildPermissionsFormPayload(i18n);
		case 'logs_list':
			return buildLogsListPayload(i18n);
		case 'admin_maintenance_index':
			return buildAdminMaintenanceIndexPayload(i18n);
		case 'maintenance_index':
			return buildMaintenanceIndexPayload(i18n);
		case 'file_folders':
			return buildFileFoldersPayload(i18n);
		case 'files_index':
			return buildFilesIndexPayload(i18n);
		case 'files_show':
			return buildFilesShowPayload(i18n);
		case 'users_list':
			return buildUsersListPayload(i18n, [DUMMY_ROLE]);
		case 'users_form':
			return buildUsersFormPayload(i18n, [DUMMY_ROLE]);
		case 'users_show':
			return buildUsersShowPayload(i18n, DUMMY_ROLE, [DUMMY_PERMISSION]);
		case 'common':
			return buildCommonPayload(i18n);
	}
}

test.group('i18n payload lang coverage', () => {
	test('covers every non-CMS payload builder', ({ assert }) => {
		assert.lengthOf(BUILDER_IDS, 27);
	});

	for (const locale of LOCALES) {
		for (const id of BUILDER_IDS) {
			test(`${id} [${locale}]`, ({ assert }) => {
				const fake = new FakeI18n(loadLang(locale));
				const i18n = new I18nService(fake as unknown as I18n);
				const output = buildById(i18n, id);

				assert.lengthOf(fake.misses, 0);
				assert.lengthOf(emptyLeaves(output), 0);
			});
		}
	}
});
