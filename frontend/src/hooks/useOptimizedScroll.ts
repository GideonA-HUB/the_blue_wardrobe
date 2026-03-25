import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Optimized scroll hook that uses requestAnimationFrame for smooth scrolling
 * Prevents janky animations by throttling scroll events
 */
export const useOptimizedScroll = () => {
  const [scrollY, setScrollY] = useState(0)
  const ticking = useRef(false)

  const updateScrollY = useCallback(() => {
    setScrollY(window.scrollY)
    ticking.current = false
  }, [])

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(updateScrollY)
      ticking.current = true
    }
  }, [updateScrollY])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return scrollY
}
