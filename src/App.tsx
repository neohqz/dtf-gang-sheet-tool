import { useState, useRef, useCallback } from 'react'
import { Canvas as FabricCanvas } from 'fabric'
import Sidebar from './components/Sidebar'
import GangSheetCanvas from './components/GangSheetCanvas'
import PropertiesPanel from './components/PropertiesPanel'
import Ruler from './components/Ruler'
import DPIWarning from './components/DPIWarning'
import { exportCanvas300DPI } from './lib/export'

export interface SelectedObjectInfo {
  type: string
  width: number
  height: number
  left: number
  top: number
  scaleX: number
  scaleY: number
  dpi?: number
}

export default function App() {
  const [selectedObject, setSelectedObject] = useState<SelectedObjectInfo | null>(null)
  const [dpiWarning, setDpiWarning] = useState<{ dpi: number } | null>(null)
  const canvasRef = useRef<FabricCanvas | null>(null)

  const handleExport = useCallback(() => {
    if (canvasRef.current) {
      exportCanvas300DPI(canvasRef.current)
    }
  }, [])

  return (
    <div className="flex h-full w-full bg-gray-900 text-white">
      <Sidebar canvasRef={canvasRef} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <h1 className="text-lg font-semibold">DTF Gang Sheet Tool</h1>
          <button
            onClick={handleExport}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors"
          >
            Export 300 DPI PNG
          </button>
        </div>
        <div className="flex-1 relative overflow-auto bg-gray-950">
          <Ruler direction="horizontal" />
          <div className="flex">
            <Ruler direction="vertical" />
            <GangSheetCanvas
              canvasRef={canvasRef}
              onSelect={setSelectedObject}
              onDpiWarning={setDpiWarning}
            />
          </div>
        </div>
        {dpiWarning && <DPIWarning dpi={dpiWarning.dpi} onDismiss={() => setDpiWarning(null)} />}
      </div>
      <PropertiesPanel selected={selectedObject} />
    </div>
  )
}
