import env from '#start/env';
import type { VideoProvider } from '#cms/types/page';

/**
 * Configuration for CMS content policies (page builder blocks).
 *
 * Everything here is about what editors are allowed to embed in public
 * pages — parsed once at boot from environment variables.
 */
const cmsConfig = {
	/**
	 * Hostname allowlist for the `iframe` block, comma-separated in
	 * `CMS_IFRAME_ALLOWLIST`. A URL is embeddable when its hostname matches an
	 * entry exactly or as a subdomain of it (`example.com` also allows
	 * `maps.example.com`). Only `https` URLs are eligible (`http` is accepted
	 * on localhost for development). Enforced at save time (sanitization) and
	 * again at render time (PageResolverService).
	 */
	iframeAllowlist: env
		.get('CMS_IFRAME_ALLOWLIST', 'www.google.com,maps.google.com')
		.split(',')
		.map((host) => host.trim().toLowerCase())
		.filter((host) => host.length > 0),

	/**
	 * Video providers enabled for the `video` block, comma-separated in
	 * `CMS_VIDEO_PROVIDERS`. Provider page URLs are converted to embed URLs by
	 * `embed_policy`; URLs from disabled or unknown providers are treated as
	 * unrenderable. Direct media files (`.mp4`/`.webm`/`.ogg`/`.mov`) are
	 * always allowed regardless of this list.
	 */
	videoProviders: env
		.get('CMS_VIDEO_PROVIDERS', 'youtube,vimeo')
		.split(',')
		.map((provider) => provider.trim().toLowerCase())
		.filter((provider) => provider.length > 0) as VideoProvider[],

	/**
	 * Full-text search over CMS pages, backed by a Typesense instance.
	 *
	 * `enabled` is the feature flag: when `false`, indexing is a no-op and
	 * the admin search endpoint degrades (the page list falls back to its
	 * standard filtered query). When `true` but the Typesense node is
	 * unreachable, every operation degrades gracefully as well — a search
	 * outage never breaks the CMS.
	 */
	search: {
		enabled: env.get('SEARCH_ENABLED', false),
		host: env.get('TYPESENSE_HOST', 'localhost'),
		port: env.get('TYPESENSE_PORT', 8108),
		apiKey: env.get('TYPESENSE_API_KEY', ''),
		collection: env.get('TYPESENSE_COLLECTION', 'cms_page_translations'),
		/** Maximum number of hits returned by the admin search endpoint. */
		maxResults: env.get('TYPESENSE_SEARCH_LIMIT', 20),
	},
};

export default cmsConfig;
