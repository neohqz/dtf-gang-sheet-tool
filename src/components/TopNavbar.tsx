interface Props {
  sheetWidth: number
  sheetHeight: number
  onSheetWidthChange: (w: number) => void
  onSheetHeightChange: (h: number) => void
  onExport: () => void
}

export default function TopNavbar({ sheetWidth, sheetHeight, onSheetWidthChange, onSheetHeightChange, onExport }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 shrink-0">
      <h1 className="text-lg font-semibold">DTF Gang Sheet Tool</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-400">Width (in):</label>
          <input
            type="number"
            min={1}
            max={100}
            step={0.5}
            value={sheetWidth}
            onChange={(e) => onSheetWidthChange(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          />
          <label className="text-gray-400 ml-2">Height (in):</label>
          <input
            type="number"
            min={1}
            max={200}
            step={0.5}
            value={sheetHeight}
            onChange={(e) => onSheetHeightChange(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          />
        </div>
        <button
          onClick={onExport}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors"
        >
          Export 300 DPI PNG
        </button>
      </div>
    </div>
  )
}
