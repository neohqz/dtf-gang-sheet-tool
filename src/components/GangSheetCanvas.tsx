import { useEffect, useRef, type RefObject, useCallback } from 'react'
import { Canvas as FabricCanvas, FabricImage, Rect } from 'fabric'
import type { SelectedObjectInfo } from '../App'
import { calcEffectiveDPI, isDPISafe } from '../lib/dpi'

interface Props {
  canvasRef: RefObject<FabricCanvas | null>
  onSelect: (info: SelectedObjectInfo | null) => void
  onDpiWarning: (warning: { dpi: number } | null) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  sheetWidthInches: number
  sheetHeightInches: number
}

const PPI = 72

export default function GangSheetCanvas({ canvasRef, onSelect, onDpiWarning, zoom, onZoomChange, sheetWidthInches, sheetHeightInches }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const sheetRectRef = useRef<Rect | null>(null)
  const clipRectRef = useRef<Rect | null>(null)

  const sheetW = sheetWidthInches * PPI
  const sheetH = sheetHeightInches * PPI

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
        fill: typeof obj.fill === 'string' ? obj.fill : undefined,
      })
    },
    [onSelect, onDpiWarning, checkDPI],
  )

  // Initialize canvas once
  useEffect(() => {
    if (!canvasElRef.current || !containerRef.current) return

    const container = containerRef.current
    const canvas = new FabricCanvas(canvasElRef.current, {
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: '#1a1a2e',
      selection: true,
    })
    canvasRef.current = canvas

    // Create sheet background rect (not selectable)
    const sheet = new Rect({
      width: sheetW,
      height: sheetH,
      fill: '#ffffff',
      stroke: '#555',
      strokeWidth: 1,
      selectable: false,
      evented: false,
      excludeFromExport: false,
    })
    canvas.add(sheet)
    canvas.sendObjectToBack(sheet)
    sheetRectRef.current = sheet

    // Create clip path for objects
    const clip = new Rect({
      width: sheetW,
      height: sheetH,
      absolutePositioned: true,
    })
    clipRectRef.current = clip
    canvas.clipPath = clip

    // Center the sheet
    const vpt = canvas.viewportTransform!
    vpt[4] = (container.clientWidth - sheetW) / 2
    vpt[5] = (container.clientHeight - sheetH) / 2
    clip.set({ left: vpt[4], top: vpt[5] })
    sheet.set({ left: 0, top: 0 })

    canvas.on('selection:created', () => emitSelection(canvas))
    canvas.on('selection:updated', () => emitSelection(canvas))
    canvas.on('selection:cleared', () => { onSelect(null); onDpiWarning(null) })
    canvas.on('object:scaling', () => emitSelection(canvas))
    canvas.on('object:modified', () => emitSelection(canvas))
    canvas.on('object:moving', (e) => {
      // Constrain objects to sheet area
      const obj = e.target
      if (!obj || obj === sheetRectRef.current) return
      const bound = obj.getBoundingRect()
      const sw = sheetW, sh = sheetH
      // Prevent fully outside: at least 20px must remain inside
      const margin = 20
      if (bound.left + bound.width < margin) obj.set('left', (obj.left ?? 0) + (margin - bound.left - bound.width))
      if (bound.top + bound.height < margin) obj.set('top', (obj.top ?? 0) + (margin - bound.top - bound.height))
      if (bound.left > sw - margin) obj.set('left', (obj.left ?? 0) - (bound.left - sw + margin))
      if (bound.top > sh - margin) obj.set('top', (obj.top ?? 0) - (bound.top - sh + margin))
      emitSelection(canvas)
    })

    // Mouse wheel zoom
    canvas.on('mouse:wheel', (opt) => {
      const e = opt.e as WheelEvent
      e.preventDefault()
      e.stopPropagation()
      let newZoom = canvas.getZoom() * (e.deltaY < 0 ? 1.1 : 0.9)
      newZoom = Math.max(0.1, Math.min(4, newZoom))
      const point = canvas.getViewportPoint(opt.e)
      canvas.zoomToPoint(point, newZoom)
      updateClipPosition(canvas)
      onZoomChange(Math.round(newZoom * 100))
    })

    // Panning with middle mouse or alt+drag
    let isPanning = false
    let lastX = 0, lastY = 0
    canvas.on('mouse:down', (opt) => {
      const e = opt.e as MouseEvent
      if (e.altKey || e.button === 1) {
        isPanning = true
        lastX = e.clientX
        lastY = e.clientY
        e.preventDefault()
      }
    })
    canvas.on('mouse:move', (opt) => {
      if (!isPanning) return
      const e = opt.e as MouseEvent
      const vpt = canvas.viewportTransform!
      vpt[4] += e.clientX - lastX
      vpt[5] += e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      updateClipPosition(canvas)
      canvas.requestRenderAll()
    })
    canvas.on('mouse:up', () => { isPanning = false })

    canvas.requestRenderAll()

    // Resize observer
    const ro = new ResizeObserver(() => {
      canvas.setDimensions({ width: container.clientWidth, height: container.clientHeight })
      canvas.requestRenderAll()
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
      canvas.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateClipPosition = (canvas: FabricCanvas) => {
    const clip = clipRectRef.current
    if (!clip) return
    const vpt = canvas.viewportTransform!
    const z = canvas.getZoom()
    clip.set({
      left: vpt[4],
      top: vpt[5],
      scaleX: z,
      scaleY: z,
    })
  }

  // Update zoom from prop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const newZoom = zoom / 100
    const center = canvas.getCenterPoint()
    canvas.zoomToPoint(center, newZoom)
    updateClipPosition(canvas)
    canvas.requestRenderAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom])

  // Update sheet size
  useEffect(() => {
    const canvas = canvasRef.current
    const sheet = sheetRectRef.current
    const clip = clipRectRef.current
    if (!canvas || !sheet || !clip) return

    sheet.set({ width: sheetW, height: sheetH })
    clip.set({ width: sheetW, height: sheetH })
    updateClipPosition(canvas)
    canvas.requestRenderAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetW, sheetH])

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
          const fImg = new FabricImage(imgEl)
          fImg.scaleToWidth(200)
          // Place relative to sheet coordinates
          const vpt = canvas.viewportTransform!
          const zoom = canvas.getZoom()
          const rect = containerRef.current!.getBoundingClientRect()
          const x = (e.clientX - rect.left - vpt[4]) / zoom
          const y = (e.clientY - rect.top - vpt[5]) / zoom
          fImg.set({ left: x, top: y })
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
      className="w-full h-full"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <canvas ref={canvasElRef} />
    </div>
  )
}
