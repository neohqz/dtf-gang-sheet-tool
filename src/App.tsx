import { useState, useRef, useCallback } from 'react'
import { Canvas as FabricCanvas } from 'fabric'
import Sidebar from './components/Sidebar'
import GangSheetCanvas from './components/GangSheetCanvas'
import PropertiesPanel from './components/PropertiesPanel'
import DPIWarning from './components/DPIWarning'
import ZoomControls from './components/ZoomControls'
import TopNavbar from './components/TopNavbar'
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
  fill?: string
}

export default function App() {
  const [selectedObject, setSelectedObject] = useState<SelectedObjectInfo | null>(null)
  const [dpiWarning, setDpiWarning] = useState<{ dpi: number } | null>(null)
  const [zoom, setZoom] = useState(100)
  const [sheetWidth, setSheetWidth] = useState(22) // inches
  const [sheetHeight, setSheetHeight] = useState(60) // inches
  const canvasRef = useRef<FabricCanvas | null>(null)

  const handleExport = useCallback(() => {
    if (canvasRef.current) {
      exportCanvas300DPI(canvasRef.current, sheetWidth, sheetHeight)
    }
  }, [sheetWidth, sheetHeight])

  const handleZoom = useCallback((newZoom: number) => {
    setZoom(newZoom)
  }, [])

  const handleColorChange = useCallback((color: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
      obj.set('fill', color)
      canvas.requestRenderAll()
      setSelectedObject(prev => prev ? { ...prev, fill: color } : prev)
    }
  }, [])

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 text-white">
      <TopNavbar
        sheetWidth={sheetWidth}
        sheetHeight={sheetHeight}
        onSheetWidthChange={setSheetWidth}
        onSheetHeightChange={setSheetHeight}
        onExport={handleExport}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar canvasRef={canvasRef} />
        <div className="flex-1 relative overflow-hidden bg-gray-950">
          <GangSheetCanvas
            canvasRef={canvasRef}
            onSelect={setSelectedObject}
            onDpiWarning={setDpiWarning}
            zoom={zoom}
            onZoomChange={handleZoom}
            sheetWidthInches={sheetWidth}
            sheetHeightInches={sheetHeight}
          />
          <ZoomControls zoom={zoom} onZoomChange={handleZoom} />
          {dpiWarning && <DPIWarning dpi={dpiWarning.dpi} onDismiss={() => setDpiWarning(null)} />}
        </div>
        <PropertiesPanel selected={selectedObject} onColorChange={handleColorChange} />
      </div>
    </div>
  )
}
