import { Head } from '@inertiajs/react'
import type { ResolvedPageContent } from '#cms/types/page'
import PageRenderer from '~/components/molecules/renderer/page_renderer'

interface TemplatePreviewProps {
  template: {
    id: number
    name: string
    type: 'page' | 'block'
    blockType: string | null
    content: ResolvedPageContent
    locale: string
  }
}

/**
 * SSR-rendered Template preview used for thumbnail capture.
 *
 * Loaded inside a hidden iframe (token-protected) by `captureTemplateThumbnail`.
 * It renders through the exact same `PageRenderer` as the editor/live view, so
 * the captured thumbnail matches the real render byte-for-byte. The container
 * carries `data-template-preview` so the capture targets only the content.
 */
export default function TemplatePreviewPage({ template }: TemplatePreviewProps) {
  return (
    <>
      <Head title={template.name} />
      <div
        data-template-preview
        className="w-[1024px] aspect-4/3 overflow-hidden bg-white box-border flex items-center justify-center p-10"
      >
        <div className="w-full">
          <PageRenderer content={template.content} pageId={0} locale={template.locale} />
        </div>
      </div>
    </>
  )
}
