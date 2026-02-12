import React, { useEffect, useState } from 'react'
import api from '../lib/api'

type Video = {
  id: number
  title: string
  description: string
  video_url: string
  thumbnail?: string
  video_type: string
}

export default function VideoSection() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/videos/')
      .then((r) => {
        setVideos(r.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || videos.length === 0) return null

  const getVideoEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      const videoId = url.includes('youtu.be/')
        ? url.split('youtu.be/')[1].split('?')[0]
        : url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0]
      return `https://player.vimeo.com/video/${videoId}`
    }
    return url
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-blue-wardrobe-dark mb-4">
            The Atelier
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience our collections through moving stories of craftsmanship, rare fabrics, and timeless design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="group luxury-shadow rounded-lg overflow-hidden bg-white transform hover:luxury-shadow-lg transition-all duration-500 hover:-translate-y-2"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-blue-wardrobe-light" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-blue-wardrobe-dark ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs uppercase tracking-wider text-blue-wardrobe-light mb-2">
                  {video.video_type.replace('_', ' ')}
                </div>
                <h3 className="text-xl font-serif font-semibold text-blue-wardrobe-dark mb-2">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

