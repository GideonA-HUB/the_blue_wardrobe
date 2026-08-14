import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import {
  captureScroll,
  isInternalAppLink,
  restoreWhenReady,
  saveScrollPosition,
  withInstantScroll,
} from '../lib/scrollMemory'

/**
 * New pages open at the top. Back/Forward restores the exact dress/card
 * the shopper left from — captured on link click, before the next page
 * scrolls to 0.
 */
export default function ScrollToTop() {
  const location = useLocation()
  const navType = useNavigationType()
  const prevPathname = useRef(location.pathname)
  const locationKeyRef = useRef(location.key)

  locationKeyRef.current = location.key

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (!isInternalAppLink(anchor)) return
      const cardId = anchor.id || undefined
      captureScroll(locationKeyRef.current, cardId)
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [])

  useEffect(() => {
    const key = location.key
    const persist = () => saveScrollPosition(key, window.scrollY)
    window.addEventListener('scroll', persist, { passive: true })
    return () => {
      window.removeEventListener('scroll', persist)
      // Do not persist here — the next page may already be at Y=0.
    }
  }, [location.key])

  useLayoutEffect(() => {
    if (navType === 'POP') {
      prevPathname.current = location.pathname
      return restoreWhenReady(location.key)
    }

    const pathnameChanged = prevPathname.current !== location.pathname
    prevPathname.current = location.pathname

    if (!pathnameChanged) return

    if (location.hash) {
      const id = location.hash.replace(/^#/, '')
      const el = document.getElementById(id)
      if (el) {
        withInstantScroll(() => {
          el.scrollIntoView({ block: 'start', behavior: 'auto' })
        })
        return
      }
    }

    withInstantScroll(() => {
      window.scrollTo(0, 0)
    })
  }, [location.key, location.hash, location.pathname, navType])

  return null
}
