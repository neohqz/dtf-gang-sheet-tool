import { Canvas as FabricCanvas } from 'fabric'

/**
 * Export the canvas as a 300 DPI PNG.
 * The canvas is at 72 PPI preview, so we multiply by 300/72 ≈ 4.167x.
 */
export function exportCanvas300DPI(canvas: FabricCanvas) {
  const multiplier = 300 / 72

  const dataURL = canvas.toDataURL({
    format: 'png',
    multiplier,
    quality: 1,
  })

  const link = document.createElement('a')
  link.download = 'gang-sheet-300dpi.png'
  link.href = dataURL
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
