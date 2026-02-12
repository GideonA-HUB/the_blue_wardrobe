import React, { useState } from 'react'
import api from '../lib/api'

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
    <section className="mt-20 mb-16 py-16 bg-gradient-to-br from-blue-50 to-white border-t border-gray-200">
      <div className="max-w-3xl mx-auto text-center px-4">
        <h2 className="text-3xl md:text-4xl font-serif font-semibold text-blue-wardrobe-dark mb-4">
          The Dress Diaries List
        </h2>
        <p className="mt-2 text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
          Be the first to know when new DDC capsules drop, with private previews and global shipping windows.
        </p>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border-2 border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all text-gray-700 placeholder-gray-400"
            required
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="px-8 py-3 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium luxury-shadow hover:luxury-shadow-lg transform hover:scale-105"
          >
            {status === 'submitting' ? 'Joining…' : 'Join the list'}
          </button>
        </form>
        {status === 'success' && (
          <p className="mt-4 text-sm text-emerald-600 font-medium">✓ You're in. Watch your inbox for the next diary.</p>
        )}
        {status === 'error' && (
          <p className="mt-4 text-sm text-red-600">Could not subscribe. Please try again.</p>
        )}
      </div>
    </section>
  )
}


