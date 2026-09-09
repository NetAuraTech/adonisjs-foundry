import { BaseSeeder } from '@adonisjs/lucid/seeders';
import Page from '#cms/models/page/page';
import PageTranslation from '#cms/models/page/page_translation';
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
 */
interface SeededPage {
	primarySlug: string;
	isHomepage?: boolean;
	translations: SeededTranslation[];
}

const SEED_PAGES: SeededPage[] = [
	{
		primarySlug: 'home',
		isHomepage: true,
		translations: [
			{
				slug: 'home',
				locale: 'en',
				title: 'Home',
				metaTitle: 'Home — Foundry CMS',
				metaDescription: 'Welcome to Foundry, a composable CMS built on AdonisJS.',
				content: { blocks: [] },
				status: 'published',
			},
			{
				slug: 'accueil',
				locale: 'fr',
				title: 'Accueil',
				metaTitle: 'Accueil — Foundry CMS',
				metaDescription: 'Bienvenue sur Foundry, un CMS composable basé sur AdonisJS.',
				content: { blocks: [] },
				status: 'published',
			},
		],
	},
	{
		primarySlug: 'about',
		translations: [
			{
				slug: 'about',
				locale: 'en',
				title: 'About',
				metaTitle: 'About — Foundry CMS',
				metaDescription: 'Learn more about the Foundry CMS project.',
				content: { blocks: [] },
				status: 'published',
			},
		],
	},
	{
		primarySlug: 'contact',
		translations: [
			{
				slug: 'contact',
				locale: 'en',
				title: 'Contact',
				metaTitle: 'Contact — Foundry CMS',
				metaDescription: 'Get in touch with the Foundry team.',
				content: { blocks: [] },
				status: 'published',
			},
		],
	},
	{
		primarySlug: 'grid-demo',
		translations: [
			{
				slug: 'grid-demo',
				locale: 'en',
				title: 'Grid Demo',
				metaTitle: null,
				metaDescription: null,
				content: { blocks: [] },
				status: 'published',
			},
		],
	},
	{
		primarySlug: 'typography',
		translations: [
			{
				slug: 'typography',
				locale: 'en',
				title: 'Typography Demo',
				metaTitle: null,
				metaDescription: null,
				content: { blocks: [] },
				status: 'published',
			},
		],
	},
];

/**
 * CMS Page seeder.
 *
 * Creates a small set of realistic pages covering all block types so you
 * can verify the renderer end-to-end without building an editor first.
 *
 * Run with:
 *   node ace db:seed --files database/seeders/page_seeder.ts
 *
 * Idempotent: pages are keyed by their globally-unique primary slug and
 * translations by their slug, so re-running on a populated database updates
 * in place instead of inserting duplicates (which would trip
 * `page_translations_slug_unique`).
 *
 * Pages created:
 *   - Home page         (hero + rich_text + button_cta)          → /home
 *   - About page        (section > title + rich_text)            → /about
 *   - Contact page      (section > title + contact_form)         → /contact
 *   - Grid showcase     (section > grid > [image, image])        → /grid-demo
 *   - Typography demo   (section > [title × 4 + separator × 3 + rich_text]) → /typography
 */
export default class extends BaseSeeder {
	/**
	 * Returns the owning `Page` id for a seeded page, creating the page row only
	 * when none of its translations exists yet. Keying on the primary slug
	 * (globally unique) keeps the seeder idempotent: re-running never spawns a
	 * second `Page` row, so the single-homepage invariant is preserved.
	 */
	private async pageIdFor(primarySlug: string, isHomepage: boolean): Promise<number> {
		const existing = await PageTranslation.query().where({ slug: primarySlug }).first();
		if (existing) {
			return existing.pageId;
		}

		const page = await Page.create({
			defaultLocale: 'en',
			metaImageId: null,
			createdBy: null,
			isHomepage,
		});

		return page.id;
	}

	async run() {
		for (const seed of SEED_PAGES) {
			const pageId = await this.pageIdFor(seed.primarySlug, Boolean(seed.isHomepage));

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
		console.log('   → /home           (hero + rich_text + button_cta)');
		console.log('   → /about          (section > title + separator + rich_text)');
		console.log('   → /contact        (section > title + contact_form)');
		console.log('   → /grid-demo      (section > grid 3 cols)');
		console.log('   → /typography     (all typography blocks)');
		console.log('   → /fr/accueil     (FR translation of home)');
	}
}
