from django.conf import settings
from django.db import models
from django.utils.text import slugify
from django.utils import timezone


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


class Design(models.Model):
    collection = models.ForeignKey(Collection, related_name='designs', on_delete=models.CASCADE)
    sku = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text='Price in NGN')
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text='Discounted price in NGN')
    video = models.FileField(upload_to='designs/videos/', null=True, blank=True, help_text='Product video file')
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
    size = models.IntegerField(choices=SizeInventory.SIZE_CHOICES)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['cart', 'design', 'size']

    def __str__(self):
        return f"{self.quantity} x {self.design.title} (Size {self.size})"

    @property
    def unit_price(self):
        return self.design.effective_price

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

    @property
    def is_available(self):
        size_inventory = self.design.size_inventory.filter(size=self.size, is_active=True).first()
        return size_inventory and size_inventory.stock >= self.quantity


class SiteAsset(models.Model):
    name = models.CharField(max_length=100, help_text='favicon, logo_primary, logo_light, logo_dark')
    file = models.ImageField(upload_to='assets/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


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
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    paystack_reference = models.CharField(max_length=200, blank=True)
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
    Lightweight payment log so the owner can audit Paystack transactions.
    """
    order = models.ForeignKey(Order, related_name='payments', on_delete=models.CASCADE, null=True, blank=True)
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


class Video(models.Model):
    """
    Videos for showcasing products, designs, collections, or promotional content.
    """
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_url = models.URLField(help_text='YouTube, Vimeo, or direct video URL')
    thumbnail = models.ImageField(upload_to='videos/', blank=True, null=True)
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
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title


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
