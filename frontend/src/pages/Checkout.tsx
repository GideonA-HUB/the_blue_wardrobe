import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useCart } from '../store/cart'

type CartItem = {
  id: number
  design: {
    id: number
    title: string
  }
  size: number
  quantity: number
  unit_price: number
  subtotal: number
  is_available: boolean
}

type CartData = {
  id: number
  session_id: string
  customer_email: string
  items: CartItem[]
  total_items: number
  total_amount: number
  created_at: string
  updated_at: string
}

export default function Checkout() {
  const localItems = useCart((s) => s.items)
  const clear = useCart((s) => s.clear)
  const navigate = useNavigate()
  
  const [serverCart, setServerCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  // Load cart from server on mount
  useEffect(() => {
    loadServerCart()
  }, [])

  const loadServerCart = async () => {
    try {
      setLoading(true)
      const response = await api.get('/cart/')
      setServerCart(response.data)
    } catch (error) {
      console.error('Failed to load cart:', error)
    } finally {
      setLoading(false)
    }
  }

  // Use server cart if available, otherwise fall back to local cart
  const displayItems = serverCart?.items || localItems.map(it => ({
    id: it.id,
    design: { id: it.id, title: it.title },
    size: parseInt(it.size),
    quantity: it.qty,
    unit_price: it.price,
    subtotal: it.price * it.qty,
    is_available: true
  }))
  
  const subtotal = serverCart?.total_amount || localItems.reduce((s, it) => s + it.price * it.qty, 0)
  const totalItems = serverCart?.total_items || localItems.reduce((s, it) => s + it.qty, 0)

  const onPay = async () => {
    if (!email || !firstName || !lastName) {
      alert('Please fill in all required fields')
      return
    }

    if (displayItems.some(item => !item.is_available)) {
      alert('Some items in your cart are no longer available. Please remove them before proceeding.')
      return
    }

    setProcessing(true)
    try {
      // Prepare cart items for Paystack
      const cartItems = displayItems.map(item => ({
        id: item.design.id,
        size: item.size,
        qty: item.quantity
      }))

      const payload = {
        email,
        amount: subtotal,
        metadata: { 
          cart: cartItems, 
          customer: { 
            firstName, 
            lastName,
            phone
          } 
        }
      }
      
      const resp = await api.post('/paystack/initiate/', payload)
      const authUrl = resp.data?.data?.authorization_url || resp.data?.authorization_url
      
      if (authUrl) {
        // Clear local cart after successful payment initiation
        clear()
        window.location.href = authUrl
      } else {
        alert('Failed to initiate payment. Please try again.')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      alert(error.response?.data?.detail || 'Failed to initiate payment. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="text-gray-400 text-lg">Loading checkout…</div>
      </div>
    )
  }

  if (displayItems.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-600 text-lg mb-4">Your cart is empty.</p>
        <button 
          onClick={() => navigate('/collections')}
          className="inline-block px-6 py-3 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-colors luxury-shadow"
        >
          Continue shopping
        </button>
      </div>
    )
  }

  return (
    <div className="py-8 md:py-12">
      <h1 className="text-4xl font-serif font-semibold text-blue-wardrobe-dark mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-blue-wardrobe-dark mb-6">Customer Information</h2>
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onPay(); }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First name *</label>
              <input 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last name *</label>
              <input 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email address *</label>
              <input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
              <input 
                type="tel"
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all" 
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
              <textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all resize-none" 
                rows={3}
                placeholder="Enter your full delivery address"
                required
              />
            </div>
          </form>
        </div>
        <div>
          <div className="luxury-shadow-lg rounded-lg p-6 bg-white sticky top-24">
            <h3 className="text-xl font-serif font-semibold text-blue-wardrobe-dark mb-6">Order Summary</h3>
            
            {/* Order Items */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {displayItems.map((item) => (
                <div key={`${item.design.id}-${item.size}`} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.design.title}</div>
                    <div className="text-gray-500">Size {item.size} × {item.quantity}</div>
                  </div>
                  <div className="font-medium text-gray-900">
                    NGN {item.subtotal.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">NGN {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT (3.5%)</span>
                <span className="font-semibold">NGN {Math.round(subtotal * 0.035).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-semibold">NGN 5,000</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-lg font-bold text-blue-wardrobe-dark">
                  <span>Total</span>
                  <span>NGN {(subtotal + Math.round(subtotal * 0.035) + 5000).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {displayItems.some(item => !item.is_available) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  ⚠️ Some items are no longer available. Please remove them before proceeding.
                </p>
              </div>
            )}
            
            <div className="mt-6 space-y-3">
              <button 
                onClick={onPay} 
                disabled={!firstName || !lastName || !email || !address || processing || displayItems.some(item => !item.is_available)}
                className="w-full px-6 py-4 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-all duration-300 font-medium luxury-shadow hover:luxury-shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {processing ? 'Processing...' : 'Pay with Paystack'}
              </button>
              <button 
                type="button"
                onClick={() => navigate('/cart')}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:border-gray-400 transition-colors"
              >
                Back to Cart
              </button>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center mb-2">
                <strong>Secure Payment Powered by Paystack</strong>
              </p>
              <p className="text-xs text-gray-500 text-center">
                You will be redirected to Paystack's secure payment page to complete your purchase.
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                All transactions are encrypted and secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
