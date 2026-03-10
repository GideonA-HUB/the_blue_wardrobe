import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

type Collection = {
  id: number
  code: string
  title: string
  story: string
  featured_image?: string
  is_featured: boolean
  order: number
}

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    document.title = 'Collections — THE DRESS DIARIES'
    api.get('/collections/').then((r) => setCollections(r.data)).catch(() => {})
  }, [])

  return (
    <div className="py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-blue-wardrobe-dark mb-4">
          The Dress Diaries Collection
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Each Dress Diary capsule — DDC 001, DDC 002 and beyond — is a story stitched from rare, global fabrics.
        </p>
      </div>
      
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {collections.map((c, index) => (
            <Link
              to={`/collections/${c.id}`}
              key={c.id}
              className="group luxury-shadow overflow-hidden rounded-lg bg-white transition-all duration-500 hover:-translate-y-2 hover:luxury-shadow-lg"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="relative h-52 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 sm:h-56 md:h-64">
                {c.featured_image ? (
                  <img
                    src={c.featured_image}
                    alt={c.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-blue-wardrobe-dark font-serif text-2xl font-semibold mb-2">
                        {c.code}
                      </div>
                      <div className="text-gray-500 text-sm tracking-wider uppercase">
                        THE DRESS DIARIES
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-4 sm:p-5 md:p-6">
                <h3 className="mb-2 text-lg font-serif font-semibold text-blue-wardrobe-dark transition-colors group-hover:text-blue-wardrobe-light sm:text-xl">
                  {c.code} — {c.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                  {c.story || 'A collection of timeless designs crafted from rare, luxurious fabrics.'}
                </p>
                <div className="mt-4 text-sm text-blue-wardrobe-light font-medium group-hover:underline">
                  Explore Collection →
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No collections available yet. Check back soon for new Dress Diaries releases.</p>
        </div>
      )}
    </div>
  )
}
