import { SharedProps } from '@adonisjs/inertia/types';
import { Head, usePage } from '@inertiajs/react';
import type { JsonLd } from '~/helpers/structured_data';

/**
 * The document head of one public front page.
 *
 * Centralizes the per-page SEO tags — document title, meta description, the
 * Open Graph / Twitter share image and the JSON-LD structured-data scripts —
 * so every front page emits the same contract. The site-wide chrome
 * (canonical, `og:url`, `og:site_name`, favicons, …) stays in the root
 * layout; this component only emits the page-level tags, never the layout
 * ones.
 */
export function SeoHead(props: {
	/** The document title, e.g. `"Welcome - AdonisJS Foundry"`. */
	title: string;
	/** The meta description (~160 chars), also used as the share description. Omitted when unset. */
	description?: string;
	/** Absolute URL of the share image; defaults to the static `og-image.jpg`. */
	image?: string;
	/** Structured-data nodes appended as `application/ld+json` scripts. */
	jsonLd?: JsonLd[];
}) {
	const { props: sharedProps } = usePage<SharedProps>();
	const { app_url } = sharedProps;

	const image = props.image ?? `${app_url}/og-image.jpg`;

	return (
		<Head>
			<title>{props.title}</title>
			{props.description ? (
				<>
					<meta name="description" content={props.description} />
					<meta property="og:description" content={props.description} />
					<meta name="twitter:description" content={props.description} />
				</>
			) : null}
			<meta property="og:title" content={props.title} />
			<meta property="og:image" content={image} />
			<meta name="twitter:image" content={image} />
			{props.jsonLd?.map((node, index) => (
				<script key={index} type="application/ld+json">
					{JSON.stringify(node)}
				</script>
			))}
		</Head>
	);
}
