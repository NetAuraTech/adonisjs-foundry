import { Head } from '@inertiajs/react'
import type { ResolvedPageContent } from '#types/page'
import PageRenderer from '~/components/molecules/renderer/page_renderer'

type PageProps = {
  id: number
  locale: string
  title: string
  metaTitle: string | null
  metaDescription: string | null
  metaImage: string | null
  content: ResolvedPageContent
}

/**
 * Public-facing Inertia page for rendered pages.
 *
 * Handles SEO via Inertia's `<Head>` component and delegates the actual
 * block rendering to `PageRenderer`.
 */
export default function PageShowPage(props: PageProps) {
  const { id, locale, title, metaTitle, metaDescription, metaImage, content } = props
  const seoTitle = metaTitle ?? title

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        <meta property="og:title" content={seoTitle} />
        {metaDescription && <meta property="og:description" content={metaDescription} />}
        {metaImage && <meta property="og:image" content={metaImage} />}
        <meta property="og:type" content="website" />
      </Head>

      <PageRenderer content={content} pageId={id} locale={locale} />
    </>
  )
}
