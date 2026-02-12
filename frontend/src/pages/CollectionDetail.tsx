import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../lib/api'

type Material = {
  id: number
  name: string
  description: string
}

type Design = {
  id: number
  sku: string
  title: string
  price: number
  images: string[]
}

type Collection = {
  id: number
  code: string
  title: string
  story: string
  materials: Material[]
  featured_image?: string
  designs: Design[]
}

export default function CollectionDetail() {
  const { id } = useParams()
  const [collection, setCollection] = useState<Collection | null>(null)

  useEffect(() => {
    if (!id) return
    api.get(`/collections/${id}/`).then((r) => {
      setCollection(r.data)
      document.title = `${r.data.code} — ${r.data.title} | THE DRESS DIARIES`
    }).catch(() => {})
  }, [id])

  if (!collection) {
    return (
      <div className="py-16 text-center">
        <div className="text-gray-400 text-lg">Loading collection…</div>
      </div>
    )
  }

  return (
    <div className="py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <div className="luxury-shadow-lg rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
            {collection.featured_image ? (
              <img
                src={collection.featured_image}
                alt={collection.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-96 w-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-blue-wardrobe-dark font-serif text-3xl font-semibold mb-2">
                    {collection.code}
                  </div>
                  <div className="text-gray-500 text-sm tracking-wider uppercase">
                    THE DRESS DIARIES
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-blue-wardrobe-dark mb-6">
            {collection.code} — {collection.title}
          </h1>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base mb-8">
            {collection.story || 'A collection of timeless designs crafted from rare, luxurious fabrics.'}
          </p>

          {collection.materials?.length > 0 && (
            <div className="luxury-shadow rounded-lg p-6 bg-white">
              <h2 className="text-sm font-semibold tracking-wide text-gray-600 uppercase mb-4">
                Rare Materials
              </h2>
              <ul className="space-y-3">
                {collection.materials.map((m) => (
                  <li key={m.id} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-wardrobe-light mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-blue-wardrobe-dark">{m.name}</span>
                      {m.description && (
                        <span className="text-sm text-gray-600 block mt-1">{m.description}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-3xl font-serif font-semibold text-blue-wardrobe-dark mb-8">
          Designs in this diary
        </h2>
        {collection.designs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collection.designs.map((d, index) => (
              <Link
                to={`/designs/${d.id}`}
                key={d.id}
                className="group luxury-shadow rounded-lg overflow-hidden hover:luxury-shadow-lg transition-all duration-500 bg-white transform hover:-translate-y-2"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="h-80 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden relative">
                  {d.images?.[0] ? (
                    <img
                      src={d.images[0]}
                      alt={d.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-blue-wardrobe-dark font-serif text-xl font-semibold mb-1">
                          {collection.code}
                        </div>
                        <div className="text-gray-500 text-xs tracking-wider uppercase">
                          DDC LOOK
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <div className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">
                    {collection.code}
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-blue-wardrobe-dark mb-2 group-hover:text-blue-wardrobe-light transition-colors">
                    {d.title}
                  </h3>
                  <p className="text-lg font-bold text-blue-wardrobe-dark">
                    NGN {d.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No designs available in this collection yet.</p>
          </div>
        )}
      </section>
    </div>
  )
}


