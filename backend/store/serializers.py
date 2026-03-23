from rest_framework import serializers
from .models import (
    Collection, Design, DesignImage, SizeMeasurement, SizeInventory, Cart, CartItem, Material, SiteAsset, Order, OrderItem,
    Customer, ContactMessage, Subscriber, Video, VideoComment, VideoLike, VideoCommentLike, InfoCard, DesignReview
)


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id', 'name', 'description']


class DesignImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = DesignImage
        fields = ['id', 'image', 'image_url', 'alt_text', 'order', 'created_at']
    
    def get_image_url(self, obj):
        if obj.image:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.image.url)
                return obj.image.url
            except (AttributeError, ValueError, TypeError):
                return None
        return None


class SizeInventorySerializer(serializers.ModelSerializer):
    availability_status = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = SizeInventory
        fields = ['id', 'size', 'stock', 'is_active', 'availability_status', 'is_in_stock']


class SizeMeasurementSerializer(serializers.ModelSerializer):
    availability_status = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = SizeMeasurement
        fields = ['id', 'size', 'bust', 'waist', 'hips', 'stock', 'is_active', 'availability_status', 'is_in_stock']


class DesignSerializer(serializers.ModelSerializer):
    collection_id = serializers.PrimaryKeyRelatedField(queryset=Collection.objects.all(), source='collection', write_only=True)
    collection = serializers.StringRelatedField(read_only=True)
    images = DesignImageSerializer(many=True, read_only=True)
    size_inventory = SizeInventorySerializer(many=True, read_only=True)
    size_measurements = SizeMeasurementSerializer(many=True, read_only=True)
    video_url = serializers.SerializerMethodField()
    has_discount = serializers.ReadOnlyField()
    effective_price = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    total_stock = serializers.SerializerMethodField()
    average_rating = serializers.ReadOnlyField()
    total_reviews = serializers.ReadOnlyField()
    rating_distribution = serializers.ReadOnlyField()
    reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = Design
        fields = [
            'id', 'collection', 'collection_id', 'sku', 'title', 'description', 
            'price', 'discount_price', 'video', 'video_url', 'has_discount', 
            'effective_price', 'discount_percentage', 'total_stock', 'images', 
            'size_inventory', 'size_measurements', 'created_at', 'updated_at',
            'average_rating', 'total_reviews', 'rating_distribution', 'reviews'
        ]
    
    def get_video_url(self, obj):
        """
        Return the video URL for FileField
        """
        if obj.video:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.video.url)
                return obj.video.url
            except (AttributeError, ValueError, TypeError):
                return None
        return None
    
    def get_total_stock(self, obj):
        return sum(measurement.stock for measurement in obj.size_measurements.all())
    
    def get_reviews(self, obj):
        """Get approved reviews for this design"""
        reviews = obj.reviews.filter(is_approved=True).order_by('-created_at')
        return DesignReviewSerializer(reviews, many=True).data


class CollectionSerializer(serializers.ModelSerializer):
    materials = MaterialSerializer(many=True, read_only=True)
    designs = DesignSerializer(many=True, read_only=True)
    material_ids = serializers.PrimaryKeyRelatedField(many=True, queryset=Material.objects.all(), write_only=True, required=False, source='materials')

    class Meta:
        model = Collection
        fields = ['id', 'code', 'title', 'story', 'materials', 'material_ids', 'featured_image', 'is_featured', 'order', 'designs', 'created_at']

    def create(self, validated_data):
        materials = validated_data.pop('materials', [])
        collection = Collection.objects.create(**validated_data)
        collection.materials.set(materials)
        return collection

    def update(self, instance, validated_data):
        materials = validated_data.pop('materials', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if materials is not None:
            instance.materials.set(materials)
        return instance


class SiteAssetSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()
    
    class Meta:
        model = SiteAsset
        fields = ['id', 'name', 'file']
    
    def get_file(self, obj):
        if obj.file:
            # Cloudinary storage returns full URLs automatically
            # But we'll ensure it's properly formatted
            try:
                url = obj.file.url
                # If it's already a full URL (starts with http), return as is
                if url.startswith('http://') or url.startswith('https://'):
                    return url
                # Otherwise, build absolute URL if we have request context
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(url)
                # Fallback: return as is (Cloudinary should provide full URL)
                return url
            except Exception:
                # Fallback to string representation
                return str(obj.file)
        return None


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'message', 'created_at']


class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ['id', 'email', 'subscribed_at']


class CartItemSerializer(serializers.ModelSerializer):
    design = DesignSerializer(read_only=True)
    size_measurement = SizeMeasurementSerializer(read_only=True)
    subtotal = serializers.ReadOnlyField()
    unit_price = serializers.ReadOnlyField()
    is_available = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'design', 'size_measurement', 'quantity', 'unit_price', 'subtotal', 'is_available']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    total_amount = serializers.ReadOnlyField()
    
    class Meta:
        model = Cart
        fields = ['id', 'session_id', 'customer_email', 'items', 'total_items', 'total_amount', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    design = DesignSerializer()

    class Meta:
        model = OrderItem
        fields = ['id', 'design', 'size', 'quantity', 'unit_price']


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'email', 'first_name', 'last_name', 'phone']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer = CustomerSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'total_amount', 'status', 'paystack_reference', 'created_at', 'items']


class DesignReviewSerializer(serializers.ModelSerializer):
    """Serializer for design reviews"""
    stars_display = serializers.ReadOnlyField()
    
    class Meta:
        model = DesignReview
        fields = [
            'id', 'design', 'name', 'email', 'rating', 'comment', 
            'is_approved', 'stars_display', 'created_at', 'updated_at'
        ]
        read_only_fields = ['is_approved', 'created_at', 'updated_at']
    
    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
    
    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Name is required.")
        return value.strip()
    
    def validate_email(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Email is required.")
        return value.strip()
    
    def validate_comment(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Comment is required.")
        return value.strip()


class VideoSerializer(serializers.ModelSerializer):
    video_file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'video_file', 'video_file_url', 
            'video_url', 'thumbnail', 'thumbnail_url', 'video_type', 
            'is_featured', 'order', 'views', 'likes_count', 'comments_count', 
            'is_liked', 'created_at'
        ]
    
    def get_video_file_url(self, obj):
        if obj.video_file:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.video_file.url)
                return obj.video_file.url
            except AttributeError:
                return None
        return None
    
    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.thumbnail.url)
                return obj.thumbnail.url
            except AttributeError:
                return None
        return None
    
    def get_comments_count(self, obj):
        return obj.comments_count
    
    def get_likes_count(self, obj):
        return obj.likes_count
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request:
            # Get client IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            
            # Check if user has liked this video
            return obj.video_likes.filter(ip_address=ip_address).exists()
        return False


class VideoCommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = VideoComment
        fields = [
            'id', 'video', 'parent', 'name', 'email', 'content', 
            'is_active', 'likes_count', 'is_liked', 'replies', 'created_at'
        ]
        read_only_fields = ['is_active', 'created_at']
    
    def validate_parent(self, value):
        # Allow None for top-level comments
        if value is None or value == '':
            return None
        
        # Handle case where value is an ID (string or number)
        try:
            parent_id = int(value)
            parent_comment = VideoComment.objects.get(id=parent_id, is_active=True)
            return parent_comment
        except (ValueError, TypeError):
            # If it's already a VideoComment object, return it
            if hasattr(value, 'id'):
                if not value.is_active:
                    raise serializers.ValidationError("Parent comment is not active")
                return value
            raise serializers.ValidationError("Invalid parent comment ID format")
        except VideoComment.DoesNotExist:
            raise serializers.ValidationError("Parent comment not found")
    
    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Name is required")
        return value.strip()
    
    def validate_email(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Email is required")
        return value.strip()
    
    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Content is required")
        return value.strip()
    
    def get_replies(self, obj):
        # Get only active replies
        replies = obj.replies.filter(is_active=True).order_by('created_at')
        return VideoCommentSerializer(replies, many=True, context=self.context).data
    
    def get_likes_count(self, obj):
        return obj.likes_count
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request:
            # Get client IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            
            # Check if user has liked this comment
            return obj.comment_likes.filter(ip_address=ip_address).exists()
        return False


class InfoCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfoCard
        fields = ['id', 'title', 'description', 'icon', 'color', 'image', 'link_url', 'link_text', 'is_active', 'order', 'created_at']
