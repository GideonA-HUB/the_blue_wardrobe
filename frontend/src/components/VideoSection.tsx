import React, { useEffect, useState, useRef } from 'react'
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
  const [playingVideo, setPlayingVideo] = useState<number | null>(null)
  const [videoError, setVideoError] = useState<number | null>(null)

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
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&controls=1&showinfo=0&rel=0&modestbranding=1`
    }
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0]
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&byline=0&title=0&portrait=0`
    }
    return url
  }

  const getVideoThumbnailUrl = (url: string) => {
    // YouTube thumbnail
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      const videoId = url.includes('youtu.be/')
        ? url.split('youtu.be/')[1].split('?')[0]
        : url.split('v=')[1]?.split('&')[0]
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    }
    return null
  }

  const handleVideoPlay = (video: Video) => {
    setVideoError(null)
    setPlayingVideo(video.id)
    
    // Fallback: if YouTube embed fails, open in new tab after 3 seconds
    setTimeout(() => {
      if (video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be')) {
        setVideoError(video.id)
        setPlayingVideo(null)
      }
    }, 3000)
  }

  const openVideoInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
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
              <div className="relative aspect-[9/16] bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                {playingVideo === video.id ? (
                  <div className="relative w-full h-full">
                    <iframe
                      src={getVideoEmbedUrl(video.video_url)}
                      title={video.title}
                      className="w-full h-full object-cover"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      onError={() => {
                        setVideoError(video.id)
                        setPlayingVideo(null)
                      }}
                    />
                    <button
                      onClick={() => setPlayingVideo(null)}
                      className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : videoError === video.id ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-6">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-blue-wardrobe-light mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-blue-wardrobe-dark font-medium mb-2">Video Player Unavailable</div>
                      <div className="text-sm text-gray-600 mb-4">Watch on YouTube instead</div>
                      <button
                        onClick={() => openVideoInNewTab(video.video_url)}
                        className="px-4 py-2 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-colors text-sm"
                      >
                        Open in YouTube
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <img
                        src={getVideoThumbnailUrl(video.video_url) || ''}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          // Fallback to placeholder if thumbnail fails
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    )}
                    <div className="hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                      <svg className="w-16 h-16 text-blue-wardrobe-light" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div 
                      className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center cursor-pointer"
                      onClick={() => handleVideoPlay(video)}
                    >
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <svg className="w-8 h-8 text-blue-wardrobe-dark ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </>
                )}
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

