import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import BlogMediaRenderer, { BlogMediaItem } from '../components/BlogMediaRenderer'
import ShareButtons from '../components/ShareButtons'

type Comment = {
  id: number
  author_name: string
  author_email: string
  body: string
  created_at: string
  likes_count: number
  liked_by_visitor: boolean
  replies: Comment[]
}

type BlogPostDetail = {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image?: string | null
  author_name?: string | null
  is_featured: boolean
  allow_comments: boolean
  published_at: string
  likes_count: number
  comments_count: number
  liked_by_visitor: boolean
  media_items: BlogMediaItem[]
  comments: Comment[]
}

export default function BlogPostDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState<BlogPostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [replyParentId, setReplyParentId] = useState<number | null>(null)
  const [form, setForm] = useState({ author_name: '', author_email: '', body: '' })

  const canonicalUrl = useMemo(() => (typeof window !== 'undefined' ? window.location.href : ''), [])

  const fetchPost = async () => {
    if (!slug) return
    setLoading(true)
    try {
      const response = await api.get(`/blog/${slug}/`)
      setPost(response.data)
      document.title = `${response.data.title} — THE BLUE WARDROBE`
      setError(null)
    } catch {
      setError('Unable to load this article right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchPost()
  }, [slug])

  const submitComment = async (parentId?: number | null) => {
    if (!slug) return
    setSubmitting(true)
    try {
      await api.post(`/blog/${slug}/comments/`, {
        ...form,
        parent_id: parentId || null,
      })
      setForm({ author_name: '', author_email: '', body: '' })
      setReplyParentId(null)
      await fetchPost()
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to post your comment right now.')
    } finally {
      setSubmitting(false)
    }
  }

  const togglePostLike = async () => {
    if (!slug) return
    try {
      await api.post(`/blog/${slug}/toggle_like/`, {})
      await fetchPost()
    } catch {
      setError('Unable to update your like right now.')
    }
  }

  const toggleCommentLike = async (commentId: number) => {
    try {
      await api.post(`/blog/comments/${commentId}/toggle-like/`, {})
      await fetchPost()
    } catch {
      setError('Unable to update the comment like right now.')
    }
  }

  const renderComment = (comment: Comment, depth = 0) => (
    <div key={comment.id} className={`rounded-2xl border border-blue-wardrobe-light/10 bg-white p-5 ${depth > 0 ? 'ml-6 mt-4' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-blue-wardrobe-dark">{comment.author_name}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{new Date(comment.created_at).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <button type="button" onClick={() => void toggleCommentLike(comment.id)} className="text-blue-wardrobe-light hover:text-blue-wardrobe-dark">
            {comment.liked_by_visitor ? 'Unlike' : 'Like'} ({comment.likes_count})
          </button>
          <button type="button" onClick={() => setReplyParentId(comment.id)} className="text-blue-wardrobe-light hover:text-blue-wardrobe-dark">
            Reply
          </button>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-line leading-7 text-gray-700">{comment.body}</p>
      {replyParentId === comment.id && (
        <div className="mt-4 rounded-2xl bg-blue-50/60 p-4">
          <p className="text-sm font-medium text-blue-wardrobe-dark">Replying to {comment.author_name}</p>
          <button type="button" onClick={() => setReplyParentId(null)} className="mt-2 text-xs uppercase tracking-[0.2em] text-gray-500">Cancel reply</button>
        </div>
      )}
      {comment.replies?.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading article...</div>
  }

  if (!post) {
    return <div className="py-20 text-center text-gray-500">This article could not be found.</div>
  }

  return (
    <div className="space-y-10 pb-16">
      <article className="overflow-hidden rounded-[2rem] border border-blue-wardrobe-light/10 bg-white luxury-shadow">
        {post.cover_image && <img src={post.cover_image} alt={post.title} className="max-h-[34rem] w-full object-cover" />}
        <div className="p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.25em] text-blue-wardrobe-light">
            <span>{new Date(post.published_at).toLocaleDateString()}</span>
            {post.is_featured && <span className="rounded-full bg-blue-wardrobe-light px-3 py-1 text-white">Featured</span>}
            {post.author_name && <span>By {post.author_name}</span>}
          </div>
          <h1 className="mt-5 text-4xl md:text-6xl font-serif text-blue-wardrobe-dark">{post.title}</h1>
          {post.excerpt && <p className="mt-5 max-w-3xl text-xl leading-8 text-gray-600">{post.excerpt}</p>}
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-500">
            <button type="button" onClick={() => void togglePostLike()} className="font-medium text-blue-wardrobe-light hover:text-blue-wardrobe-dark">
              {post.liked_by_visitor ? 'Unlike' : 'Like'} ({post.likes_count})
            </button>
            <span>{post.comments_count} comments</span>
          </div>
          <div className="mt-8 whitespace-pre-line text-base leading-8 text-gray-700">{post.content}</div>
          {post.media_items.length > 0 && <div className="mt-10"><BlogMediaRenderer items={post.media_items} /></div>}
        </div>
      </article>

      <ShareButtons title={post.title} url={canonicalUrl} />

      <section className="grid grid-cols-1 lg:grid-cols-[1.05fr,0.95fr] gap-8 items-start">
        <div className="rounded-[2rem] border border-blue-wardrobe-light/10 bg-white p-8 luxury-shadow">
          <h2 className="text-3xl font-serif text-blue-wardrobe-dark">Conversation</h2>
          <p className="mt-2 text-gray-500">Readers can comment, reply, and like comments.</p>
          <div className="mt-6 space-y-5">
            {post.comments.length > 0 ? post.comments.map((comment) => renderComment(comment)) : <p className="text-gray-500">No comments yet. Start the conversation.</p>}
          </div>
        </div>

        <div className="rounded-[2rem] border border-blue-wardrobe-light/10 bg-gradient-to-b from-white to-blue-50/60 p-8 luxury-shadow sticky top-24">
          <h2 className="text-3xl font-serif text-blue-wardrobe-dark">Leave a Comment</h2>
          <div className="mt-6 space-y-4">
            <input
              type="text"
              value={form.author_name}
              onChange={(event) => setForm((current) => ({ ...current, author_name: event.target.value }))}
              placeholder="Your name"
              className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
            />
            <input
              type="email"
              value={form.author_email}
              onChange={(event) => setForm((current) => ({ ...current, author_email: event.target.value }))}
              placeholder="Your email"
              className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
            />
            <textarea
              value={form.body}
              onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
              placeholder={replyParentId ? 'Write your reply...' : 'Write your comment...'}
              rows={6}
              className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="button"
              disabled={submitting}
              onClick={() => void submitComment(replyParentId)}
              className="w-full rounded-full bg-blue-wardrobe-dark px-5 py-3 font-medium text-white transition-colors hover:bg-blue-wardrobe-light disabled:opacity-60"
            >
              {submitting ? 'Sending...' : replyParentId ? 'Post Reply' : 'Post Comment'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
