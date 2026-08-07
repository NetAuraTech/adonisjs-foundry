import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Data } from '@generated/data'
import { Modal } from '~/components/atoms/modal'
import { Button } from '~/components/atoms/button'
import { Icon } from '~/components/atoms/icon'
import { urlFor } from '~/client'
import TemplateCard from './TemplateCard'
import { useTemplates } from '~/components/cms/hooks/use_templates'
import { useTranslation } from '~/hooks/use_translation'
import type { PageEditorTranslations } from '#types/translations'

interface ApplyPageTemplateModalProps {
  pageId: number
  locale: string
  handleClose: () => void
  translations: PageEditorTranslations
}

export default function ApplyPageTemplateModal({
  pageId,
  locale,
  handleClose,
  translations,
}: ApplyPageTemplateModalProps) {
  const { t } = useTranslation(translations)
  const { templates, loading, error } = useTemplates('page')
  const [confirmTarget, setConfirmTarget] = useState<Data.Template.Template | null>(null)
  const [applying, setApplying] = useState(false)

  function handleConfirm() {
    if (!confirmTarget || applying) return
    setApplying(true)

    router.post(
      urlFor('admin.templates.apply_to_page', { id: confirmTarget.id }),
      { pageId, locale },
      {
        preserveScroll: true,
        onSuccess: () => {
          window.location.reload()
        },
        onError: () => {
          setApplying(false)
        },
      }
    )
  }

  return (
    <Modal handleClose={handleClose}>
      <div className="w-[520px] max-h-[70vh] overflow-y-auto rounded-xl bg-canvas border border-edge shadow-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-ink">{t('apply_page_template.title')}</h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-ink-subtle hover:text-ink transition-colors"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader" size={22} className="animate-spin text-ink-subtle" />
          </div>
        )}

        {error && <p className="text-xs text-danger text-center py-4">{error}</p>}

        {!loading && !error && templates.length === 0 && (
          <p className="text-xs text-ink-muted text-center py-4">{t('template_picker.empty')}</p>
        )}

        {!loading && !error && templates.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {templates.map((tpl) => (
              <TemplateCard key={tpl.id} template={tpl} onClick={() => setConfirmTarget(tpl)} />
            ))}
          </div>
        )}
      </div>

      {confirmTarget && (
        <div className="absolute inset-0 z-1002 flex items-center justify-center bg-black/60">
          <div className="w-[420px] rounded-xl bg-canvas border border-edge shadow-2xl p-5">
            <h4 className="text-sm font-semibold text-ink mb-2">
              {t('apply_page_template.title')}
            </h4>
            <p className="text-xs text-ink-muted mb-4">{t('apply_page_template.warning')}</p>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                fitContent
                disabled={applying}
                onClick={() => setConfirmTarget(null)}
              >
                {t('save_block_template.cancel')}
              </Button>
              <Button
                type="button"
                fitContent
                name="apply-template-confirm"
                loading={applying}
                onClick={handleConfirm}
              >
                {t('apply_page_template.apply_button')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
