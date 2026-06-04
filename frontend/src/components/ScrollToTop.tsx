import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Resets scroll position on every client-side route change so new pages
 * always open at the top (fixes design/product pages opening at the bottom).
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useLayoutEffect(() => {
    if (hash) {
      const id = hash.replace(/^#/, '')
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({ block: 'start', behavior: 'auto' })
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, search, hash])

  return null
}
