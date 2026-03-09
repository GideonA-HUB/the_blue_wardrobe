import React, { useEffect, useMemo, useState } from 'react'
import { FaBookOpen, FaBoxOpen, FaCommentDots, FaHeart, FaPencilAlt, FaPlus, FaTrash } from 'react-icons/fa'
import api from '../../lib/api'

type BusinessProfile = {
  id: number
  title: string
  subtitle: string
  ceo_name: string
  ceo_title: string
  ceo_photo_url?: string | null
  about_ceo: string
  business_idea: string
  business_aims: string
  business_agenda: string
  future_prospects: string
  is_active: boolean
}

type BlogPost = {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url?: string | null
  is_featured: boolean
  is_published: boolean
  allow_comments: boolean
  likes_count: number
  comments_count: number
  published_at: string
}

type BlogMedia = {
  id: number
  post_id: number
  post_title: string
  file_url?: string | null
  media_type: 'image' | 'video' | 'gif' | 'sticker'
  caption: string
  alt_text: string
  order: number
}

type BlogComment = {
  id: number
  post: number
  post_title: string
  author_name: string
  author_email: string
  visitor_id: string
  body: string
  is_approved: boolean
  likes_count: number
  created_at: string
}

type BlogLike = {
  id: number
  post_title?: string
  comment_body?: string
  visitor_name: string
  visitor_email: string
  visitor_id: string
  created_at: string
}

type ContentTab = 'about' | 'posts' | 'media' | 'comments' | 'likes'

type ModalState =
  | { type: 'business-profile'; item?: BusinessProfile }
  | { type: 'blog-post'; item?: BlogPost }
  | { type: 'blog-media'; item?: BlogMedia }
  | null

const tabs: Array<{ id: ContentTab; label: string; icon: any }> = [
  { id: 'about', label: 'About & CEO', icon: FaBoxOpen },
  { id: 'posts', label: 'Blog Posts', icon: FaBookOpen },
  { id: 'media', label: 'Media Uploads', icon: FaPencilAlt },
  { id: 'comments', label: 'Comments', icon: FaCommentDots },
  { id: 'likes', label: 'Likes', icon: FaHeart },
]

export default function ContentManager({ token }: { token: string }) {
  const [activeTab, setActiveTab] = useState<ContentTab>('about')
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [mediaItems, setMediaItems] = useState<BlogMedia[]>([])
  const [comments, setComments] = useState<BlogComment[]>([])
  const [postLikes, setPostLikes] = useState<BlogLike[]>([])
  const [commentLikes, setCommentLikes] = useState<BlogLike[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)

  const authHeaders = useMemo(() => ({ Authorization: `Token ${token}` }), [token])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [businessRes, postsRes, mediaRes, commentsRes, postLikesRes, commentLikesRes] = await Promise.all([
        api.get('/admin/business-profile/', { headers: authHeaders }),
        api.get('/admin/blog-posts/', { headers: authHeaders }),
        api.get('/admin/blog-media/', { headers: authHeaders }),
        api.get('/admin/blog-comments/', { headers: authHeaders }),
        api.get('/admin/blog-post-likes/', { headers: authHeaders }),
        api.get('/admin/blog-comment-likes/', { headers: authHeaders }),
      ])
      setBusinessProfiles(businessRes.data)
      setPosts(postsRes.data)
      setMediaItems(mediaRes.data)
      setComments(commentsRes.data)
      setPostLikes(postLikesRes.data)
      setCommentLikes(commentLikesRes.data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to load content management data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchAll()
  }, [token])

  const buildFormData = (payload: Record<string, any>) => {
    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return
      }
      if (value instanceof File) {
        formData.append(key, value)
      } else {
        formData.append(key, String(value))
      }
    })
    return formData
  }

  const saveModal = async (payload: Record<string, any>) => {
    if (!modal) return
    const config = { headers: authHeaders }
    try {
      if (modal.type === 'business-profile') {
        const data = buildFormData(payload)
        if (modal.item?.id) {
          await api.patch(`/admin/business-profile/${modal.item.id}/`, data, config)
        } else {
          await api.post('/admin/business-profile/', data, config)
        }
      }
      if (modal.type === 'blog-post') {
        const data = buildFormData(payload)
        if (modal.item?.id) {
          await api.patch(`/admin/blog-posts/${modal.item.id}/`, data, config)
        } else {
          await api.post('/admin/blog-posts/', data, config)
        }
      }
      if (modal.type === 'blog-media') {
        const data = buildFormData(payload)
        if (modal.item?.id) {
          await api.patch(`/admin/blog-media/${modal.item.id}/`, data, config)
        } else {
          await api.post('/admin/blog-media/', data, config)
        }
      }
      setModal(null)
      await fetchAll()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to save content changes.')
    }
  }

  const deleteItem = async (endpoint: string, id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    try {
      await api.delete(`/admin/${endpoint}/${id}/`, { headers: authHeaders })
      await fetchAll()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to delete this item.')
    }
  }

  const toggleCommentApproval = async (comment: BlogComment) => {
    try {
      await api.patch(`/admin/blog-comments/${comment.id}/`, { is_approved: !comment.is_approved }, { headers: authHeaders })
      await fetchAll()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to update comment approval.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${activeTab === tab.id ? 'bg-blue-wardrobe-dark text-white' : 'border border-blue-wardrobe-light/20 bg-white text-blue-wardrobe-dark hover:bg-blue-wardrobe-light/10'}`}
            >
              <Icon />
              {tab.label}
            </button>
          )
        })}
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && <div className="text-sm text-gray-500">Refreshing content data...</div>}

      {activeTab === 'about' && (
        <div className="rounded-2xl border border-blue-wardrobe-light/10 bg-white p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-blue-wardrobe-dark">About & CEO Content</h2>
            <button type="button" onClick={() => setModal({ type: 'business-profile' })} className="inline-flex items-center gap-2 rounded-full bg-blue-wardrobe-dark px-4 py-2 text-white hover:bg-blue-wardrobe-light">
              <FaPlus /> Add Profile
            </button>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {businessProfiles.map((profile) => (
              <div key={profile.id} className="rounded-2xl border border-blue-wardrobe-light/10 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-serif text-blue-wardrobe-dark">{profile.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{profile.ceo_name}{profile.ceo_title ? ` — ${profile.ceo_title}` : ''}</p>
                  </div>
                  <div className="flex gap-3 text-lg">
                    <button type="button" onClick={() => setModal({ type: 'business-profile', item: profile })} className="text-blue-wardrobe-light hover:text-blue-wardrobe-dark"><FaPencilAlt /></button>
                    <button type="button" onClick={() => void deleteItem('business-profile', profile.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                  </div>
                </div>
                {profile.ceo_photo_url && <img src={profile.ceo_photo_url} alt={profile.ceo_name} className="mt-4 h-52 w-full rounded-2xl object-cover" />}
                <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm text-gray-600">{profile.about_ceo}</p>
              </div>
            ))}
            {businessProfiles.length === 0 && <p className="text-gray-500">No CEO/business profile has been added yet.</p>}
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="rounded-2xl border border-blue-wardrobe-light/10 bg-white p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-blue-wardrobe-dark">Blog Posts</h2>
            <button type="button" onClick={() => setModal({ type: 'blog-post' })} className="inline-flex items-center gap-2 rounded-full bg-blue-wardrobe-dark px-4 py-2 text-white hover:bg-blue-wardrobe-light">
              <FaPlus /> Add Post
            </button>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="rounded-2xl border border-blue-wardrobe-light/10 p-5">
                {post.cover_image_url && <img src={post.cover_image_url} alt={post.title} className="h-52 w-full rounded-2xl object-cover" />}
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-serif text-blue-wardrobe-dark">{post.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{post.likes_count} likes · {post.comments_count} comments</p>
                    <p className="mt-3 line-clamp-4 text-sm text-gray-600">{post.excerpt || post.content}</p>
                  </div>
                  <div className="flex gap-3 text-lg">
                    <button type="button" onClick={() => setModal({ type: 'blog-post', item: post })} className="text-blue-wardrobe-light hover:text-blue-wardrobe-dark"><FaPencilAlt /></button>
                    <button type="button" onClick={() => void deleteItem('blog-posts', post.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                  </div>
                </div>
              </div>
            ))}
            {posts.length === 0 && <p className="text-gray-500">No blog posts yet.</p>}
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="rounded-2xl border border-blue-wardrobe-light/10 bg-white p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-blue-wardrobe-dark">Blog Media Uploads</h2>
            <button type="button" onClick={() => setModal({ type: 'blog-media' })} className="inline-flex items-center gap-2 rounded-full bg-blue-wardrobe-dark px-4 py-2 text-white hover:bg-blue-wardrobe-light">
              <FaPlus /> Add Media
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {mediaItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-blue-wardrobe-light/10 p-4">
                {item.file_url && item.media_type === 'video' ? <video src={item.file_url} controls className="h-48 w-full rounded-xl bg-black object-cover" /> : item.file_url ? <img src={item.file_url} alt={item.alt_text || item.caption || item.post_title} className="h-48 w-full rounded-xl object-cover" /> : null}
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-blue-wardrobe-dark">{item.post_title}</p>
                    <p className="text-sm text-gray-500">{item.media_type} · order {item.order}</p>
                    {item.caption && <p className="mt-2 text-sm text-gray-600">{item.caption}</p>}
                  </div>
                  <div className="flex gap-3 text-lg">
                    <button type="button" onClick={() => setModal({ type: 'blog-media', item })} className="text-blue-wardrobe-light hover:text-blue-wardrobe-dark"><FaPencilAlt /></button>
                    <button type="button" onClick={() => void deleteItem('blog-media', item.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                  </div>
                </div>
              </div>
            ))}
            {mediaItems.length === 0 && <p className="text-gray-500">No blog media uploaded yet.</p>}
          </div>
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="rounded-2xl border border-blue-wardrobe-light/10 bg-white p-6 shadow-md">
          <h2 className="mb-6 text-2xl font-semibold text-blue-wardrobe-dark">Comment Moderation</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-blue-wardrobe-light/20 text-left text-sm text-blue-wardrobe-dark">
                  <th className="px-4 py-3">Post</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3">Likes</th>
                  <th className="px-4 py-3">Approved</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((comment) => (
                  <tr key={comment.id} className="border-b border-blue-wardrobe-light/10 align-top">
                    <td className="px-4 py-4 text-sm text-gray-600">{comment.post_title}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{comment.author_name}<br />{comment.author_email}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{comment.body}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{comment.likes_count}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{comment.is_approved ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-3 text-sm">
                        <button type="button" onClick={() => void toggleCommentApproval(comment)} className="text-blue-wardrobe-light hover:text-blue-wardrobe-dark">
                          {comment.is_approved ? 'Hide' : 'Approve'}
                        </button>
                        <button type="button" onClick={() => void deleteItem('blog-comments', comment.id)} className="text-red-600 hover:text-red-800">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {comments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">No comments yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'likes' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-blue-wardrobe-light/10 bg-white p-6 shadow-md">
            <h2 className="mb-5 text-2xl font-semibold text-blue-wardrobe-dark">Post Likes</h2>
            <div className="space-y-4">
              {postLikes.map((like) => (
                <div key={like.id} className="rounded-xl border border-blue-wardrobe-light/10 p-4 text-sm text-gray-700">
                  <p className="font-medium text-blue-wardrobe-dark">{like.post_title}</p>
                  <p className="mt-1">{like.visitor_name || like.visitor_email || like.visitor_id}</p>
                  <p className="mt-1 text-xs text-gray-500">{new Date(like.created_at).toLocaleString()}</p>
                </div>
              ))}
              {postLikes.length === 0 && <p className="text-gray-500">No post likes recorded yet.</p>}
            </div>
          </div>
          <div className="rounded-2xl border border-blue-wardrobe-light/10 bg-white p-6 shadow-md">
            <h2 className="mb-5 text-2xl font-semibold text-blue-wardrobe-dark">Comment Likes</h2>
            <div className="space-y-4">
              {commentLikes.map((like) => (
                <div key={like.id} className="rounded-xl border border-blue-wardrobe-light/10 p-4 text-sm text-gray-700">
                  <p className="font-medium text-blue-wardrobe-dark">{like.post_title}</p>
                  <p className="mt-1 line-clamp-2 text-gray-600">{like.comment_body}</p>
                  <p className="mt-2">{like.visitor_name || like.visitor_email || like.visitor_id}</p>
                  <p className="mt-1 text-xs text-gray-500">{new Date(like.created_at).toLocaleString()}</p>
                </div>
              ))}
              {commentLikes.length === 0 && <p className="text-gray-500">No comment likes recorded yet.</p>}
            </div>
          </div>
        </div>
      )}

      {modal && <ContentModal modal={modal} posts={posts} onClose={() => setModal(null)} onSave={saveModal} />}
    </div>
  )
}

function ContentModal({ modal, posts, onClose, onSave }: { modal: Exclude<ModalState, null>; posts: BlogPost[]; onClose: () => void; onSave: (payload: Record<string, any>) => Promise<void> }) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    if (modal.type === 'business-profile') {
      return {
        title: modal.item?.title || 'About THE BLUE WARDROBE',
        subtitle: modal.item?.subtitle || '',
        ceo_name: modal.item?.ceo_name || '',
        ceo_title: modal.item?.ceo_title || '',
        about_ceo: modal.item?.about_ceo || '',
        business_idea: modal.item?.business_idea || '',
        business_aims: modal.item?.business_aims || '',
        business_agenda: modal.item?.business_agenda || '',
        future_prospects: modal.item?.future_prospects || '',
        is_active: modal.item?.is_active ?? true,
      }
    }
    if (modal.type === 'blog-post') {
      return {
        title: modal.item?.title || '',
        excerpt: modal.item?.excerpt || '',
        content: modal.item?.content || '',
        is_featured: modal.item?.is_featured ?? false,
        is_published: modal.item?.is_published ?? true,
        allow_comments: modal.item?.allow_comments ?? true,
        published_at: modal.item?.published_at ? modal.item.published_at.slice(0, 16) : '',
      }
    }
    return {
      post_id: modal.item?.post_id || posts[0]?.id || '',
      media_type: modal.item?.media_type || 'image',
      caption: modal.item?.caption || '',
      alt_text: modal.item?.alt_text || '',
      order: modal.item?.order || 0,
    }
  })
  const [saving, setSaving] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave(formData)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <form onSubmit={submit} className="space-y-5 p-6">
          <div className="flex items-center justify-between border-b border-blue-wardrobe-light/10 pb-4">
            <h3 className="text-2xl font-serif text-blue-wardrobe-dark">{modal.item ? 'Edit' : 'Add'} {modal.type === 'business-profile' ? 'About / CEO Content' : modal.type === 'blog-post' ? 'Blog Post' : 'Blog Media'}</h3>
            <button type="button" onClick={onClose} className="text-sm text-gray-500">Close</button>
          </div>

          {modal.type === 'business-profile' && (
            <>
              {['title', 'subtitle', 'ceo_name', 'ceo_title'].map((field) => (
                <Field key={field} label={field.replaceAll('_', ' ')}>
                  <input type="text" value={formData[field]} onChange={(event) => setFormData({ ...formData, [field]: event.target.value })} className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3" />
                </Field>
              ))}
              <Field label="CEO photo">
                <input type="file" accept="image/*" onChange={(event) => setFormData({ ...formData, ceo_photo: event.target.files?.[0] })} className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3" />
              </Field>
              {['about_ceo', 'business_idea', 'business_aims', 'business_agenda', 'future_prospects'].map((field) => (
                <Field key={field} label={field.replaceAll('_', ' ')}>
                  <textarea value={formData[field]} onChange={(event) => setFormData({ ...formData, [field]: event.target.value })} rows={4} className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3" />
                </Field>
              ))}
            </>
          )}

          {modal.type === 'blog-post' && (
            <>
              <Field label="Title"><input type="text" value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3" required /></Field>
              <Field label="Excerpt"><textarea value={formData.excerpt} onChange={(event) => setFormData({ ...formData, excerpt: event.target.value })} rows={3} className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3" /></Field>
              <Field label="Content"><textarea value={formData.content} onChange={(event) => setFormData({ ...formData, content: event.target.value })} rows={10} className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3" required /></Field>
              <Field label="Cover image"><input type="file" accept="image/*" onChange={(event) => setFormData({ ...formData, cover_image: event.target.files?.[0] })} className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3" /></Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Published at"><input type="datetime-local" value={formData.published_at} onChange={(event) => setFormData({ ...formData, published_at: event.target.value })} className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3" /></Field>
                <div className="grid grid-cols-1 gap-3 rounded-2xl border border-blue-wardrobe-light/10 p-4">
                  {['is_featured', 'is_published', 'allow_comments'].map((field) => (
                    <label key={field} className="flex items-center gap-3 text-sm text-gray-700">
                      <input type="checkbox" checked={Boolean(formData[field])} onChange={(event) => setFormData({ ...formData, [field]: event.target.checked })} />
                      {field.replaceAll('_', ' ')}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {modal.type === 'blog-media' && (
            <>
              <Field label="Post">
                <select value={formData.post_id} onChange={(event) => setFormData({ ...formData, post_id: Number(event.target.value) })} className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3" required>
                  <option value="">Select a post</option>
                  {posts.map((post) => <option key={post.id} value={post.id}>{post.title}</option>)}
                </select>
              </Field>
              <Field label="Media file"><input type="file" accept="image/*,video/*,.gif" onChange={(event) => setFormData({ ...formData, file: event.target.files?.[0] })} className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3" required={!modal.item} /></Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Media type">
                  <select value={formData.media_type} onChange={(event) => setFormData({ ...formData, media_type: event.target.value })} className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3">
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="gif">GIF</option>
                    <option value="sticker">Sticker</option>
                  </select>
                </Field>
                <Field label="Order"><input type="number" value={formData.order} onChange={(event) => setFormData({ ...formData, order: Number(event.target.value) })} className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3" /></Field>
              </div>
              <Field label="Caption"><input type="text" value={formData.caption} onChange={(event) => setFormData({ ...formData, caption: event.target.value })} className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3" /></Field>
              <Field label="Alt text"><input type="text" value={formData.alt_text} onChange={(event) => setFormData({ ...formData, alt_text: event.target.value })} className="w-full rounded-2xl border border-blue-wardrobe-light/20 px-4 py-3" /></Field>
            </>
          )}

          <div className="flex gap-4 border-t border-blue-wardrobe-light/10 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-blue-wardrobe-light/20 px-5 py-3 text-blue-wardrobe-dark">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-full bg-blue-wardrobe-dark px-5 py-3 text-white hover:bg-blue-wardrobe-light disabled:opacity-60">{saving ? 'Saving...' : modal.item ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium capitalize text-gray-700">{label}</span>
      {children}
    </label>
  )
}
