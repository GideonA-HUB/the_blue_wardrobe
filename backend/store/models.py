from django.conf import settings
from django.db import models
from django.db.models import Avg
from django.utils.text import slugify
from django.utils import timezone
from django.core.files.storage import default_storage


class Material(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Collection(models.Model):
    code = models.CharField(max_length=50, unique=True)  # e.g., DDC 001
    title = models.CharField(max_length=200)
    story = models.TextField(blank=True)
    materials = models.ManyToManyField(Material, blank=True)
    featured_image = models.ImageField(upload_to='collections/', blank=True, null=True)
    is_featured = models.BooleanField(default=True)
    order = models.IntegerField(default=0, help_text='Display order (lower numbers first)')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['order', 'code', '-created_at']

    def __str__(self):
        return f"{self.code} - {self.title}"


class SafeVideoField(models.FileField):
    """
    A FileField that gracefully handles string data and prevents AttributeError
    """
    def pre_save(self, model_instance, add):
        """
        Override pre_save to handle string data gracefully
        """
        value = getattr(model_instance, self.attname)
        
        # If value is a string, return None immediately to prevent errors
        if isinstance(value, str):
            print(f"Warning: SafeVideoField pre_save detected string data for {model_instance.__class__.__name__} {getattr(model_instance, 'id', 'new')}: '{value}'. Returning None.")
            setattr(model_instance, self.attname, None)
            return None
        
        # If value exists but has issues, validate it
        if value and hasattr(value, 'name'):
            try:
                # Try to access file properties to validate
                _ = value.name
                if hasattr(value, 'size'):
                    _ = value.size
            except (AttributeError, ValueError, OSError) as e:
                print(f"Warning: SafeVideoField pre_save detected invalid file for {model_instance.__class__.__name__} {getattr(model_instance, 'id', 'new')}: {e}. Returning None.")
                setattr(model_instance, self.attname, None)
                return None
        
        # For all cases, return None to prevent file saving issues
        # In production, valid video files will be handled by Django's normal FileField
        # This prevents the storage.generate_filename error
        return None


def get_video_storage():
        """Get the appropriate video storage backend with fallback"""
        try:
            from django.conf import settings
            
            print(f"DEBUG: Getting video storage, USE_CLOUDINARY: {getattr(settings, 'USE_CLOUDINARY', False)}")
            
            # Check if Cloudinary is enabled
            if getattr(settings, 'USE_CLOUDINARY', False):
                try:
                    from django.core.files.storage import storages
                    # Try to get video_storage from STORAGES setting
                    video_storage = storages['video_storage']
                    print(f"DEBUG: Using video_storage from STORAGES: {type(video_storage)}")
                    return video_storage
                except Exception as storage_error:
                    print(f"DEBUG: Failed to get video_storage from STORAGES: {storage_error}")
                    # Fallback to creating LargeVideoCloudinaryStorage directly
                    from bluewardrobe.storage import LargeVideoCloudinaryStorage
                    print(f"DEBUG: Creating LargeVideoCloudinaryStorage directly")
                    return LargeVideoCloudinaryStorage()
            else:
                # Use FileSystemStorage when Cloudinary is not enabled
                print(f"DEBUG: Cloudinary not enabled, using FileSystemStorage")
                from django.core.files.storage import FileSystemStorage
                return FileSystemStorage()
                    
        except Exception as e:
            print(f"ERROR: Failed to get video_storage: {e}, falling back to FileSystemStorage")
            from django.core.files.storage import FileSystemStorage
            return FileSystemStorage()


class Design(models.Model):
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, related_name='designs')
    sku = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text='Price in NGN')
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text='Discounted price in NGN')
    video = models.FileField(
        upload_to='designs/videos/', 
        null=True, 
        blank=True, 
        storage=get_video_storage,
        help_text='Product video file (MP4, WebM, etc.)'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sku} - {self.title}"

    @property
    def has_discount(self):
        return self.discount_price is not None and self.discount_price < self.price

    @property
    def effective_price(self):
        return self.discount_price if self.has_discount else self.price

    @property
    def discount_percentage(self):
        if self.has_discount:
            return int(((self.price - self.discount_price) / self.price) * 100)
        return 0

    @property
    def average_rating(self):
        """Calculate average rating from approved reviews"""
        reviews = self.reviews.filter(is_approved=True)
        if not reviews.exists():
            return 0
        return round(reviews.aggregate(models.Avg('rating'))['rating__avg'], 1)

    @property
    def total_reviews(self):
        """Get total count of approved reviews"""
        return self.reviews.filter(is_approved=True).count()

    @property
    def rating_distribution(self):
        """Get distribution of ratings (1-5 stars)"""
        distribution = {}
        for i in range(1, 6):
            distribution[i] = self.reviews.filter(is_approved=True, rating=i).count()
        return distribution


class DesignImage(models.Model):
    design = models.ForeignKey(Design, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='designs/images/')
    alt_text = models.CharField(max_length=255, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"Image for {self.design.title}"


class SizeMeasurement(models.Model):
    SIZE_CHOICES = [(i, str(i)) for i in range(6, 21)]  # Sizes 6 to 20
    
    design = models.ForeignKey(Design, related_name='size_measurements', on_delete=models.CASCADE)
    size = models.IntegerField(choices=SIZE_CHOICES)
    bust = models.DecimalField(max_digits=5, decimal_places=1)  # e.g., 32.5 inches
    waist = models.DecimalField(max_digits=5, decimal_places=1)  # e.g., 25.0 inches
    hips = models.DecimalField(max_digits=5, decimal_places=1)  # e.g., 35.5 inches
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['design', 'size']
        ordering = ['size']

    def __str__(self):
        return f"{self.design.title} - Size {self.size} (B:{self.bust} W:{self.waist} H:{self.hips})"

    @property
    def is_in_stock(self):
        return self.stock > 0 and self.is_active

    @property
    def availability_status(self):
        if not self.is_active:
            return "unavailable"
        elif self.stock == 0:
            return "out_of_stock"
        elif self.stock <= 5:
            return "low_stock"
        else:
            return "available"


class SizeInventory(models.Model):
    SIZE_CHOICES = [(i, str(i)) for i in range(8, 21)]  # Sizes 8 to 20
    
    design = models.ForeignKey(Design, related_name='size_inventory', on_delete=models.CASCADE)
    size = models.IntegerField(choices=SIZE_CHOICES)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['design', 'size']
        ordering = ['size']

    def __str__(self):
        return f"{self.design.title} - Size {self.size} ({self.stock} in stock)"

    @property
    def is_in_stock(self):
        return self.stock > 0 and self.is_active

    @property
    def availability_status(self):
        if not self.is_active:
            return "unavailable"
        elif self.stock == 0:
            return "out_of_stock"
        elif self.stock <= 5:
            return "low_stock"
        else:
            return "available"


class Cart(models.Model):
    session_id = models.CharField(max_length=255, unique=True)
    customer_email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart {self.session_id} ({self.items.count()} items)"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def total_amount(self):
        return sum(item.subtotal for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    design = models.ForeignKey(Design, on_delete=models.CASCADE)
    size_measurement = models.ForeignKey(SizeMeasurement, on_delete=models.CASCADE, null=True, blank=True)
    size = models.IntegerField(choices=SizeInventory.SIZE_CHOICES, null=True, blank=True)  # Keep for migration
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['cart', 'design', 'size_measurement']

    def __str__(self):
        if self.size_measurement:
            return f"{self.quantity} x {self.design.title} (Size {self.size_measurement.size} - B:{self.size_measurement.bust} W:{self.size_measurement.waist} H:{self.size_measurement.hips})"
        else:
            return f"{self.quantity} x {self.design.title} (Size {self.size})"

    @property
    def unit_price(self):
        return self.design.effective_price

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

    @property
    def is_available(self):
        if self.size_measurement:
            return self.size_measurement.is_in_stock and self.size_measurement.stock >= self.quantity
        return False

    @property
    def size(self):
        return self.size_measurement.size if self.size_measurement else self.size


class SiteAsset(models.Model):
    name = models.CharField(max_length=100, help_text='favicon, logo_primary, logo_light, logo_dark')
    file = models.ImageField(upload_to='assets/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class HomeHeroCopy(models.Model):
    """
    Singleton-style home hero copy (use pk=1). Editable headline and tagline for the marquee hero.
    """

    tagline = models.CharField(max_length=200, default='Discover Timeless Elegance')
    title_line_1 = models.CharField(max_length=120, default='THE BLUE')
    title_line_2 = models.CharField(max_length=120, default='WARDROBE')
    description = models.TextField(
        default='Rare fabrics. Timeless design. Global luxury. Experience our exclusive collections crafted with attention to detail and the finest materials.'
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Home hero text'
        verbose_name_plural = 'Home hero text'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        return

    def __str__(self):
        return 'Home hero text'


class HeroMarqueeSlide(models.Model):
    """Images for the animated marquee strip on the home hero (scrolls horizontally)."""

    image = models.ImageField(upload_to='hero/marquee/')
    alt_text = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', 'id']
        verbose_name = 'Hero marquee image'
        verbose_name_plural = 'Hero marquee images'

    def __str__(self):
        return f'Hero slide {self.id}'


class AtelierStorySlide(models.Model):
    """Accordion / interactive selector under “The Atelier” intro — craftsmanship stories."""

    ICON_SPARKLES = 'sparkles'
    ICON_SCISSORS = 'scissors'
    ICON_SHIRT = 'shirt'
    ICON_GEM = 'gem'
    ICON_AWARD = 'award'
    ICON_CHOICES = [
        (ICON_SPARKLES, 'Sparkles — craft & detail'),
        (ICON_SCISSORS, 'Scissors — tailoring'),
        (ICON_SHIRT, 'Garment / fabric'),
        (ICON_GEM, 'Gem — luxury'),
        (ICON_AWARD, 'Award — excellence'),
    ]

    title = models.CharField(max_length=200)
    description = models.CharField(max_length=400)
    image = models.ImageField(upload_to='atelier/selector/')
    icon_key = models.CharField(max_length=20, choices=ICON_CHOICES, default=ICON_SPARKLES)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', 'id']
        verbose_name = 'Atelier story slide'
        verbose_name_plural = 'Atelier story slides'

    def __str__(self):
        return self.title


class Customer(models.Model):
    email = models.EmailField()
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    PAYMENT_PROVIDER_CHOICES = [
        ('paystack', 'Paystack'),
        ('flutterwave', 'Flutterwave'),
    ]
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    delivery_address = models.TextField(blank=True, default='')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_provider = models.CharField(
        max_length=20,
        choices=PAYMENT_PROVIDER_CHOICES,
        blank=True,
        default='',
        help_text='Gateway used for this order (set automatically on payment)',
    )
    paystack_reference = models.CharField(max_length=200, blank=True)
    flutterwave_tx_ref = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    design = models.ForeignKey(Design, on_delete=models.PROTECT)
    size = models.IntegerField(choices=SizeInventory.SIZE_CHOICES)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.design.title} (Size {self.size})"


class PaymentLog(models.Model):
    """
    Lightweight payment log so the owner can audit payment gateway transactions.
    """
    order = models.ForeignKey(Order, related_name='payments', on_delete=models.CASCADE, null=True, blank=True)
    gateway = models.CharField(max_length=20, blank=True, help_text='paystack or flutterwave')
    reference = models.CharField(max_length=200, db_index=True)
    status = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    raw_response = models.JSONField(default=dict, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reference} - {self.status}"


class ContactMessage(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name}"


class Subscriber(models.Model):
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


class DesignReview(models.Model):
    """Reviews for designs with star ratings and comments"""
    design = models.ForeignKey(Design, on_delete=models.CASCADE, related_name='reviews')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    rating = models.IntegerField(
        choices=[(i, i) for i in range(1, 6)],  # 1 to 5 stars
        help_text='Rating from 1 to 5 stars'
    )
    comment = models.TextField()
    is_approved = models.BooleanField(default=True, help_text='Whether the review is approved and visible')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['design', 'email']  # One review per email per design

    def __str__(self):
        return f'Review by {self.name} for {self.design.title}'

    @property
    def stars_display(self):
        """Return star display (e.g., '★★★★☆')"""
        full_stars = '★' * self.rating
        empty_stars = '☆' * (5 - self.rating)
        return full_stars + empty_stars


class Video(models.Model):
    """
    Videos for showcasing products, designs, collections, or promotional content.
    """
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    def get_video_storage():
        """Get the appropriate video storage backend with fallback"""
        try:
            from django.core.files.storage import storages
            storage = storages['video_storage']
            # Test if storage has required methods
            if hasattr(storage, 'generate_filename'):
                return storage
            else:
                print(f"WARNING: video_storage {type(storage)} doesn't have generate_filename, falling back to FileSystemStorage")
                from django.core.files.storage import FileSystemStorage
                return FileSystemStorage()
        except Exception as e:
            print(f"ERROR: Failed to get video_storage: {e}, falling back to FileSystemStorage")
            from django.core.files.storage import FileSystemStorage
            return FileSystemStorage()
    
    video_file = models.FileField(
        upload_to='videos/', 
        blank=True, 
        null=True,
        storage=get_video_storage,
        help_text='Upload video file directly (MP4, WebM, etc.)'
    )
    video_url = models.URLField(
        blank=True, 
        null=True,
        help_text='OR external video URL (YouTube, Vimeo, etc.)'
    )
    thumbnail = models.ImageField(
        upload_to='video_thumbnails/', 
        blank=True, 
        null=True,
        help_text='Video thumbnail image'
    )
    video_type = models.CharField(
        max_length=50,
        choices=[
            ('product', 'Product'),
            ('collection', 'Collection'),
            ('design', 'Design'),
            ('promotional', 'Promotional'),
            ('behind_scenes', 'Behind the Scenes'),
        ],
        default='promotional'
    )
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0, help_text='Display order (lower numbers first)')
    views = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title

    @property
    def has_video_file(self):
        return bool(self.video_file)

    @property
    def video_source(self):
        if self.video_file:
            return 'uploaded'
        elif self.video_url:
            return 'external'
        return 'none'

    def increment_views(self):
        self.views += 1
        self.save(update_fields=['views'])

    @property
    def likes_count(self):
        return self.video_likes.count()

    @property
    def comments_count(self):
        return self.comments.filter(is_active=True).count()


class VideoComment(models.Model):
    """Comments on videos"""
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    content = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Comment by {self.name} on {self.video.title}'

    @property
    def is_reply(self):
        return self.parent is not None

    @property
    def replies_count(self):
        return self.replies.filter(is_active=True).count()

    @property
    def likes_count(self):
        return self.comment_likes.count()


class VideoLike(models.Model):
    """Likes on videos"""
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='video_likes')
    ip_address = models.GenericIPAddressField()
    session_key = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['video', 'ip_address']
        ordering = ['-created_at']

    def __str__(self):
        return f'Like on {self.video.title} from {self.ip_address}'


class VideoCommentLike(models.Model):
    """Likes on video comments"""
    comment = models.ForeignKey(VideoComment, on_delete=models.CASCADE, related_name='comment_likes')
    ip_address = models.GenericIPAddressField()
    session_key = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['comment', 'ip_address']
        ordering = ['-created_at']

    def __str__(self):
        return f'Like on comment by {self.comment.name} from {self.ip_address}'


class BusinessProfile(models.Model):
    title = models.CharField(max_length=200, default='About THE BLUE WARDROBE')
    subtitle = models.CharField(max_length=255, blank=True)
    ceo_name = models.CharField(max_length=200)
    ceo_title = models.CharField(max_length=200, blank=True)
    ceo_photo = models.ImageField(upload_to='business/', blank=True, null=True)
    about_ceo = models.TextField()
    business_idea = models.TextField()
    business_aims = models.TextField()
    business_agenda = models.TextField()
    future_prospects = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', '-created_at']

    def __str__(self):
        return f"{self.title} — {self.ceo_name}"


class BlogPost(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    excerpt = models.TextField(blank=True)
    content = models.TextField()
    cover_image = models.ImageField(upload_to='blog/covers/', blank=True, null=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='blog_posts', on_delete=models.SET_NULL, null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    allow_comments = models.BooleanField(default=True)
    published_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)[:240] or 'blog-post'
            slug = base_slug
            suffix = 1
            while BlogPost.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                slug = f'{base_slug}-{suffix}'[:255]
                suffix += 1
            self.slug = slug
        super().save(*args, **kwargs)


class BlogPostMedia(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('gif', 'GIF'),
        ('sticker', 'Sticker'),
    ]

    post = models.ForeignKey(BlogPost, related_name='media_items', on_delete=models.CASCADE)
    file = models.FileField(upload_to='blog/media/')
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPE_CHOICES, default='image')
    caption = models.CharField(max_length=255, blank=True)
    alt_text = models.CharField(max_length=255, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f'{self.post.title} — {self.media_type}'


class BlogComment(models.Model):
    post = models.ForeignKey(BlogPost, related_name='comments', on_delete=models.CASCADE)
    parent = models.ForeignKey('self', related_name='replies', on_delete=models.CASCADE, null=True, blank=True)
    author_name = models.CharField(max_length=200)
    author_email = models.EmailField()
    visitor_id = models.CharField(max_length=120, db_index=True, blank=True)
    body = models.TextField()
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.author_name} on {self.post.title}'


class BlogPostLike(models.Model):
    post = models.ForeignKey(BlogPost, related_name='likes', on_delete=models.CASCADE)
    visitor_id = models.CharField(max_length=120, db_index=True)
    visitor_name = models.CharField(max_length=200, blank=True)
    visitor_email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['post', 'visitor_id'], name='unique_post_like_per_visitor'),
        ]

    def __str__(self):
        return self.visitor_name or self.visitor_email or self.visitor_id


class BlogCommentLike(models.Model):
    comment = models.ForeignKey(BlogComment, related_name='likes', on_delete=models.CASCADE)
    visitor_id = models.CharField(max_length=120, db_index=True)
    visitor_name = models.CharField(max_length=200, blank=True)
    visitor_email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['comment', 'visitor_id'], name='unique_comment_like_per_visitor'),
        ]

    def __str__(self):
        return self.visitor_name or self.visitor_email or self.visitor_id


class InfoCard(models.Model):
    """
    Vertical rectangular cards displaying business/company information.
    """
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=100, blank=True, help_text='Icon name or emoji')
    color = models.CharField(
        max_length=50,
        default='blue',
        choices=[
            ('blue', 'Blue'),
            ('white', 'White'),
            ('gold', 'Gold'),
            ('silver', 'Silver'),
            ('navy', 'Navy'),
        ],
        help_text='Card accent color'
    )
    image = models.ImageField(upload_to='info_cards/', blank=True, null=True)
    link_url = models.URLField(blank=True, help_text='Optional link URL')
    link_text = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0, help_text='Display order (lower numbers first)')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title
