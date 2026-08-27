import { DateTime } from 'luxon';
import { PageFactory, PageTranslationFactory } from '#factories/cms/page_factory';
import { TemplateFactory } from '#factories/cms/template_factory';
import { FileFactory } from '#factories/file/file_factory';
import { FileFolderFactory } from '#factories/file/file_folder_factory';
import { UserFactory, RoleFactory } from '#factories/identity/user_factory';

/** Recognizable markers seeded by {@link seedDashboard}, one per dashboard section. */
export interface DashboardMarkers {
	role: string;
	pageTitle: string;
	folder: string;
	fileName: string;
}

/**
 * Seeds one identifiable entry per dashboard section: a user holding a
 * marker role, a published page translation, a template, and a file inside
 * a marker folder.
 *
 * @param suffix - Unique per-test suffix; unique columns (`roles.name`…)
 *   reject reused markers when a previous test's rows survive truncation.
 * @returns The seeded markers, for content assertions.
 */
export async function seedDashboard(suffix: string): Promise<DashboardMarkers> {
	const markers: DashboardMarkers = {
		role: `e2e-dash-role-${suffix}`,
		pageTitle: `E2E Dashboard Published Page ${suffix}`,
		folder: `e2e-dash-folder-${suffix}`,
		fileName: `e2e-dashboard-upload-${suffix}.txt`,
	};

	const role = await RoleFactory.merge({ name: markers.role }).create();
	await UserFactory.merge({ roleId: role.id }).create();

	const page = await PageFactory.create();
	await PageTranslationFactory.merge({
		pageId: page.id,
		title: markers.pageTitle,
		status: 'published',
		publishedAt: DateTime.now(),
	}).create();

	await TemplateFactory.create();

	const folder = await FileFolderFactory.merge({ name: markers.folder }).create();
	await FileFactory.merge({
		folderId: folder.id,
		originalName: markers.fileName,
	}).create();

	return markers;
}
