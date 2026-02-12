import React, { useState } from 'react'
import api from '../lib/api'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      await api.post('/contact/', { name, email, message })
      setStatus('success')
      setMessage('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="relative py-12 md:py-20 bg-gradient-to-b from-blue-50 via-white to-blue-50/40 overflow-hidden">
      {/* Subtle background orbs for depth */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-wardrobe-light/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-blue-wardrobe-dark/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-white rounded-full blur-3xl opacity-70" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-blue-wardrobe-dark mb-4 tracking-wide">
            Contact the Atelier
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            For bespoke inquiries, sizing guidance or private viewings of The Dress Diaries, leave a note for the designer.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="relative luxury-shadow-lg rounded-3xl p-6 md:p-10 bg-white/90 backdrop-blur-md space-y-6 animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold tracking-[0.18em] text-blue-wardrobe-dark/70 uppercase mb-2">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all placeholder-gray-400"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-[0.18em] text-blue-wardrobe-dark/70 uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all placeholder-gray-400"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-[0.18em] text-blue-wardrobe-dark/70 uppercase mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all resize-none placeholder-gray-400"
              placeholder="Share your ideas, occasion, or preferred diary piece…"
              required
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
            <p className="text-xs text-gray-500 md:w-1/2 animate-fade-in" style={{ animationDelay: '0.25s' }}>
              Our atelier responds to all inquiries within 24–48 hours. For urgent fittings, kindly mention your dates.
            </p>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full md:w-auto px-10 py-3.5 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-all duration-300 font-medium luxury-shadow hover:luxury-shadow-lg transform hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {status === 'submitting' ? 'Sending…' : 'Send Message'}
            </button>
          </div>

          {status === 'success' && (
            <p className="mt-4 text-sm text-emerald-600 font-medium text-center animate-fade-in">
              ✓ Message sent. The atelier will be in touch shortly.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-4 text-sm text-red-600 text-center animate-fade-in">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

