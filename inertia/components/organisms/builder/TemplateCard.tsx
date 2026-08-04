import { Data } from '@generated/data'
import { Icon } from '~/components/atoms/icon'

interface TemplateCardProps {
  template: Data.Template
  onClick: () => void
}

/**
 * Grid card showing a template's thumbnail (or a placeholder when it has none)
 * and its name. Shared by the builder's template pickers.
 */
export default function TemplateCard({ template, onClick }: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-2 p-3 rounded-lg border border-edge bg-sunken hover:bg-primary-soft hover:border-primary-mid transition-colors text-left group"
    >
      {template.thumbnail?.url ? (
        <div className="w-full aspect-[4/3] rounded-md overflow-hidden border border-edge bg-canvas">
          <img
            src={template.thumbnail.url}
            alt={template.name}
            className="w-full h-full object-cover lazy"
          />
        </div>
      ) : (
        <div className="w-full aspect-[4/3] rounded-md border border-dashed border-edge bg-canvas flex items-center justify-center">
          <Icon name="Image" size={18} className="text-ink-subtle" />
        </div>
      )}
      <span className="text-xs font-medium text-ink truncate w-full group-hover:text-ink-inverted transition-colors">
        {template.name}
      </span>
    </button>
  )
}
