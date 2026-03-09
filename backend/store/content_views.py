import hashlib

from django.db.models import Prefetch
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .content_serializers import (
    AdminBlogCommentLikeSerializer,
    AdminBlogCommentSerializer,
    AdminBlogPostLikeSerializer,
    AdminBlogPostMediaSerializer,
    AdminBlogPostSerializer,
    AdminBusinessProfileSerializer,
    BlogCommentSerializer,
    BlogPostDetailSerializer,
    BlogPostListSerializer,
    BusinessProfileSerializer,
)
from .models import (
    BlogComment,
    BlogCommentLike,
    BlogPost,
    BlogPostLike,
    BlogPostMedia,
    BusinessProfile,
)


def get_visitor_id(request):
    session = getattr(request, 'session', None)
    if session is not None:
        if not session.session_key:
            session.save()
        if session.session_key:
            return session.session_key

    remote_addr = request.META.get('REMOTE_ADDR', '')
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    digest = hashlib.sha1(f'{remote_addr}:{user_agent}'.encode('utf-8')).hexdigest()[:24]
    return f'anon-{digest}'


class BusinessProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BusinessProfile.objects.filter(is_active=True).order_by('-updated_at', '-created_at')
    serializer_class = BusinessProfileSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BlogPost.objects.filter(is_published=True).prefetch_related(
        'media_items',
        Prefetch('comments', queryset=BlogComment.objects.select_related('parent').prefetch_related('likes', 'replies__likes')),
        'likes',
    ).select_related('author')
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BlogPostDetailSerializer
        return BlogPostListSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        context['visitor_id'] = get_visitor_id(self.request)
        return context

    @action(detail=True, methods=['post'])
    @authentication_classes([])
    @permission_classes([AllowAny])
    def comments(self, request, slug=None):
        post = self.get_object()
        if not post.allow_comments:
            return Response({'detail': 'Comments are disabled for this post.'}, status=status.HTTP_403_FORBIDDEN)

        author_name = (request.data.get('author_name') or '').strip()
        author_email = (request.data.get('author_email') or '').strip()
        body = (request.data.get('body') or '').strip()
        parent_id = request.data.get('parent_id')

        if not author_name or not author_email or not body:
            return Response({'detail': 'Name, email, and comment body are required.'}, status=status.HTTP_400_BAD_REQUEST)

        parent = None
        if parent_id:
            parent = BlogComment.objects.filter(post=post, pk=parent_id).first()
            if parent is None:
                return Response({'detail': 'Reply target was not found.'}, status=status.HTTP_404_NOT_FOUND)

        comment = BlogComment.objects.create(
            post=post,
            parent=parent,
            author_name=author_name,
            author_email=author_email,
            visitor_id=get_visitor_id(request),
            body=body,
            is_approved=True,
        )
        serializer = BlogCommentSerializer(comment, context={'request': request, 'visitor_id': get_visitor_id(request)})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    @authentication_classes([])
    @permission_classes([AllowAny])
    def toggle_like(self, request, slug=None):
        post = self.get_object()
        visitor_id = get_visitor_id(request)
        like = BlogPostLike.objects.filter(post=post, visitor_id=visitor_id).first()
        if like:
            like.delete()
            liked = False
        else:
            BlogPostLike.objects.create(
                post=post,
                visitor_id=visitor_id,
                visitor_name=(request.data.get('visitor_name') or '').strip(),
                visitor_email=(request.data.get('visitor_email') or '').strip(),
            )
            liked = True
        likes_count = BlogPostLike.objects.filter(post=post).count()
        return Response({'liked': liked, 'likes_count': likes_count})


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def toggle_comment_like(request, comment_id):
    comment = BlogComment.objects.filter(pk=comment_id, is_approved=True).select_related('post').first()
    if comment is None:
        return Response({'detail': 'Comment not found.'}, status=status.HTTP_404_NOT_FOUND)

    visitor_id = get_visitor_id(request)
    like = BlogCommentLike.objects.filter(comment=comment, visitor_id=visitor_id).first()
    if like:
        like.delete()
        liked = False
    else:
        BlogCommentLike.objects.create(
            comment=comment,
            visitor_id=visitor_id,
            visitor_name=(request.data.get('visitor_name') or '').strip(),
            visitor_email=(request.data.get('visitor_email') or '').strip(),
        )
        liked = True

    likes_count = BlogCommentLike.objects.filter(comment=comment).count()
    return Response({'liked': liked, 'likes_count': likes_count})


class AdminBusinessProfileViewSet(viewsets.ModelViewSet):
    queryset = BusinessProfile.objects.all().order_by('-updated_at', '-created_at')
    serializer_class = AdminBusinessProfileSerializer
    permission_classes = [IsAdminUser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class AdminBlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all().select_related('author').prefetch_related('likes', 'comments').order_by('-published_at', '-created_at')
    serializer_class = AdminBlogPostSerializer
    permission_classes = [IsAdminUser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, published_at=serializer.validated_data.get('published_at') or timezone.now())


class AdminBlogPostMediaViewSet(viewsets.ModelViewSet):
    queryset = BlogPostMedia.objects.all().select_related('post').order_by('post__title', 'order', 'created_at')
    serializer_class = AdminBlogPostMediaSerializer
    permission_classes = [IsAdminUser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class AdminBlogCommentViewSet(viewsets.ModelViewSet):
    queryset = BlogComment.objects.all().select_related('post', 'parent').prefetch_related('likes').order_by('-created_at')
    serializer_class = AdminBlogCommentSerializer
    permission_classes = [IsAdminUser]


class AdminBlogPostLikeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BlogPostLike.objects.all().select_related('post').order_by('-created_at')
    serializer_class = AdminBlogPostLikeSerializer
    permission_classes = [IsAdminUser]


class AdminBlogCommentLikeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BlogCommentLike.objects.all().select_related('comment', 'comment__post').order_by('-created_at')
    serializer_class = AdminBlogCommentLikeSerializer
    permission_classes = [IsAdminUser]
