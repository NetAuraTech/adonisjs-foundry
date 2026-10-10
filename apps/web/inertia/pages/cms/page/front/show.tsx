import { SharedProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { SeoHead } from '~/components/atoms/seo_head';
import PageRenderer from '~/components/cms/renderer/page_renderer';
import { breadcrumbJsonLd, businessJsonLd } from '~/helpers/structured_data';
import type { ResolvedPageContent } from '#cms/types/page';

type PageProps = {
	id: number;
	locale: string;
	title: string;
	metaTitle: string | null;
	metaDescription: string | null;
	metaImage: string | null;
	content: ResolvedPageContent;
};

/**
 * Public-facing Inertia page for rendered pages.
 *
 * Handles SEO through the shared `SeoHead` contract — document title, meta
 * description, share image and the JSON-LD describing the publisher and the
 * page trail — and delegates the actual block rendering to `PageRenderer`.
 */
export default function PageShowPage(props: PageProps) {
	const { id, locale, title, metaTitle, metaDescription, metaImage, content } = props;
	const { email, app_url, app_name, legal_identity } = usePage<SharedProps>().props;
	const seoTitle = metaTitle ?? title;
	const seoOgImage = metaImage ?? `${app_url}/og-image.jpg`;

	return (
		<>
			<SeoHead
				title={seoTitle}
				description={metaDescription ?? undefined}
				image={seoOgImage}
				jsonLd={[
					businessJsonLd({
						appUrl: app_url,
						appName: app_name,
						email,
						identity: legal_identity,
						image: seoOgImage,
					}),
					breadcrumbJsonLd([{ name: app_name, url: `${app_url}/` }, { name: seoTitle }]),
				]}
			/>
			<PageRenderer content={content} pageId={id} locale={locale} />
		</>
	);
}
