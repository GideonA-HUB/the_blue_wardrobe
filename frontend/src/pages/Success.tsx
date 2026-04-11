import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { useCart } from '../store/cart'

type Outcome = 'pending' | 'success' | 'failed' | 'cancelled' | 'idle'

export default function Success() {
  const [params] = useSearchParams()
  const reference = params.get('reference')
  const txRef = params.get('tx_ref')
  const payStatus = (params.get('status') || '').toLowerCase()
  const clearCart = useCart((s) => s.clear)

  const flutterwaveCancelled = !!txRef && (payStatus === 'cancelled' || payStatus === 'canceled')

  const flutterwaveSuccess =
    !!txRef && (payStatus === 'successful' || payStatus === 'success')

  const [outcome, setOutcome] = useState<Outcome>(() => {
    if (flutterwaveCancelled) return 'cancelled'
    if (reference || (txRef && (flutterwaveSuccess || !payStatus))) return 'pending'
    if (txRef && payStatus && !flutterwaveSuccess && !flutterwaveCancelled) return 'failed'
    if (!reference && !txRef) return 'idle'
    return 'pending'
  })

  useEffect(() => {
    if (outcome !== 'pending') {
      return
    }

    if (reference) {
      api
        .post('/paystack/verify/', { reference })
        .then(() => {
          clearCart()
          setOutcome('success')
        })
        .catch(() => setOutcome('failed'))
      return
    }

    if (txRef && (flutterwaveSuccess || !payStatus)) {
      api
        .post('/flutterwave/verify/', { tx_ref: txRef })
        .then(() => {
          clearCart()
          setOutcome('success')
        })
        .catch(() => setOutcome('failed'))
      return
    }
  }, [reference, txRef, payStatus, outcome, flutterwaveSuccess, clearCart])

  if (outcome === 'cancelled') {
    return (
      <div className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-3xl text-amber-800" aria-hidden>
                ×
              </span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-blue-wardrobe-dark mb-6">
            Payment cancelled
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            No charge was made. Your cart is unchanged — you can checkout again when you are ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/cart"
              className="inline-block px-8 py-4 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-all duration-300 font-medium luxury-shadow"
            >
              Back to cart
            </Link>
            <Link
              to="/checkout"
              className="inline-block px-8 py-4 border-2 border-blue-wardrobe-dark text-blue-wardrobe-dark rounded-full hover:bg-blue-wardrobe-dark/5 transition-all duration-300 font-medium"
            >
              Try checkout again
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (outcome === 'failed') {
    return (
      <div className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-blue-wardrobe-dark mb-6">
            Payment could not be confirmed
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            We could not verify this payment. If you were charged, please contact us with your reference. You can try again from your cart.
          </p>
          <Link
            to="/cart"
            className="inline-block px-8 py-4 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-all duration-300 font-medium luxury-shadow"
          >
            Return to cart
          </Link>
        </div>
      </div>
    )
  }

  if (outcome === 'success') {
    return (
      <div className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-blue-wardrobe-dark mb-6">
            Payment successful
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Thank you for your purchase. A confirmation email will be sent to you shortly.
          </p>
          <Link
            to="/collections"
            className="inline-block px-8 py-4 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-all duration-300 font-medium luxury-shadow hover:luxury-shadow-lg transform hover:scale-105"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  if (outcome === 'idle') {
    return (
      <div className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h1 className="text-3xl font-serif font-semibold text-blue-wardrobe-dark mb-4">Order status</h1>
          <p className="text-gray-600 mb-8">
            No payment details were found in this link. If you completed a purchase, check your email for confirmation.
          </p>
          <Link to="/collections" className="text-blue-wardrobe-dark underline">
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  // pending — verifying
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-2xl mx-auto text-center px-4">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-blue-wardrobe-dark mb-6">
          Finalising your order…
        </h1>
        <p className="text-lg text-gray-600">Please wait a moment.</p>
      </div>
    </div>
  )
}
