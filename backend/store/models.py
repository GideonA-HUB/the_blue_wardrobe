from django.db import models
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
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} - {self.title}"


class Design(models.Model):
    collection = models.ForeignKey(Collection, related_name='designs', on_delete=models.CASCADE)
    sku = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sizes = models.JSONField(default=list, blank=True)  # e.g., ["S","M","L"]
    images = models.JSONField(default=list, blank=True)  # store Cloudinary public_ids or filenames
    stock = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.sku} - {self.title}"


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
    size = models.CharField(max_length=20, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.design.title}"


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
