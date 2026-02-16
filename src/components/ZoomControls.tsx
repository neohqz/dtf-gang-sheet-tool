import { Minus, Plus } from 'lucide-react'

interface Props {
  zoom: number
  onZoomChange: (zoom: number) => void
}

const ZOOM_STEPS = [10, 25, 50, 75, 100, 125, 150, 200, 300, 400]

export default function ZoomControls({ zoom, onZoomChange }: Props) {
  const zoomIn = () => {
    const next = ZOOM_STEPS.find(z => z > zoom) ?? ZOOM_STEPS[ZOOM_STEPS.length - 1]
    onZoomChange(next)
  }
  const zoomOut = () => {
    const next = [...ZOOM_STEPS].reverse().find(z => z < zoom) ?? ZOOM_STEPS[0]
    onZoomChange(next)
  }

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 shadow-xl">
      <button onClick={zoomOut} className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white">
        <Minus size={16} />
      </button>
      <span className="text-sm text-gray-300 w-12 text-center select-none">{zoom}%</span>
      <button onClick={zoomIn} className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white">
        <Plus size={16} />
      </button>
    </div>
  )
}
