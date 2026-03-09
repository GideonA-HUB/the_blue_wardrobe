from rest_framework import serializers

from .models import (
    BlogComment,
    BlogCommentLike,
    BlogPost,
    BlogPostLike,
    BlogPostMedia,
    BusinessProfile,
)


def build_file_url(request, field):
    if not field:
        return None
    try:
        url = field.url
    except Exception:
        return str(field)
    if request and not url.startswith(('http://', 'https://')):
        return request.build_absolute_uri(url)
    return url


class BusinessProfileSerializer(serializers.ModelSerializer):
    ceo_photo = serializers.SerializerMethodField()

    class Meta:
        model = BusinessProfile
        fields = [
            'id',
            'title',
            'subtitle',
            'ceo_name',
            'ceo_title',
            'ceo_photo',
            'about_ceo',
            'business_idea',
            'business_aims',
            'business_agenda',
            'future_prospects',
            'is_active',
            'updated_at',
        ]

    def get_ceo_photo(self, obj):
        return build_file_url(self.context.get('request'), obj.ceo_photo)


class BlogPostMediaSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    class Meta:
        model = BlogPostMedia
        fields = ['id', 'media_type', 'file', 'caption', 'alt_text', 'order', 'created_at']

    def get_file(self, obj):
        return build_file_url(self.context.get('request'), obj.file)


class BlogCommentLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCommentLike
        fields = ['id', 'visitor_name', 'visitor_email', 'created_at']


class BlogPostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPostLike
        fields = ['id', 'visitor_name', 'visitor_email', 'created_at']


class BlogCommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    liked_by_visitor = serializers.SerializerMethodField()
    parent_id = serializers.PrimaryKeyRelatedField(
        queryset=BlogComment.objects.all(),
        source='parent',
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = BlogComment
        fields = [
            'id',
            'post',
            'parent',
            'parent_id',
            'author_name',
            'author_email',
            'body',
            'is_approved',
            'likes_count',
            'liked_by_visitor',
            'replies',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['parent', 'post', 'replies', 'likes_count', 'liked_by_visitor', 'created_at', 'updated_at']

    def get_replies(self, obj):
        queryset = obj.replies.filter(is_approved=True).order_by('created_at')
        return BlogCommentSerializer(queryset, many=True, context=self.context).data

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_liked_by_visitor(self, obj):
        visitor_id = self.context.get('visitor_id')
        if not visitor_id:
            return False
        return obj.likes.filter(visitor_id=visitor_id).exists()


class BlogPostListSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    media_preview = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
            'cover_image',
            'is_featured',
            'published_at',
            'likes_count',
            'comments_count',
            'media_preview',
        ]

    def get_cover_image(self, obj):
        return build_file_url(self.context.get('request'), obj.cover_image)

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()

    def get_media_preview(self, obj):
        first_media = obj.media_items.order_by('order', 'created_at').first()
        if not first_media:
            return None
        return BlogPostMediaSerializer(first_media, context=self.context).data


class BlogPostDetailSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()
    media_items = BlogPostMediaSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    liked_by_visitor = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
            'content',
            'cover_image',
            'author_name',
            'is_featured',
            'allow_comments',
            'published_at',
            'likes_count',
            'comments_count',
            'liked_by_visitor',
            'media_items',
            'comments',
            'created_at',
            'updated_at',
        ]

    def get_cover_image(self, obj):
        return build_file_url(self.context.get('request'), obj.cover_image)

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_username()
        return None

    def get_comments(self, obj):
        queryset = obj.comments.filter(parent__isnull=True, is_approved=True).order_by('created_at')
        return BlogCommentSerializer(queryset, many=True, context=self.context).data

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()

    def get_liked_by_visitor(self, obj):
        visitor_id = self.context.get('visitor_id')
        if not visitor_id:
            return False
        return obj.likes.filter(visitor_id=visitor_id).exists()


class AdminBusinessProfileSerializer(serializers.ModelSerializer):
    ceo_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = BusinessProfile
        fields = [
            'id',
            'title',
            'subtitle',
            'ceo_name',
            'ceo_title',
            'ceo_photo',
            'ceo_photo_url',
            'about_ceo',
            'business_idea',
            'business_aims',
            'business_agenda',
            'future_prospects',
            'is_active',
            'created_at',
            'updated_at',
        ]

    def get_ceo_photo_url(self, obj):
        return build_file_url(self.context.get('request'), obj.ceo_photo)


class AdminBlogPostSerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
            'content',
            'cover_image',
            'cover_image_url',
            'author',
            'author_name',
            'is_featured',
            'is_published',
            'allow_comments',
            'published_at',
            'likes_count',
            'comments_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['slug', 'author_name', 'likes_count', 'comments_count', 'created_at', 'updated_at']

    def get_cover_image_url(self, obj):
        return build_file_url(self.context.get('request'), obj.cover_image)

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_username()
        return None

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()


class AdminBlogPostMediaSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    post_title = serializers.SerializerMethodField()
    post_id = serializers.PrimaryKeyRelatedField(queryset=BlogPost.objects.all(), source='post')

    class Meta:
        model = BlogPostMedia
        fields = ['id', 'post_id', 'post_title', 'file', 'file_url', 'media_type', 'caption', 'alt_text', 'order', 'created_at']
        read_only_fields = ['post_title', 'file_url', 'created_at']

    def get_file_url(self, obj):
        return build_file_url(self.context.get('request'), obj.file)

    def get_post_title(self, obj):
        return obj.post.title


class AdminBlogCommentSerializer(serializers.ModelSerializer):
    post_title = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    parent_id = serializers.PrimaryKeyRelatedField(queryset=BlogComment.objects.all(), source='parent', allow_null=True, required=False)

    class Meta:
        model = BlogComment
        fields = [
            'id',
            'post',
            'post_title',
            'parent',
            'parent_id',
            'author_name',
            'author_email',
            'visitor_id',
            'body',
            'is_approved',
            'likes_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['post_title', 'likes_count', 'parent', 'created_at', 'updated_at']

    def get_post_title(self, obj):
        return obj.post.title

    def get_likes_count(self, obj):
        return obj.likes.count()


class AdminBlogPostLikeSerializer(serializers.ModelSerializer):
    post_title = serializers.SerializerMethodField()

    class Meta:
        model = BlogPostLike
        fields = ['id', 'post', 'post_title', 'visitor_id', 'visitor_name', 'visitor_email', 'created_at']

    def get_post_title(self, obj):
        return obj.post.title


class AdminBlogCommentLikeSerializer(serializers.ModelSerializer):
    post_title = serializers.SerializerMethodField()
    comment_body = serializers.SerializerMethodField()

    class Meta:
        model = BlogCommentLike
        fields = ['id', 'comment', 'comment_body', 'post_title', 'visitor_id', 'visitor_name', 'visitor_email', 'created_at']

    def get_post_title(self, obj):
        return obj.comment.post.title

    def get_comment_body(self, obj):
        return obj.comment.body
