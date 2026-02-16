import type { SelectedObjectInfo } from '../App'
import { cn } from '../lib/utils'

interface Props {
  selected: SelectedObjectInfo | null
  onColorChange: (color: string) => void
}

export default function PropertiesPanel({ selected, onColorChange }: Props) {
  if (!selected) {
    return (
      <div className="w-56 bg-gray-800 border-l border-gray-700 p-4 text-gray-500 text-sm">
        Select an object to view properties
      </div>
    )
  }

  const dpiOk = selected.dpi === undefined || selected.dpi >= 300
  const isText = selected.type === 'i-text' || selected.type === 'text'

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
      {isText && (
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Color</span>
          <input
            type="color"
            value={selected.fill || '#000000'}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-8 h-6 rounded border border-gray-600 bg-transparent cursor-pointer"
          />
        </div>
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
