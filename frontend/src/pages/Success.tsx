import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { useCart } from '../store/cart'

export default function Success() {
  const [params] = useSearchParams()
  const reference = params.get('reference')
  const clearCart = useCart((s) => s.clear)
  const [loading, setLoading] = useState<boolean>(!!reference)

  useEffect(() => {
    if (reference) {
      api.post('/paystack/verify/', { reference })
        .then(() => {
          clearCart()
        })
        .finally(() => setLoading(false))
    }
  }, [reference, clearCart])

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-blue-wardrobe-dark mb-6">
          Payment Successful
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {loading
            ? 'Finalising your order...'
            : 'Thank you for your purchase. A confirmation email will be sent to you shortly.'}
        </p>
        {!loading && (
          <div className="mt-8">
            <a
              href="/collections"
              className="inline-block px-8 py-4 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-all duration-300 font-medium luxury-shadow hover:luxury-shadow-lg transform hover:scale-105"
            >
              Continue Shopping
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
