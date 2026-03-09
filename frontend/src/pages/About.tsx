import React, { useEffect, useState } from 'react'
import api from '../lib/api'

type BusinessProfile = {
  id: number
  title: string
  subtitle: string
  ceo_name: string
  ceo_title: string
  ceo_photo?: string | null
  about_ceo: string
  business_idea: string
  business_aims: string
  business_agenda: string
  future_prospects: string
}

const sections: Array<keyof Pick<BusinessProfile, 'business_idea' | 'business_aims' | 'business_agenda' | 'future_prospects'>> = [
  'business_idea',
  'business_aims',
  'business_agenda',
  'future_prospects',
]

const labels: Record<string, string> = {
  business_idea: 'Business Idea',
  business_aims: 'Aims',
  business_agenda: 'Agenda',
  future_prospects: 'Future Prospects',
}

export default function About() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'About — THE BLUE WARDROBE'
    api
      .get('/business-profile/')
      .then((response) => {
        setProfile(response.data[0] || null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading brand story...</div>
  }

  if (!profile) {
    return <div className="py-20 text-center text-gray-500">The business profile has not been published yet.</div>
  }

  return (
    <div className="space-y-16 pb-12">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-wardrobe-dark via-blue-wardrobe-light to-blue-wardrobe-dark text-white luxury-shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-8 p-8 md:p-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-blue-100">THE BLUE WARDROBE</p>
            <h1 className="mt-4 text-4xl md:text-6xl font-serif font-semibold text-white">{profile.title}</h1>
            {profile.subtitle && <p className="mt-5 max-w-2xl text-lg text-blue-50">{profile.subtitle}</p>}
            <div className="mt-8 rounded-3xl bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-100">Founder & CEO</p>
              <h2 className="mt-3 text-3xl font-serif text-white">{profile.ceo_name}</h2>
              {profile.ceo_title && <p className="mt-2 text-blue-100">{profile.ceo_title}</p>}
            </div>
          </div>
          <div>
            {profile.ceo_photo ? (
              <img src={profile.ceo_photo} alt={profile.ceo_name} className="w-full rounded-[2rem] object-cover max-h-[36rem] border border-white/20 shadow-2xl" />
            ) : (
              <div className="flex min-h-[24rem] items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 text-center text-blue-50">
                CEO portrait will appear here.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[0.95fr,1.05fr] gap-8 items-start">
        <div className="rounded-[2rem] bg-white p-8 luxury-shadow border border-blue-wardrobe-light/10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-wardrobe-light">About the CEO</p>
          <div className="mt-5 whitespace-pre-line text-base leading-8 text-gray-700">{profile.about_ceo}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((key) => (
            <article key={key} className="rounded-[2rem] bg-gradient-to-b from-white to-blue-50/60 p-7 border border-blue-wardrobe-light/10 luxury-shadow">
              <h3 className="text-2xl font-serif text-blue-wardrobe-dark">{labels[key]}</h3>
              <p className="mt-4 whitespace-pre-line leading-7 text-gray-700">{profile[key]}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
