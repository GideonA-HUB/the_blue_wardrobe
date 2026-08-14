import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import {
  getScrollPosition,
  restoreScrollPosition,
  saveScrollPosition,
} from '../lib/scrollMemory'

/**
 * - New pages (link clicks) open at the top.
 * - Browser Back/Forward restores the exact previous scroll position
 *   (e.g. the dress card you clicked on the homepage).
 * - In-page pagination (search-only) is left to the page handlers.
 */
export default function ScrollToTop() {
  const location = useLocation()
  const navType = useNavigationType()
  const prevPathname = useRef(location.pathname)
  const prevKey = useRef(location.key)

  useEffect(() => {
    const key = location.key
    const persist = () => saveScrollPosition(key, window.scrollY)
    window.addEventListener('scroll', persist, { passive: true })
    return () => {
      window.removeEventListener('scroll', persist)
      saveScrollPosition(key, window.scrollY)
    }
  }, [location.key])

  useLayoutEffect(() => {
    if (prevKey.current && prevKey.current !== location.key) {
      saveScrollPosition(prevKey.current, window.scrollY)
    }
    prevKey.current = location.key

    if (navType === 'POP') {
      restoreScrollPosition(location.key)
      prevPathname.current = location.pathname
      return
    }

    const pathnameChanged = prevPathname.current !== location.pathname
    prevPathname.current = location.pathname

    if (!pathnameChanged) {
      return
    }

    if (location.hash) {
      const id = location.hash.replace(/^#/, '')
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({ block: 'start', behavior: 'auto' })
        return
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.key, location.hash, location.pathname, navType])

  // After images/data load on Back, re-apply saved Y.
  useEffect(() => {
    if (navType !== 'POP') return
    if (getScrollPosition(location.key) == null) return
    const t1 = window.setTimeout(() => restoreScrollPosition(location.key), 400)
    const t2 = window.setTimeout(() => restoreScrollPosition(location.key), 900)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [location.key, navType])

  return null
}
