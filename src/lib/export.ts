import { Canvas as FabricCanvas } from 'fabric'

/**
 * Export the sheet area as a 300 DPI PNG.
 * The canvas is at 72 PPI preview, so we multiply by 300/72 ≈ 4.167x.
 */
export function exportCanvas300DPI(canvas: FabricCanvas, sheetWidthInches: number, sheetHeightInches: number) {
  const multiplier = 300 / 72
  const ppi = 72
  const sheetW = sheetWidthInches * ppi
  const sheetH = sheetHeightInches * ppi

  // Save current viewport
  const origVpt = [...canvas.viewportTransform!]
  const origWidth = canvas.getWidth()
  const origHeight = canvas.getHeight()
  const origClipPath = canvas.clipPath
  const origBg = canvas.backgroundColor

  // Reset viewport to identity for export
  canvas.viewportTransform = [1, 0, 0, 1, 0, 0]
  canvas.setDimensions({ width: sheetW, height: sheetH })
  canvas.clipPath = undefined
  canvas.backgroundColor = '#ffffff'

  const dataURL = canvas.toDataURL({
    format: 'png',
    multiplier,
    quality: 1,
    left: 0,
    top: 0,
    width: sheetW,
    height: sheetH,
  })

  // Restore
  canvas.viewportTransform = origVpt as any
  canvas.setDimensions({ width: origWidth, height: origHeight })
  canvas.clipPath = origClipPath
  canvas.backgroundColor = origBg
  canvas.requestRenderAll()

  const link = document.createElement('a')
  link.download = 'gang-sheet-300dpi.png'
  link.href = dataURL
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
