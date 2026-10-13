import { BaseSeeder } from '@adonisjs/lucid/seeders';
import Page from '#cms/models/page/page';
import PageTranslation from '#cms/models/page/page_translation';
import { contactEN } from './content/contact.js';
import { featuresEN } from './content/features.js';
import { homeEN, homeFR } from './content/home.js';
import { showcaseEN } from './content/showcase.js';
import { ensureDemoFiles } from './demo_images.js';
import type { PageContent, PageStatus } from '#cms/types/page';

/**
 * A single seeded page translation (one locale + one globally-unique slug of a
 * page).
 */
interface SeededTranslation {
	slug: string;
	locale: string;
	title: string;
	metaTitle: string | null;
	metaDescription: string | null;
	content: PageContent;
	status: PageStatus;
}

/**
 * A page and its translations.
 *
 * `primarySlug` is the stable identity key for the page: the slug of its
 * primary-locale translation. Slugs are globally unique (see
 * `page_translations_slug_unique`), so it addresses exactly one page.
 * `isHomepage` marks the single homepage row (`pages_unique_homepage` partial
 * index allows at most one `is_homepage = true` row).
 * `metaImage` is a demo image filename (see `DEMO_IMAGES`) used as the page's
 * og:image.
 */
interface SeededPage {
	primarySlug: string;
	defaultLocale?: string;
	isHomepage?: boolean;
	metaImage?: string;
	translations: SeededTranslation[];
}

/**
 * Slugs created by the pre-2.2 version of this seeder that the new seed set
 * replaces entirely. They are removed first so their orphan `Page` rows (and
 * the old homepage flag, which would otherwise trip the single-homepage
 * partial index) never survive a re-seed.
 */
const LEGACY_SEED_SLUGS = ['home', 'about', 'grid-demo', 'typography'];

/**
 * The seed set. Built from the demo file ids so image blocks can embed the
 * generated assets.
 */
const buildSeedPages = (files: Record<string, number>): SeededPage[] => [
	{
		primarySlug: 'accueil',
		defaultLocale: 'fr',
		isHomepage: true,
		metaImage: 'forge-hero.png',
		translations: [
			{
				slug: 'accueil',
				locale: 'fr',
				title: 'Accueil',
				metaTitle: 'Foundry — boilerplate AdonisJS v7 + Inertia/React',
				metaDescription:
					'Boilerplate de production : architecture domain-driven, builder visuel à 17 blocs, 2FA, RBAC et contenu multilingue.',
				content: homeFR(files),
				status: 'published',
			},
			{
				slug: 'home',
				locale: 'en',
				title: 'Home',
				metaTitle: 'Foundry — AdonisJS v7 + Inertia/React boilerplate',
				metaDescription:
					'Production-ready boilerplate: domain-driven architecture, 17-block visual builder, 2FA, RBAC and multilingual content.',
				content: homeEN(files),
				status: 'published',
			},
		],
	},
	{
		primarySlug: 'features',
		metaImage: 'blueprint-gears.png',
		translations: [
			{
				slug: 'features',
				locale: 'en',
				title: 'Features',
				metaTitle: 'Features — Foundry',
				metaDescription:
					'What the Foundry boilerplate ships: domain-driven architecture, auth with 2FA and RBAC, the visual builder, and operational defaults.',
				content: featuresEN(files),
				status: 'published',
			},
		],
	},
	{
		primarySlug: 'showcase',
		metaImage: 'specimen-grid.png',
		translations: [
			{
				slug: 'showcase',
				locale: 'en',
				title: 'Showcase',
				metaTitle: 'Showcase — Foundry',
				metaDescription:
					'All 17 CMS block types rendered on a single page — typography, layouts, media, controls and raw HTML.',
				content: showcaseEN(files),
				status: 'published',
			},
		],
	},
	{
		primarySlug: 'contact',
		metaImage: 'spark-burst.png',
		translations: [
			{
				slug: 'contact',
				locale: 'en',
				title: 'Contact',
				metaTitle: 'Contact — Foundry',
				metaDescription:
					'Reach the foundry: a contact form wired end to end — Vine validation, per-IP rate limiting, transactional e-mail.',
				content: contactEN(files),
				status: 'published',
			},
		],
	},
];

/**
 * CMS Page seeder.
 *
 * Seeds the boilerplate presentation pages: a bilingual home (FR primary),
 * a features page, a 17-block showcase and a working contact page, plus the
 * demo images they embed (generated at seed time, see `demo_images.ts`).
 *
 * Run with:
 *   node ace db:seed --files database/seeders/cms/page_seeder.ts
 *
 * Idempotent: legacy seed slugs are removed, pages are keyed by their
 * globally-unique primary slug and translations by their slug, so re-running
 * on a populated database updates in place instead of inserting duplicates
 * (which would trip `page_translations_slug_unique`).
 */
export default class extends BaseSeeder {
	/**
	 * Removes the pages seeded by the pre-2.2 version of this seeder, which
	 * the new seed set replaces entirely.
	 */
	private async removeLegacySeedPages(): Promise<void> {
		for (const slug of LEGACY_SEED_SLUGS) {
			const legacy = await PageTranslation.query().where({ slug }).first();
			if (!legacy) continue;

			await PageTranslation.query().where('pageId', legacy.pageId).delete();
			const page = await Page.find(legacy.pageId);
			await page?.delete();
		}
	}

	/**
	 * Returns the owning `Page` id for a seeded page, creating the page row only
	 * when none of its translations exists yet. Keying on the primary slug
	 * (globally unique) keeps the seeder idempotent: re-running never spawns a
	 * second `Page` row, so the single-homepage invariant is preserved.
	 */
	private async pageIdFor(
		primarySlug: string,
		options: { isHomepage: boolean; defaultLocale: string; metaImageId: number | null },
	): Promise<number> {
		const existing = await PageTranslation.query().where({ slug: primarySlug }).first();
		if (existing) {
			return existing.pageId;
		}

		const page = await Page.create({
			defaultLocale: options.defaultLocale,
			metaImageId: options.metaImageId,
			createdBy: null,
			isHomepage: options.isHomepage,
		});

		return page.id;
	}

	async run() {
		const files = await ensureDemoFiles();
		await this.removeLegacySeedPages();

		for (const seed of buildSeedPages(files)) {
			const metaImageId = seed.metaImage ? (files[seed.metaImage] ?? null) : null;
			const pageId = await this.pageIdFor(seed.primarySlug, {
				isHomepage: Boolean(seed.isHomepage),
				defaultLocale: seed.defaultLocale ?? 'en',
				metaImageId,
			});

			for (const translation of seed.translations) {
				await PageTranslation.updateOrCreate(
					{ slug: translation.slug },
					{
						pageId,
						locale: translation.locale,
						title: translation.title,
						metaTitle: translation.metaTitle,
						metaDescription: translation.metaDescription,
						content: translation.content,
						status: translation.status,
					},
				);
			}
		}

		console.log('✅ CMS pages seeded successfully');
		console.log('   Pages available at:');
		console.log('   → /             (home — FR primary, EN at /home)');
		console.log('   → /features     (boilerplate features)');
		console.log('   → /showcase     (all 17 block types)');
		console.log('   → /contact      (wired contact form + map)');
	}
}
