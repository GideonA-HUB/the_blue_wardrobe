import React, { useState } from 'react'
import api from '../lib/api'
import { DottedSurface } from './ui/dotted-surface'

export default function NewsletterBanner() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('submitting')
    try {
      await api.post('/subscribe/', { email })
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="relative mt-20 mb-16 py-16 sm:py-20 md:py-24 overflow-hidden bg-gradient-to-br from-blue-50/30 to-white/40">
      {/* Dotted Surface Background */}
      <DottedSurface className="opacity-100" />
      
      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-blue-wardrobe-dark mb-4 sm:mb-6">
          The Dress Diaries List
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed mb-8 sm:mb-10">
          Be the first to know when new DDC capsules drop, with private previews and global shipping windows.
        </p>
        
        {/* Mobile-first responsive form */}
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 w-full sm:w-auto border-2 border-gray-300 rounded-full px-4 sm:px-6 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all text-gray-700 placeholder-gray-400"
            required
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base luxury-shadow hover:luxury-shadow-lg transform hover:scale-105"
          >
            {status === 'submitting' ? 'Joining…' : 'Join the list'}
          </button>
        </form>
        
        {/* Status messages with mobile-optimized spacing */}
        {status === 'success' && (
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-emerald-600 font-medium px-4">
            ✓ You're in. Watch your inbox for the next diary.
          </p>
        )}
        {status === 'error' && (
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-red-600 px-4">
            Could not subscribe. Please try again.
          </p>
        )}
      </div>
    </section>
  )
}


