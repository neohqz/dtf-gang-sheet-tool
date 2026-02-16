import { AlertTriangle, X } from 'lucide-react'

interface Props {
  dpi: number
  onDismiss: () => void
}

export default function DPIWarning({ dpi, onDismiss }: Props) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-900/90 border border-red-600 text-red-100 px-4 py-2 rounded-lg flex items-center gap-3 shadow-xl text-sm">
      <AlertTriangle size={18} className="text-red-400 shrink-0" />
      <span>
        Low resolution: <strong>{dpi} DPI</strong> — image may appear pixelated at print. Target ≥ 300 DPI.
      </span>
      <button onClick={onDismiss} className="ml-2 hover:text-white">
        <X size={16} />
      </button>
    </div>
  )
}
