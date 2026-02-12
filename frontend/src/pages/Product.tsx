import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import { useCart } from '../store/cart'

type Design = {
  id: number
  sku: string
  title: string
  description: string
  price: number
  sizes: string[]
  images: string[]
  stock: number
}

export default function Product() {
  const { id } = useParams()
  const [design, setDesign] = useState<Design | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const add = useCart((s) => s.add)

  useEffect(() => {
    if (!id) return
    api.get(`/designs/${id}/`).then((r) => {
      setDesign(r.data)
      document.title = `${r.data.title} — THE BLUE WARDROBE`
    }).catch(() => {})
  }, [id])

  if (!design) {
    return (
      <div className="py-16 text-center">
        <div className="text-gray-400 text-lg">Loading look…</div>
      </div>
    )
  }

  return (
    <div className="py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="animate-fade-in">
          <div className="luxury-shadow rounded-lg overflow-hidden cursor-zoom-in group bg-white animate-scale-in">
            <img
              src={design.images?.[0] || '/placeholder.jpg'}
              alt={design.title}
              className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700"
              style={{ animation: 'fadeIn 0.8s ease-out 0.2s both' }}
            />
          </div>
          {design.images && design.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {design.images.slice(1, 5).map((img, idx) => (
                <div
                  key={idx}
                  className="luxury-shadow rounded overflow-hidden cursor-pointer hover:opacity-75 transition-opacity animate-scale-in"
                  style={{ animation: `scaleIn 0.5s ease-out ${0.4 + idx * 0.1}s both` }}
                >
                  <img src={img} alt={`${design.title} ${idx + 2}`} className="w-full h-20 object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="animate-slide-right">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-blue-wardrobe-dark mb-4 tracking-tight">
            {design.title}
          </h1>
          <p className="text-3xl font-bold text-blue-wardrobe-dark mb-6">NGN {design.price.toLocaleString()}</p>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <p className="text-gray-700 leading-relaxed text-base">{design.description || 'A timeless piece from The Dress Diaries Collection.'}</p>
          </div>

          <div className="mt-8">
            <label className="block text-xs font-semibold tracking-[0.2em] uppercase text-gray-600 mb-3">
              Select size
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full max-w-xs border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all text-gray-700 font-medium"
            >
              <option value="">Choose your fit</option>
              {design.sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-8 space-y-4">
            <button
              className="w-full max-w-xs px-8 py-4 bg-blue-wardrobe-dark text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed tracking-wide hover:bg-blue-wardrobe-light transition-all duration-300 font-medium luxury-shadow hover:luxury-shadow-lg transform hover:scale-105 disabled:transform-none"
              disabled={!selectedSize}
              onClick={() =>
                add({
                  id: design.id,
                  title: design.title,
                  price: design.price,
                  size: selectedSize,
                  qty: 1,
                  image: design.images?.[0],
                })
              }
            >
              Add to wardrobe
            </button>
            <div className="text-sm text-gray-600">
              {design.stock > 0 ? (
                <span className="text-emerald-600 font-medium">✓ {design.stock} pieces available in this diary.</span>
              ) : (
                <span className="text-red-600">Currently out of stock.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
