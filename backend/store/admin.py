import os
from django.contrib import admin
from django import forms
from django.core.exceptions import ValidationError
from .models import (
    Material, Collection, Design, DesignImage, SizeMeasurement, SizeInventory, Cart, CartItem, SiteAsset, Customer, Order, OrderItem,
    ContactMessage, Subscriber, PaymentLog, Video, VideoComment, VideoLike, VideoCommentLike, InfoCard,
    BusinessProfile, BlogPost, BlogPostMedia, BlogComment, BlogPostLike, BlogCommentLike, DesignReview,
)


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('name',)


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'is_featured', 'order', 'created_at')
    list_filter = ('is_featured', 'created_at')
    search_fields = ('code', 'title')
    list_editable = ('is_featured', 'order')
    ordering = ('order', 'code', '-created_at')
    filter_horizontal = ('materials',)


class DesignImageInline(admin.TabularInline):
    model = DesignImage
    extra = 1
    fields = ('image', 'alt_text', 'order')
    
    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        
        class DesignImageFormSet(formset):
            def clean(self):
                super().clean()
                for form in self.forms:
                    if form.cleaned_data and not form.cleaned_data.get('DELETE'):
                        image = form.cleaned_data.get('image')
                        if image and hasattr(image, 'size'):
                            if image.size > 52428800:  # 50MB for images
                                raise ValidationError(
                                    f'Image file is too large. Maximum size is 50MB. '
                                    f'Your file is {image.size / 1048576:.1f}MB.'
                                )
        
        return DesignImageFormSet


class SizeMeasurementInline(admin.TabularInline):
    model = SizeMeasurement
    extra = 0
    fields = ('size', 'bust', 'waist', 'hips', 'stock', 'is_active')


class SizeInventoryInline(admin.TabularInline):
    model = SizeInventory
    extra = 0
    fields = ('size', 'stock', 'is_active')


@admin.register(SizeMeasurement)
class SizeMeasurementAdmin(admin.ModelAdmin):
    list_display = ('design', 'size', 'bust', 'waist', 'hips', 'stock', 'is_active', 'availability_status')
    list_filter = ('size', 'is_active', 'stock')
    search_fields = ('design__title',)
    list_editable = ('stock', 'is_active')
    ordering = ('design', 'size')


from django.contrib import admin
from django import forms
from .models import (
    Collection, Design, DesignImage, SizeMeasurement, SizeInventory, Cart, CartItem, Material, SiteAsset, Order, OrderItem,
    Customer, ContactMessage, Subscriber, Video, VideoComment, VideoLike, VideoCommentLike, InfoCard, DesignReview
)


class DesignAdminForm(forms.ModelForm):
    """
    Custom form to handle video field properly and prevent string data issues
    """
    
    def clean_video(self):
        video = self.cleaned_data.get('video')
        if video:
            # Only validate file size for new uploads
            if hasattr(video, 'file') and video.file and hasattr(video, 'size'):
                if video.size > 104857600:  # 100MB
                    raise ValidationError(
                        f'Video file is too large. Maximum size is 100MB. '
                        f'Your file is {video.size / 1048576:.1f}MB.'
                    )
                return video
            # For existing files, return as-is without validation
            return video
        return video
    
    def save(self, commit=True):
        """
        Override save to handle video field properly
        """
        instance = super().save(commit=False)
        
        # Handle video field separately to prevent string data issues
        video = self.cleaned_data.get('video')
        if video and hasattr(video, 'file') and video.file:
            # Only set video if it's a proper file
            instance.video = video
        else:
            # Set to None for any other case
            instance.video = None
        
        if commit:
            instance.save()
        return instance
    
    class Meta:
        model = Design
        fields = '__all__'
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make auto fields not required in the form
        if 'created_at' in self.fields:
            self.fields['created_at'].required = False
        if 'updated_at' in self.fields:
            self.fields['updated_at'].required = False


@admin.register(Design)
class DesignAdmin(admin.ModelAdmin):
    form = DesignAdminForm
    list_display = ('sku', 'title', 'price', 'discount_price', 'get_total_stock', 'collection')
    search_fields = ('sku', 'title')
    list_filter = ('collection', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [DesignImageInline, SizeMeasurementInline, SizeInventoryInline]
    
    def get_total_stock(self, obj):
        total = sum(measurement.stock for measurement in obj.size_measurements.all())
        return total
    get_total_stock.short_description = 'Total Stock'
    
    def clean(self, obj):
        # Handle video field issues before saving
        if obj.video:
            # Check if video is a string (invalid for FileField)
            if isinstance(obj.video, str):
                print(f"Admin Warning: Video field for design {obj.id} contains string data. Setting to None.")
                obj.video = None
            # Check if video is a FileField but has issues
            elif hasattr(obj.video, 'name'):
                try:
                    # Try to access file properties to validate
                    _ = obj.video.name
                    if hasattr(obj.video, 'size'):
                        _ = obj.video.size
                except (AttributeError, ValueError, OSError) as e:
                    print(f"Admin Warning: Invalid video file for design {obj.id}: {e}. Setting to None.")
                    obj.video = None


@admin.register(DesignImage)
class DesignImageAdmin(admin.ModelAdmin):
    list_display = ('design', 'alt_text', 'order', 'created_at')
    list_filter = ('design', 'created_at')
    search_fields = ('design__title', 'alt_text')
    list_editable = ('order',)


@admin.register(SizeInventory)
class SizeInventoryAdmin(admin.ModelAdmin):
    list_display = ('design', 'size', 'stock', 'is_active', 'availability_status')
    list_filter = ('size', 'is_active', 'created_at')
    search_fields = ('design__title',)
    list_editable = ('stock', 'is_active')
    
    def availability_status(self, obj):
        return obj.availability_status
    availability_status.short_description = 'Status'


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'customer_email', 'total_items', 'total_amount', 'created_at')
    search_fields = ('session_id', 'customer_email')
    readonly_fields = ('created_at', 'updated_at')
    
    def total_items(self, obj):
        return obj.total_items
    
    def total_amount(self, obj):
        return obj.total_amount


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'design', 'size_measurement', 'quantity', 'unit_price', 'subtotal', 'is_available')
    list_filter = ('size_measurement__size', 'created_at')
    search_fields = ('design__title', 'cart__session_id')
    
    def subtotal(self, obj):
        return obj.subtotal
    
    def is_available(self, obj):
        return obj.is_available
    is_available.boolean = True


class SiteAssetForm(forms.ModelForm):
    class Meta:
        model = SiteAsset
        fields = '__all__'
        help_texts = {
            'name': 'IMPORTANT: Use exact names only: "logo_primary" (navbar logo), "favicon" (browser tab), "logo_light", or "logo_dark"',
        }
    
    def clean_name(self):
        name = self.cleaned_data.get('name')
        valid_names = ['logo_primary', 'favicon', 'logo_light', 'logo_dark']
        if name and name not in valid_names:
            raise ValidationError(
                f'Name must be one of: {", ".join(valid_names)}. '
                f'You entered "{name}". Please use the exact name from the list.'
            )
        return name


@admin.register(SiteAsset)
class SiteAssetAdmin(admin.ModelAdmin):
    form = SiteAssetForm
    list_display = ('name', 'uploaded_at', 'preview')
    list_filter = ('name', 'uploaded_at')
    search_fields = ('name',)
    
    fieldsets = (
        ('Asset Information', {
            'fields': ('name', 'file'),
            'description': (
                '<div style="background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin-bottom: 10px;">'
                '<strong>⚠️ IMPORTANT:</strong> Use EXACT names only:<br>'
                '• <strong>logo_primary</strong> - Logo shown in navbar<br>'
                '• <strong>favicon</strong> - Icon shown in browser tab<br>'
                '• <strong>logo_light</strong> - Light theme variant<br>'
                '• <strong>logo_dark</strong> - Dark theme variant<br>'
                'Any other name will NOT be displayed on the website!'
                '</div>'
            ),
        }),
    )
    
    def preview(self, obj):
        if obj.file:
            from django.utils.html import format_html
            return format_html('<img src="{}" style="max-width: 50px; max-height: 50px; border: 1px solid #ddd;" />', obj.file.url)
        return 'No image'
    preview.short_description = 'Preview'


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'created_at')


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    inlines = [OrderItemInline]


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at')


@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'subscribed_at')


@admin.register(PaymentLog)
class PaymentLogAdmin(admin.ModelAdmin):
    list_display = ('reference', 'status', 'amount', 'paid_at', 'created_at')
    search_fields = ('reference',)


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'video_type', 'views', 'likes_count', 'comments_count', 'is_featured', 'order', 'created_at')
    list_filter = ('video_type', 'is_featured', 'created_at')
    search_fields = ('title', 'description')
    list_editable = ('is_featured', 'order')
    readonly_fields = ('views', 'likes_count', 'comments_count', 'created_at')
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'video_type')
        }),
        ('Video Content', {
            'fields': ('video_file', 'video_url'),
            'description': 'Upload a video file directly OR provide an external video URL (not both).'
        }),
        ('Thumbnail', {
            'fields': ('thumbnail',),
            'classes': ('collapse',)
        }),
        ('Display Options', {
            'fields': ('is_featured', 'order')
        }),
        ('Statistics', {
            'fields': ('views', 'likes_count', 'comments_count'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # Ensure only one video source is used
        if obj.video_file and obj.video_url:
            # If both are provided, prioritize the uploaded file
            obj.video_url = ''
        elif not obj.video_file and not obj.video_url:
            # If neither is provided, that's fine (video might be added later)
            pass
        super().save_model(request, obj, form, change)


@admin.register(VideoComment)
class VideoCommentAdmin(admin.ModelAdmin):
    list_display = ('video', 'name', 'email', 'content_preview', 'parent', 'is_active', 'likes_count', 'created_at')
    list_filter = ('is_active', 'created_at', 'video')
    search_fields = ('name', 'email', 'content', 'video__title')
    list_editable = ('is_active',)
    readonly_fields = ('likes_count', 'created_at')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('video', 'parent')


@admin.register(VideoLike)
class VideoLikeAdmin(admin.ModelAdmin):
    list_display = ('video', 'ip_address', 'session_key', 'created_at')
    list_filter = ('created_at', 'video')
    search_fields = ('video__title', 'ip_address', 'session_key')
    readonly_fields = ('created_at',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('video')


@admin.register(VideoCommentLike)
class VideoCommentLikeAdmin(admin.ModelAdmin):
    list_display = ('comment', 'comment_author', 'ip_address', 'session_key', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('comment__content', 'comment__name', 'ip_address', 'session_key')
    readonly_fields = ('created_at',)
    
    def comment_author(self, obj):
        return obj.comment.name
    comment_author.short_description = 'Comment Author'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('comment')


@admin.register(InfoCard)
class InfoCardAdmin(admin.ModelAdmin):
    list_display = ('title', 'color', 'is_active', 'order', 'created_at')
    list_filter = ('color', 'is_active')
    search_fields = ('title', 'description')
    list_editable = ('is_active', 'order', 'color')


@admin.register(BusinessProfile)
class BusinessProfileAdmin(admin.ModelAdmin):
    list_display = ('title', 'ceo_name', 'ceo_title', 'is_active', 'updated_at')
    list_filter = ('is_active', 'updated_at')
    search_fields = ('title', 'ceo_name', 'ceo_title')
    list_editable = ('is_active',)


class BlogPostMediaInline(admin.TabularInline):
    model = BlogPostMedia
    extra = 0
    fields = ('media_type', 'file', 'caption', 'alt_text', 'order')


class BlogCommentInline(admin.TabularInline):
    model = BlogComment
    extra = 0
    fields = ('author_name', 'author_email', 'body', 'parent', 'is_approved', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'is_published', 'is_featured', 'allow_comments', 'published_at', 'likes_count', 'comments_count')
    list_filter = ('is_published', 'is_featured', 'allow_comments', 'published_at')
    search_fields = ('title', 'slug', 'excerpt', 'content')
    list_editable = ('is_published', 'is_featured', 'allow_comments')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [BlogPostMediaInline, BlogCommentInline]

    def likes_count(self, obj):
        return obj.likes.count()

    def comments_count(self, obj):
        return obj.comments.count()


@admin.register(BlogPostMedia)
class BlogPostMediaAdmin(admin.ModelAdmin):
    list_display = ('post', 'media_type', 'order', 'created_at')
    list_filter = ('media_type', 'created_at')
    search_fields = ('post__title', 'caption', 'alt_text')
    list_editable = ('order',)


@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ('author_name', 'author_email', 'post', 'parent', 'is_approved', 'likes_count', 'created_at')
    list_filter = ('is_approved', 'created_at')
    search_fields = ('author_name', 'author_email', 'body', 'post__title')
    list_editable = ('is_approved',)

    def likes_count(self, obj):
        return obj.likes.count()


@admin.register(BlogPostLike)
class BlogPostLikeAdmin(admin.ModelAdmin):
    list_display = ('post', 'visitor_name', 'visitor_email', 'visitor_id', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('post__title', 'visitor_name', 'visitor_email', 'visitor_id')


@admin.register(BlogCommentLike)
class BlogCommentLikeAdmin(admin.ModelAdmin):
    list_display = ('comment', 'visitor_name', 'visitor_email', 'visitor_id', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('comment__body', 'comment__post__title', 'visitor_name', 'visitor_email', 'visitor_id')


@admin.register(DesignReview)
class DesignReviewAdmin(admin.ModelAdmin):
    list_display = ('design', 'name', 'email', 'rating', 'stars_display', 'is_approved', 'created_at')
    list_filter = ('rating', 'is_approved', 'created_at', 'design__collection')
    search_fields = ('design__title', 'design__sku', 'name', 'email', 'comment')
    readonly_fields = ('created_at', 'updated_at', 'stars_display')
    list_editable = ('is_approved',)
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Review Information', {
            'fields': ('design', 'name', 'email', 'rating', 'comment')
        }),
        ('Status', {
            'fields': ('is_approved',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'stars_display'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('design', 'design__collection')
