import { Data } from '@generated/data'
import { Modal } from '~/components/atoms/modal'
import { Icon } from '~/components/atoms/icon'
import TemplateCard from './TemplateCard'
import { useTemplates } from '~/components/cms/hooks/use_templates'

interface TemplatePickerProps {
  handleSelect: (template: Data.Template.Template) => void
  handleClose: () => void
}

/**
 * Modal that fetches Block Templates from the JSON API and displays them as
 * a clickable grid. Selecting one deep-clones the template's root block
 * (with fresh ids for the full subtree) and passes it to the caller.
 *
 * Fetched lazily on mount — no data preloading.
 */
export default function TemplatePicker({ handleSelect, handleClose }: TemplatePickerProps) {
  const { templates, loading, error } = useTemplates('block')

  return (
    <Modal handleClose={handleClose}>
      <div className="w-[460px] max-h-[70vh] overflow-y-auto rounded-xl bg-canvas border border-edge shadow-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-ink">Block Templates</h3>
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
          <p className="text-xs text-ink-muted text-center py-4">No block templates yet.</p>
        )}

        {!loading && !error && templates.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {templates.map((tpl) => (
              <TemplateCard key={tpl.id} template={tpl} onClick={() => handleSelect(tpl)} />
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
