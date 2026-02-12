import React, { useEffect, useState } from 'react'
import api from '../lib/api'

type InfoCard = {
  id: number
  title: string
  description: string
  icon?: string
  color: string
  image?: string
  link_url?: string
  link_text?: string
}

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  blue: {
    bg: 'bg-blue-wardrobe-dark',
    text: 'text-white',
    border: 'border-blue-wardrobe-light',
  },
  white: {
    bg: 'bg-white',
    text: 'text-blue-wardrobe-dark',
    border: 'border-gray-200',
  },
  gold: {
    bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    text: 'text-white',
    border: 'border-yellow-300',
  },
  silver: {
    bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
    text: 'text-white',
    border: 'border-gray-400',
  },
  navy: {
    bg: 'bg-blue-900',
    text: 'text-white',
    border: 'border-blue-700',
  },
}

export default function InfoCardsSection() {
  const [cards, setCards] = useState<InfoCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/info-cards/')
      .then((r) => {
        setCards(r.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || cards.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-blue-wardrobe-dark mb-4">
            Our Story
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover what makes THE BLUE WARDROBE a destination for global luxury.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => {
            const colors = colorClasses[card.color] || colorClasses.blue
            return (
              <div
                key={card.id}
                className={`luxury-shadow rounded-lg overflow-hidden ${colors.bg} ${colors.text} transform hover:luxury-shadow-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105`}
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                {card.image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                )}
                <div className="p-6">
                  {card.icon && (
                    <div className="text-4xl mb-4">{card.icon}</div>
                  )}
                  <h3 className="text-2xl font-serif font-semibold mb-3">{card.title}</h3>
                  <p className="text-sm leading-relaxed opacity-90 mb-4">{card.description}</p>
                  {card.link_url && card.link_text && (
                    <a
                      href={card.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-block px-4 py-2 border-2 ${colors.border} rounded-full hover:bg-white/20 transition-colors text-sm font-medium`}
                    >
                      {card.link_text} →
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

