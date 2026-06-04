import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'

type ThemeToggleProps = {
  className?: string
  showLabel?: boolean
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`group inline-flex items-center gap-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-luxury-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${className}`}
    >
      {showLabel && (
        <span className="text-xs font-medium tracking-wide text-blue-wardrobe-dark dark:text-slate-200">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
      <span
        className={`relative flex h-8 w-[3.25rem] shrink-0 items-center rounded-full border p-0.5 shadow-inner transition-colors duration-300 sm:h-9 sm:w-[3.5rem] ${
          isDark
            ? 'border-blue-luxury-500/40 bg-gradient-to-r from-slate-800 via-slate-900 to-blue-950'
            : 'border-blue-wardrobe-light/25 bg-gradient-to-r from-sky-50 via-white to-blue-50'
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 520, damping: 32 }}
          className={`absolute top-0.5 flex h-7 w-7 items-center justify-center rounded-full shadow-md sm:h-8 sm:w-8 ${
            isDark
              ? 'left-[calc(100%-1.875rem)] bg-gradient-to-br from-blue-luxury-300 to-blue-luxury-500 text-slate-950'
              : 'left-0.5 bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950'
          }`}
        >
          {isDark ? (
            <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.25} aria-hidden />
          ) : (
            <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.25} aria-hidden />
          )}
        </motion.span>
        <Sun
          className={`pointer-events-none absolute left-2 h-3 w-3 transition-opacity sm:left-2.5 sm:h-3.5 sm:w-3.5 ${
            isDark ? 'text-slate-500 opacity-35' : 'text-amber-600/70 opacity-0'
          }`}
          aria-hidden
        />
        <Moon
          className={`pointer-events-none absolute right-2 h-3 w-3 transition-opacity sm:right-2.5 sm:h-3.5 sm:w-3.5 ${
            isDark ? 'text-slate-300/80 opacity-0' : 'text-blue-wardrobe-light/50 opacity-50'
          }`}
          aria-hidden
        />
      </span>
    </button>
  )
}
