/**
 * Remember scroll positions per React Router history key so Back/Forward
 * restore the exact spot (including which dress was on screen).
 */
const positions = new Map<string, number>()

export function saveScrollPosition(key: string, y: number) {
  if (!key) return
  positions.set(key, y)
}

export function getScrollPosition(key: string): number | undefined {
  return positions.get(key)
}

export function restoreScrollPosition(key: string) {
  const y = positions.get(key)
  if (y == null) return
  const apply = () => {
    window.scrollTo({ top: y, left: 0, behavior: 'auto' })
  }
  apply()
  requestAnimationFrame(apply)
  window.setTimeout(apply, 50)
  window.setTimeout(apply, 250)
  window.setTimeout(apply, 600)
  window.setTimeout(apply, 1000)
}
