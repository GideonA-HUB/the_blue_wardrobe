import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../store/cart'

export default function Cart() {
  const items = useCart((s) => s.items)
  const update = useCart((s) => s.updateQty)
  const remove = useCart((s) => s.remove)
  const clear = useCart((s) => s.clear)
  const navigate = useNavigate()

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0)

  return (
    <div className="py-8 md:py-12">
      <h1 className="text-4xl font-serif font-semibold text-blue-wardrobe-dark mb-8">Your Cart</h1>
      {items.length === 0 ? (
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
            {items.map((it) => (
              <div 
                key={`${it.id}-${it.size}`} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between luxury-shadow rounded-lg p-6 bg-white gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <img 
                    src={it.image || '/placeholder.jpg'} 
                    alt={it.title} 
                    className="w-24 h-24 object-cover rounded luxury-shadow" 
                  />
                  <div>
                    <div className="font-serif font-semibold text-lg text-blue-wardrobe-dark">{it.title}</div>
                    <div className="text-sm text-gray-600 mt-1">Size: {it.size}</div>
                    <div className="text-lg font-semibold text-blue-wardrobe-dark mt-2">NGN {it.price.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Qty:</label>
                    <input 
                      type="number" 
                      min={1} 
                      value={it.qty} 
                      onChange={(e) => update(it.id, it.size, Number(e.target.value))} 
                      className="w-16 border-2 border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light" 
                    />
                  </div>
                  <button 
                    onClick={() => remove(it.id, it.size)} 
                    className="text-red-600 hover:text-red-700 font-medium transition-colors"
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
                  className="w-full px-6 py-4 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-all duration-300 font-medium luxury-shadow hover:luxury-shadow-lg transform hover:scale-105"
                >
                  Proceed to Checkout
                </button>
                <button 
                  onClick={() => { clear(); }} 
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:border-gray-400 transition-colors"
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
