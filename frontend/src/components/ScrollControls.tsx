import React, { useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function ScrollControls() {
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)

  const updateVisibility = useCallback(() => {
    const doc = document.documentElement
    const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight)
    const y = window.scrollY
    setCanScrollUp(y > 80)
    setCanScrollDown(y < maxScroll - 80)
  }, [])

  useEffect(() => {
    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    window.addEventListener('resize', updateVisibility)
    return () => {
      window.removeEventListener('scroll', updateVisibility)
      window.removeEventListener('resize', updateVisibility)
    }
  }, [updateVisibility])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToBottom = () => {
    const doc = document.documentElement
    window.scrollTo({ top: doc.scrollHeight, behavior: 'smooth' })
  }

  if (!canScrollUp && !canScrollDown) return null

  return (
    <div
      className="fixed bottom-4 right-3 sm:bottom-5 sm:right-4 z-40 flex flex-col gap-2 pointer-events-none"
      aria-label="Page scroll shortcuts"
    >
      {canScrollUp && (
        <button
          type="button"
          onClick={scrollToTop}
          className="pointer-events-auto group flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-wardrobe-dark to-blue-wardrobe-light text-white shadow-lg shadow-blue-900/25 ring-1 ring-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-900/35 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-luxury-300 focus-visible:ring-offset-2 dark:ring-offset-slate-950"
          aria-label="Scroll to top"
          title="Top of page"
        >
          <ChevronUp className="h-4 w-4 sm:h-[18px] sm:w-[18px] transition-transform group-hover:-translate-y-0.5" strokeWidth={2.25} />
        </button>
      )}
      {canScrollDown && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="pointer-events-auto group flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-wardrobe-light to-blue-luxury-400 text-white shadow-lg shadow-blue-900/25 ring-1 ring-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-900/35 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-luxury-300 focus-visible:ring-offset-2 dark:ring-offset-slate-950"
          aria-label="Scroll to bottom"
          title="Bottom of page"
        >
          <ChevronDown className="h-4 w-4 sm:h-[18px] sm:w-[18px] transition-transform group-hover:translate-y-0.5" strokeWidth={2.25} />
        </button>
      )}
    </div>
  )
}
