import type { SelectedObjectInfo } from '../App'
import { cn } from '../lib/utils'

interface Props {
  selected: SelectedObjectInfo | null
}

export default function PropertiesPanel({ selected }: Props) {
  if (!selected) {
    return (
      <div className="w-56 bg-gray-800 border-l border-gray-700 p-4 text-gray-500 text-sm">
        Select an object to view properties
      </div>
    )
  }

  const dpiOk = selected.dpi === undefined || selected.dpi >= 300

  return (
    <div className="w-56 bg-gray-800 border-l border-gray-700 p-4 text-sm space-y-3">
      <h2 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Properties</h2>
      <Row label="Type" value={selected.type} />
      <Row label="Position" value={`${selected.left}, ${selected.top}`} />
      <Row label="Size" value={`${selected.width} × ${selected.height}`} />
      <Row label="Scale" value={`${selected.scaleX} × ${selected.scaleY}`} />
      {selected.dpi !== undefined && (
        <Row
          label="DPI"
          value={`${selected.dpi}`}
          className={cn(!dpiOk && 'text-red-400 font-semibold')}
        />
      )}
    </div>
  )
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className={cn('text-white', className)}>{value}</span>
    </div>
  )
}
