import { useEffect, useRef, type RefObject, useCallback } from 'react'
import { Canvas as FabricCanvas, FabricImage } from 'fabric'
import type { SelectedObjectInfo } from '../App'
import { calcEffectiveDPI, isDPISafe } from '../lib/dpi'

interface Props {
  canvasRef: RefObject<FabricCanvas | null>
  onSelect: (info: SelectedObjectInfo | null) => void
  onDpiWarning: (warning: { dpi: number } | null) => void
}

// Canvas size in pixels (represents a 22x60 inch sheet at 72 PPI preview)
const CANVAS_W = 22 * 72
const CANVAS_H = 60 * 72

export default function GangSheetCanvas({ canvasRef, onSelect, onDpiWarning }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)

  const checkDPI = useCallback(
    (obj: any) => {
      if (obj && obj instanceof FabricImage) {
        const el = obj.getElement() as HTMLImageElement
        const displayW = obj.getScaledWidth()
        const dpi = calcEffectiveDPI(el.naturalWidth, displayW)
        if (!isDPISafe(dpi)) {
          onDpiWarning({ dpi: Math.round(dpi) })
        } else {
          onDpiWarning(null)
        }
        return Math.round(dpi)
      }
      return undefined
    },
    [onDpiWarning],
  )

  const emitSelection = useCallback(
    (canvas: FabricCanvas) => {
      const obj = canvas.getActiveObject()
      if (!obj) {
        onSelect(null)
        onDpiWarning(null)
        return
      }
      const dpi = checkDPI(obj)
      onSelect({
        type: obj.type ?? 'unknown',
        width: Math.round(obj.getScaledWidth()),
        height: Math.round(obj.getScaledHeight()),
        left: Math.round(obj.left ?? 0),
        top: Math.round(obj.top ?? 0),
        scaleX: +(obj.scaleX ?? 1).toFixed(2),
        scaleY: +(obj.scaleY ?? 1).toFixed(2),
        dpi,
      })
    },
    [onSelect, onDpiWarning, checkDPI],
  )

  useEffect(() => {
    if (!canvasElRef.current) return
    const canvas = new FabricCanvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: '#ffffff',
      selection: true,
    })
    canvasRef.current = canvas

    canvas.on('selection:created', () => emitSelection(canvas))
    canvas.on('selection:updated', () => emitSelection(canvas))
    canvas.on('selection:cleared', () => {
      onSelect(null)
      onDpiWarning(null)
    })
    canvas.on('object:scaling', () => emitSelection(canvas))
    canvas.on('object:modified', () => emitSelection(canvas))
    canvas.on('object:moving', () => emitSelection(canvas))

    return () => {
      canvas.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Drag & drop images onto canvas
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (!file || !file.type.startsWith('image/') || !canvasRef.current) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const imgEl = new Image()
        imgEl.onload = () => {
          const canvas = canvasRef.current!
          const rect = containerRef.current!.getBoundingClientRect()
          const fImg = new FabricImage(imgEl)
          fImg.scaleToWidth(200)
          fImg.set({
            left: e.clientX - rect.left + (containerRef.current?.scrollLeft ?? 0),
            top: e.clientY - rect.top + (containerRef.current?.scrollTop ?? 0),
          })
          canvas.add(fImg)
          canvas.setActiveObject(fImg)
          canvas.requestRenderAll()
        }
        imgEl.src = ev.target?.result as string
      }
      reader.readAsDataURL(file)
    },
    [canvasRef],
  )

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto p-8"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="inline-block shadow-2xl">
        <canvas ref={canvasElRef} />
      </div>
    </div>
  )
}
