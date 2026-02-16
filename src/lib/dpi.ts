/**
 * Calculate the effective DPI of an image on the canvas.
 * @param imgPixelWidth  Original image width in pixels
 * @param imgPixelHeight Original image height in pixels
 * @param displayWidth   Display width on canvas in CSS pixels
 * @param displayHeight  Display height on canvas in CSS pixels
 * @param canvasPPI      The PPI of the canvas working space (default 72 for screen)
 * @param targetDPI      The target print DPI (default 300)
 *
 * We assume the canvas is at 72 PPI (1 CSS px = 1/72 inch).
 * effectiveDPI = imgPixelWidth / (displayWidth / 72)
 */
export function calcEffectiveDPI(
  imgPixelWidth: number,
  displayWidth: number,
  canvasPPI = 72,
): number {
  if (displayWidth <= 0) return 0
  const displayInches = displayWidth / canvasPPI
  return imgPixelWidth / displayInches
}

export function isDPISafe(dpi: number, threshold = 300): boolean {
  return dpi >= threshold
}
