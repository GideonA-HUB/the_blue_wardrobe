/**
 * Scroll memory for Back/Forward.
 *
 * Capture the offset (and the dress card id) on pointer-down — before the
 * next route scrolls to the top. Never overwrite that snapshot with 0.
 */
const positions = new Map<string, number>()
const targetIds = new Map<string, string>()
const frozenKeys = new Set<string>()

const STORAGE_PREFIX = 'tbw-scroll:'
const STORAGE_ID_PREFIX = 'tbw-scroll-id:'

function readY(key: string): number | undefined {
  const mem = positions.get(key)
  if (mem != null) return mem
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key)
    if (raw == null || raw === '') return undefined
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  } catch {
    return undefined
  }
}

function readTargetId(key: string): string | undefined {
  const mem = targetIds.get(key)
  if (mem) return mem
  try {
    return sessionStorage.getItem(STORAGE_ID_PREFIX + key) || undefined
  } catch {
    return undefined
  }
}

function writeY(key: string, y: number) {
  positions.set(key, y)
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, String(Math.max(0, Math.round(y))))
  } catch {
    /* private mode */
  }
}

function writeTargetId(key: string, id: string) {
  targetIds.set(key, id)
  try {
    sessionStorage.setItem(STORAGE_ID_PREFIX + key, id)
  } catch {
    /* private mode */
  }
}

export function getScrollPosition(key: string): number | undefined {
  return readY(key)
}

export function saveScrollPosition(key: string, y: number) {
  if (!key || frozenKeys.has(key)) return
  writeY(key, y)
}

export function captureScroll(key: string, targetId?: string) {
  if (!key) return
  writeY(key, window.scrollY)
  if (targetId) writeTargetId(key, targetId)
  frozenKeys.add(key)
}

export function unfreezeScroll(key: string) {
  frozenKeys.delete(key)
}

export function withInstantScroll(fn: () => void) {
  const root = document.documentElement
  const previous = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  fn()
  root.style.scrollBehavior = previous
}

export function restoreScrollPosition(key: string) {
  const targetId = readTargetId(key)
  const el = targetId ? document.getElementById(targetId) : null
  if (el) {
    withInstantScroll(() => {
      el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' })
    })
    return true
  }
  const y = readY(key)
  if (y == null) return false
  withInstantScroll(() => {
    window.scrollTo(0, y)
  })
  return true
}

export function restoreWhenReady(key: string): () => void {
  const y = readY(key)
  const targetId = readTargetId(key)
  if (y == null && !targetId) return () => {}

  let stopped = false
  let tries = 0

  const attempt = () => {
    if (stopped) return true
    tries += 1

    if (targetId) {
      const el = document.getElementById(targetId)
      if (el || tries > 40) {
        restoreScrollPosition(key)
        stopped = true
        unfreezeScroll(key)
        return true
      }
      return false
    }

    restoreScrollPosition(key)
    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const tallEnough = y == null ? tries > 2 : maxY >= y - 4
    if (tallEnough || tries > 40) {
      stopped = true
      unfreezeScroll(key)
      return true
    }
    return false
  }

  attempt()
  const interval = window.setInterval(() => {
    if (attempt()) window.clearInterval(interval)
  }, 50)

  let ro: ResizeObserver | null = null
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => {
      if (attempt()) {
        ro?.disconnect()
        window.clearInterval(interval)
      }
    })
    ro.observe(document.documentElement)
  }

  return () => {
    stopped = true
    window.clearInterval(interval)
    ro?.disconnect()
  }
}

export function isInternalAppLink(anchor: HTMLAnchorElement): boolean {
  if (!anchor.href) return false
  if (anchor.target && anchor.target !== '_self') return false
  if (anchor.hasAttribute('download')) return false
  try {
    const url = new URL(anchor.href, window.location.href)
    if (url.origin !== window.location.origin) return false
    const nextPath = url.pathname.replace(/\/$/, '') || '/'
    const herePath = window.location.pathname.replace(/\/$/, '') || '/'
    if (nextPath === herePath && url.search === window.location.search) return false
    return true
  } catch {
    return false
  }
}
