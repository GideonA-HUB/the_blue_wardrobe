import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import BlogMediaRenderer, { BlogMediaItem } from '../components/BlogMediaRenderer'

type BlogPostSummary = {
  id: number
  title: string
  slug: string
  excerpt: string
  cover_image?: string | null
  is_featured: boolean
  published_at: string
  likes_count: number
  comments_count: number
  media_preview?: BlogMediaItem | null
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Journal — THE BLUE WARDROBE'
    api.get('/blog/').then((response) => setPosts(response.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-12 pb-12">
      <section className="rounded-[2rem] bg-gradient-to-br from-blue-50 to-white p-8 md:p-12 border border-blue-wardrobe-light/10 luxury-shadow">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-wardrobe-light">Brand Journal</p>
        <h1 className="mt-4 text-4xl md:text-6xl font-serif font-semibold text-blue-wardrobe-dark">Stories, craft and future-facing vision.</h1>
        <p className="mt-5 max-w-3xl text-lg text-gray-600">Explore campaign notes, creative direction, behind-the-scenes updates, business reflections, and the evolving world of THE BLUE WARDROBE.</p>
      </section>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-blue-wardrobe-light/30 bg-white py-20 text-center text-gray-500">No blog posts have been published yet.</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-[2rem] border border-blue-wardrobe-light/10 bg-white luxury-shadow transition-transform duration-300 hover:-translate-y-1">
              {post.cover_image ? (
                <img src={post.cover_image} alt={post.title} className="h-72 w-full object-cover" />
              ) : post.media_preview ? (
                <div className="p-4 bg-blue-50/50">
                  <BlogMediaRenderer items={[post.media_preview]} compact />
                </div>
              ) : null}
              <div className="p-7">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.25em] text-blue-wardrobe-light">
                  <span>{new Date(post.published_at).toLocaleDateString()}</span>
                  {post.is_featured && <span className="rounded-full bg-blue-wardrobe-light px-3 py-1 text-white">Featured</span>}
                </div>
                <h2 className="mt-4 text-3xl font-serif text-blue-wardrobe-dark">{post.title}</h2>
                <p className="mt-4 text-gray-600 leading-7">{post.excerpt || 'Read the full story from THE BLUE WARDROBE journal.'}</p>
                <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                  <span>{post.likes_count} likes</span>
                  <span>{post.comments_count} comments</span>
                </div>
                <Link to={`/blog/${post.slug}`} className="mt-6 inline-flex items-center rounded-full bg-blue-wardrobe-dark px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-wardrobe-light">
                  Read Article
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
