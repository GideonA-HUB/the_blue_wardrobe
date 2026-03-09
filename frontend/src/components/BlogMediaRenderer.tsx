import React from 'react'

export type BlogMediaItem = {
  id: number
  media_type: 'image' | 'video' | 'gif' | 'sticker'
  file: string
  caption?: string
  alt_text?: string
  order?: number
}

export default function BlogMediaRenderer({ items, compact = false }: { items: BlogMediaItem[]; compact?: boolean }) {
  if (!items.length) {
    return null
  }

  const wrapperClass = compact
    ? 'grid grid-cols-1 gap-4'
    : 'grid grid-cols-1 md:grid-cols-2 gap-6'

  return (
    <div className={wrapperClass}>
      {items.map((item) => (
        <figure key={item.id} className="overflow-hidden rounded-2xl border border-blue-wardrobe-light/10 bg-white luxury-shadow">
          {item.media_type === 'video' ? (
            <video src={item.file} controls className="w-full max-h-[28rem] bg-black" />
          ) : (
            <img
              src={item.file}
              alt={item.alt_text || item.caption || 'Blog media'}
              className="w-full object-cover max-h-[28rem]"
            />
          )}
          {item.caption && (
            <figcaption className="px-4 py-3 text-sm text-gray-600">{item.caption}</figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}
