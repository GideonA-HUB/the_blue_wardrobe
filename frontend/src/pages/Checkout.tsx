import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useCart } from '../store/cart'

export default function Checkout() {
  const items = useCart((s) => s.items)
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const onPay = async () => {
    const payload = {
      email,
      amount: subtotal,
      metadata: { cart: items, customer: { firstName, lastName } }
    }
    const resp = await api.post('/paystack/initiate/', payload)
    const authUrl = resp.data?.data?.authorization_url || resp.data?.authorization_url
    if (authUrl) window.location.href = authUrl
  }

  return (
    <div className="py-8 md:py-12">
      <h1 className="text-4xl font-serif font-semibold text-blue-wardrobe-dark mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-blue-wardrobe-dark mb-6">Shipping Information</h2>
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First name</label>
              <input 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last name</label>
              <input 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all" 
                required
              />
            </div>
          </form>
        </div>
        <div>
          <div className="luxury-shadow-lg rounded-lg p-6 bg-white sticky top-24">
            <h3 className="text-xl font-serif font-semibold text-blue-wardrobe-dark mb-6">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Items ({items.length})</span>
                <span className="font-semibold">{items.length} piece{items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold text-blue-wardrobe-dark">
                  <span>Total</span>
                  <span>NGN {subtotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onPay} 
              disabled={!firstName || !lastName || !email || items.length === 0}
              className="w-full px-6 py-4 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-all duration-300 font-medium luxury-shadow hover:luxury-shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Proceed to Payment
            </button>
            <p className="text-xs text-gray-500 mt-4 text-center">
              You will be redirected to Paystack to complete your payment securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
