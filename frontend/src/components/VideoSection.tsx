import React, { useEffect, useState } from 'react'
import api from '../lib/api'

type Video = {
  id: number
  title: string
  description: string
  video_file?: string
  video_file_url?: string
  video_url?: string
  thumbnail?: string
  thumbnail_url?: string
  video_type: string
  views: number
  likes_count: number
  comments_count: number
  is_liked: boolean
  created_at: string
}

type Comment = {
  id: number
  name: string
  email: string
  content: string
  is_reply: boolean
  likes_count: number
  is_liked: boolean
  replies: Comment[]
  created_at: string
}

export default function VideoSection() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [playingVideo, setPlayingVideo] = useState<number | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState({ name: '', email: '', content: '' })
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyName, setReplyName] = useState('')
  const [replyEmail, setReplyEmail] = useState('')

  useEffect(() => {
    api
      .get('/videos/')
      .then((r) => {
        setVideos(r.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleVideoPlay = async (video: Video) => {
    setPlayingVideo(video.id)
    
    // Increment views
    try {
      await api.post(`/videos/${video.id}/increment_views/`)
    } catch (error) {
      console.log('Failed to increment views')
    }
  }

  const handleLike = async (videoId: number) => {
    try {
      const response = await api.post(`/videos/${videoId}/like/`)
      setVideos(videos.map(video => 
        video.id === videoId 
          ? { ...video, likes_count: response.data.likes_count, is_liked: response.data.liked }
          : video
      ))
    } catch (error) {
      console.log('Failed to like video')
    }
  }

  const loadComments = async (videoId: number) => {
    try {
      const response = await api.get(`/videos/${videoId}/comments/`)
      setComments(response.data)
    } catch (error) {
      console.log('Failed to load comments')
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVideo || !newComment.content.trim()) return

    try {
      const commentData = {
        name: newComment.name,
        email: newComment.email,
        content: newComment.content
        // Explicitly exclude parent field for top-level comments
      }
      
      const response = await api.post(`/videos/${selectedVideo.id}/comments/`, commentData)
      setComments([...comments, response.data])
      setNewComment({ name: '', email: '', content: '' })
      
      // Update comments count
      setVideos(videos.map(video => 
        video.id === selectedVideo.id 
          ? { ...video, comments_count: video.comments_count + 1 }
          : video
      ))
    } catch (error) {
      console.log('Failed to submit comment')
    }
  }

  const handleCommentLike = async (commentId: number) => {
    if (!selectedVideo) return
    
    try {
      const response = await api.post(`/videos/${selectedVideo.id}/comments/${commentId}/like/`)
      
      const updateCommentLikes = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes_count: response.data.likes_count,
              is_liked: response.data.liked
            }
          }
          if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentLikes(comment.replies)
            }
          }
          return comment
        })
      }
      
      setComments(updateCommentLikes(comments))
    } catch (error) {
      console.log('Failed to like comment')
    }
  }

  const handleReplySubmit = async (e: React.FormEvent, parentCommentId: number) => {
    e.preventDefault()
    if (!selectedVideo || !replyContent.trim()) return

    try {
      const response = await api.post(`/videos/${selectedVideo.id}/comments/`, {
        name: replyName,
        email: replyEmail,
        content: replyContent,
        parent: parentCommentId
      })
      
      setComments(comments.map(comment => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            replies: [...comment.replies, response.data]
          }
        }
        return comment
      }))
      
      // Reset reply form
      setReplyingTo(null)
      setReplyContent('')
      setReplyName('')
      setReplyEmail('')
      
      // Update comments count
      setVideos(videos.map(video => 
        video.id === selectedVideo.id 
          ? { ...video, comments_count: video.comments_count + 1 }
          : video
      ))
    } catch (error) {
      console.log('Failed to submit reply')
    }
  }

  const openVideoModal = (video: Video) => {
    setSelectedVideo(video)
    setShowComments(false)
    loadComments(video.id)
  }

  if (loading || videos.length === 0) return null

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
                    {video.video_file_url ? (
                      <video
                        src={video.video_file_url}
                        controls
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        onError={() => setPlayingVideo(null)}
                      />
                    ) : video.video_url ? (
                      <video
                        src={video.video_url}
                        controls
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        onError={() => setPlayingVideo(null)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-16 h-16 text-blue-wardrobe-light mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="text-blue-wardrobe-dark font-medium">Video not available</div>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => setPlayingVideo(null)}
                      className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    {video.thumbnail_url || video.thumbnail ? (
                      <img
                        src={video.thumbnail_url || video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <svg className="w-16 h-16 text-blue-wardrobe-light" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
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
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{video.description}</p>
                )}
                
                {/* Social Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {video.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {video.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {video.comments_count}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLike(video.id)}
                    className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      video.is_liked
                        ? 'bg-blue-wardrobe-dark text-white hover:bg-blue-wardrobe-light'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {video.is_liked ? 'Liked' : 'Like'}
                    </span>
                  </button>
                  <button
                    onClick={() => openVideoModal(video)}
                    className="flex-1 px-4 py-2 bg-blue-wardrobe-dark text-white rounded-full text-sm font-medium hover:bg-blue-wardrobe-light transition-all duration-300"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h3 className="text-2xl font-serif font-semibold text-blue-wardrobe-dark">
                  {selectedVideo.title}
                </h3>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                {/* Video Player */}
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                  {selectedVideo.video_file_url ? (
                    <video
                      src={selectedVideo.video_file_url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : selectedVideo.video_url ? (
                    <video
                      src={selectedVideo.video_url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-white">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>Video not available</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">{selectedVideo.description}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {selectedVideo.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {selectedVideo.likes_count} likes
                    </span>
                  </div>
                </div>

                {/* Comments Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-blue-wardrobe-dark">
                      Comments ({selectedVideo.comments_count})
                    </h4>
                    <button
                      onClick={() => setShowComments(!showComments)}
                      className="text-sm text-blue-wardrobe-dark hover:text-blue-wardrobe-light"
                    >
                      {showComments ? 'Hide' : 'Show'} Comments
                    </button>
                  </div>

                  {showComments && (
                    <div className="space-y-6">
                      {/* Comment Form */}
                      <form onSubmit={handleCommentSubmit} className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input
                            type="text"
                            placeholder="Your Name"
                            value={newComment.name}
                            onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                            required
                          />
                          <input
                            type="email"
                            placeholder="Your Email"
                            value={newComment.email}
                            onChange={(e) => setNewComment({...newComment, email: e.target.value})}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                            required
                          />
                        </div>
                        <textarea
                          placeholder="Share your thoughts..."
                          value={newComment.content}
                          onChange={(e) => setNewComment({...newComment, content: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light resize-none"
                          rows={3}
                          required
                        />
                        <button
                          type="submit"
                          className="mt-4 px-6 py-2 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-all duration-300"
                        >
                          Post Comment
                        </button>
                      </form>

                      {/* Comments List */}
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-semibold text-blue-wardrobe-dark">{comment.name}</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCommentLike(comment.id)}
                                  className={`flex items-center gap-1 text-sm transition-colors ${
                                    comment.is_liked
                                      ? 'text-blue-wardrobe-dark'
                                      : 'text-gray-500 hover:text-blue-wardrobe-dark'
                                  }`}
                                >
                                  <svg className="w-4 h-4" fill={comment.is_liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  {comment.likes_count}
                                </button>
                                <button
                                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                  className="text-sm text-blue-wardrobe-dark hover:text-blue-wardrobe-light"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                            
                            {/* Reply Form */}
                            {replyingTo === comment.id && (
                              <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-4 bg-gray-50 rounded-lg p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={replyName}
                                    onChange={(e) => setReplyName(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light text-sm"
                                    required
                                  />
                                  <input
                                    type="email"
                                    placeholder="Your Email"
                                    value={replyEmail}
                                    onChange={(e) => setReplyEmail(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light text-sm"
                                    required
                                  />
                                </div>
                                <textarea
                                  placeholder="Write your reply..."
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light resize-none text-sm"
                                  rows={2}
                                  required
                                />
                                <div className="flex gap-2 mt-3">
                                  <button
                                    type="submit"
                                    className="px-4 py-1 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-all duration-300 text-sm"
                                  >
                                    Reply
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReplyingTo(null)
                                      setReplyContent('')
                                      setReplyName('')
                                      setReplyEmail('')
                                    }}
                                    className="px-4 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all duration-300 text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            )}
                            
                            {/* Replies */}
                            {comment.replies.length > 0 && (
                              <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <div className="font-semibold text-blue-wardrobe-dark text-sm">{reply.name}</div>
                                        <div className="text-xs text-gray-500">
                                          {new Date(reply.created_at).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleCommentLike(reply.id)}
                                        className={`flex items-center gap-1 text-sm transition-colors ${
                                          reply.is_liked
                                            ? 'text-blue-wardrobe-dark'
                                            : 'text-gray-500 hover:text-blue-wardrobe-dark'
                                        }`}
                                      >
                                        <svg className="w-3 h-3" fill={reply.is_liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        {reply.likes_count}
                                      </button>
                                    </div>
                                    <p className="text-gray-700 text-sm">{reply.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

