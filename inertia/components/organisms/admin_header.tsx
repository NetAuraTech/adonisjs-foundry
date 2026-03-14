interface AdminHeaderProps {
  handleClick: () => void
}

export function AdminHeader(props: AdminHeaderProps) {
  const { handleClick } = props

  return (
    <header className="flex items-center justify-between p-4 bg-neutral-200 border-b-2 border-neutral-300 sticky top-0 z-50">
      <button
        onClick={handleClick}
        className="p-2 rounded text-primary-50 bg-primary-700 hover:bg-primary-800 transitions-colors cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <svg
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </header>
  )
}
