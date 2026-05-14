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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-blue-wardrobe-dark mb-4">
          The Dress Diaries Collection
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Each Dress Diary capsule — DDC 001, DDC 002 and beyond — is a story stitched from rare, global fabrics.
        </p>
      </div>
      
      {collections.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {collections.map((c, index) => (
            <Link
              to={`/collections/${c.id}`}
              key={c.id}
              className="group luxury-shadow overflow-hidden rounded-xl sm:rounded-lg bg-white border border-gray-100/80 transition-all duration-500 hover:-translate-y-2 hover:luxury-shadow-lg"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
                {c.featured_image ? (
                  <img
                    src={c.featured_image}
                    alt={c.title}
                    className="h-full w-full object-cover object-top origin-top transform transition-transform duration-700 group-hover:scale-[1.03]"
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
              <div className="p-2.5 sm:p-5 md:p-6">
                <h3 className="mb-1 sm:mb-2 text-xs sm:text-lg font-serif font-semibold text-blue-wardrobe-dark transition-colors group-hover:text-blue-wardrobe-light sm:text-xl line-clamp-2 leading-snug">
                  {c.code} — {c.title}
                </h3>
                <p className="hidden sm:block text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                  {c.story || 'A collection of timeless designs crafted from rare, luxurious fabrics.'}
                </p>
                <div className="mt-2 sm:mt-4">
                  <span className="sm:hidden block w-full rounded-lg border border-gray-300 py-1.5 text-center text-[11px] font-medium text-blue-wardrobe-dark transition-colors group-hover:border-blue-wardrobe-light group-hover:bg-blue-50/60">
                    Explore
                  </span>
                  <span className="hidden sm:inline text-sm text-blue-wardrobe-light font-medium group-hover:underline">
                    Explore Collection →
                  </span>
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
