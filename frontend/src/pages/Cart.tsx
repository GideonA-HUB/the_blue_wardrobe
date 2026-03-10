import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../store/cart'
import api from '../lib/api'

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

export default function Cart() {
  const localItems = useCart((s) => s.items)
  const update = useCart((s) => s.updateQty)
  const remove = useCart((s) => s.remove)
  const clear = useCart((s) => s.clear)
  const navigate = useNavigate()
  
  const [serverCart, setServerCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Load cart from server on mount
  useEffect(() => {
    loadServerCart()
  }, [])

  const loadServerCart = async () => {
    try {
      setLoading(true)
      const response = await api.get('/cart/')
      setServerCart(response.data)
      
      // Sync local cart with server cart
      // (This is a simple sync - you might want more sophisticated logic)
      if (response.data.items.length === 0) {
        clear()
      }
    } catch (error) {
      console.error('Failed to load cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (designId: number, size: number) => {
    setUpdating(true)
    try {
      await api.post('/cart/remove/', {
        design_id: designId,
        size: size
      })
      
      // Update local state
      remove(designId, size.toString())
      
      // Reload server cart
      await loadServerCart()
    } catch (error) {
      console.error('Failed to remove item:', error)
      alert('Failed to remove item from cart')
    } finally {
      setUpdating(false)
    }
  }

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return
    
    setUpdating(true)
    try {
      await api.post('/cart/clear/')
      clear()
      setServerCart(null)
    } catch (error) {
      console.error('Failed to clear cart:', error)
      alert('Failed to clear cart')
    } finally {
      setUpdating(false)
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

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="text-gray-400 text-lg">Loading cart…</div>
      </div>
    )
  }

  return (
    <div className="py-8 md:py-12">
      <h1 className="text-4xl font-serif font-semibold text-blue-wardrobe-dark mb-8">
        Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
      </h1>
      {displayItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg mb-4">Your cart is empty.</p>
          <Link 
            to="/collections" 
            className="inline-block px-6 py-3 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-colors luxury-shadow"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {displayItems.map((it) => (
              <div 
                key={`${it.design.id}-${it.size}`} 
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between luxury-shadow rounded-lg p-6 bg-white gap-4 ${
                  !it.is_available ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded luxury-shadow flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-blue-wardrobe-dark font-serif text-xs font-semibold">
                        {it.design.title.substring(0, 15)}...
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="font-serif font-semibold text-lg text-blue-wardrobe-dark">{it.design.title}</div>
                    <div className="text-sm text-gray-600 mt-1">Size: {it.size}</div>
                    <div className="text-lg font-semibold text-blue-wardrobe-dark mt-2">NGN {it.unit_price.toLocaleString()}</div>
                    {!it.is_available && (
                      <div className="text-sm text-red-600 font-medium mt-1">No longer available</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Qty:</label>
                    <span className="font-medium text-blue-wardrobe-dark">{it.quantity}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-wardrobe-dark">
                      NGN {it.subtotal.toLocaleString()}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(it.design.id, it.size)} 
                    disabled={updating}
                    className="text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="luxury-shadow-lg rounded-lg p-6 bg-white sticky top-24">
              <h3 className="text-xl font-serif font-semibold text-blue-wardrobe-dark mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-blue-wardrobe-dark">NGN {subtotal.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-blue-wardrobe-dark">
                    <span>Total</span>
                    <span>NGN {subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/checkout')} 
                  disabled={updating || displayItems.some(item => !item.is_available)}
                  className="w-full px-6 py-4 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-all duration-300 font-medium luxury-shadow hover:luxury-shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {updating ? 'Updating...' : 'Proceed to Checkout'}
                </button>
                <button 
                  onClick={handleClearCart} 
                  disabled={updating}
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:border-gray-400 transition-colors disabled:opacity-50"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
