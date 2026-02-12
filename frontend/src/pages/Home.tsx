import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ParallaxHero from '../components/ParallaxHero'
import NewsletterBanner from '../components/NewsletterBanner'
import VideoSection from '../components/VideoSection'
import InfoCardsSection from '../components/InfoCardsSection'
import api from '../lib/api'

type Collection = {
  id: number
  code: string
  title: string
  story: string
  featured_image?: string
}

export default function Home() {
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    document.title = 'THE BLUE WARDROBE — Luxury Dress Diaries'
    api.get('/collections/').then((r) => setCollections(r.data.slice(0, 3))).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen">
      <ParallaxHero />
      
      {/* Featured Collections Section */}
      <section className="mt-16 md:mt-24 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-blue-wardrobe-dark mb-4">
            Featured Collections
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore curated Dress Diaries collections crafted from rare fabrics sourced globally.
          </p>
        </div>
        
        {collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((c, index) => (
              <Link
                to={`/collections/${c.id}`}
                key={c.id}
                className="group luxury-shadow rounded-lg overflow-hidden hover:luxury-shadow-lg transition-all duration-500 bg-white transform hover:-translate-y-2"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`,
                }}
              >
                <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden relative">
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
                <div className="p-6">
                  <h3 className="text-xl font-serif font-semibold text-blue-wardrobe-dark mb-2 group-hover:text-blue-wardrobe-light transition-colors">
                    {c.code} — {c.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3 leading-relaxed">
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
      </section>

      <VideoSection />
      <InfoCardsSection />
      <NewsletterBanner />
    </div>
  )
}
