from rest_framework import serializers
from .models import (
    Collection, Design, Material, SiteAsset, Order, OrderItem,
    Customer, ContactMessage, Subscriber, Video, InfoCard
)


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id', 'name', 'description']


class DesignSerializer(serializers.ModelSerializer):
    collection_id = serializers.PrimaryKeyRelatedField(queryset=Collection.objects.all(), source='collection', write_only=True)
    collection = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Design
        fields = ['id', 'collection', 'collection_id', 'sku', 'title', 'description', 'price', 'sizes', 'images', 'stock']


class CollectionSerializer(serializers.ModelSerializer):
    materials = MaterialSerializer(many=True, read_only=True)
    designs = DesignSerializer(many=True, read_only=True)
    material_ids = serializers.PrimaryKeyRelatedField(many=True, queryset=Material.objects.all(), write_only=True, required=False, source='materials')

    class Meta:
        model = Collection
        fields = ['id', 'code', 'title', 'story', 'materials', 'material_ids', 'featured_image', 'designs']

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


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'title', 'description', 'video_url', 'thumbnail', 'video_type', 'is_featured', 'order', 'created_at']


class InfoCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfoCard
        fields = ['id', 'title', 'description', 'icon', 'color', 'image', 'link_url', 'link_text', 'is_active', 'order', 'created_at']
