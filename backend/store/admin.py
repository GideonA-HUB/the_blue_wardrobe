from django.contrib import admin
from django import forms
from django.core.exceptions import ValidationError
from .models import (
    Material, Collection, Design, SiteAsset, Customer, Order, OrderItem,
    ContactMessage, Subscriber, PaymentLog, Video, InfoCard
)


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('name',)


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'created_at')
    search_fields = ('code', 'title')
    filter_horizontal = ('materials',)


@admin.register(Design)
class DesignAdmin(admin.ModelAdmin):
    list_display = ('sku', 'title', 'price', 'stock')
    search_fields = ('sku', 'title')
    list_filter = ('collection',)


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
    list_display = ('title', 'video_type', 'is_featured', 'order', 'created_at')
    list_filter = ('video_type', 'is_featured')
    search_fields = ('title', 'description')
    list_editable = ('is_featured', 'order')


@admin.register(InfoCard)
class InfoCardAdmin(admin.ModelAdmin):
    list_display = ('title', 'color', 'is_active', 'order', 'created_at')
    list_filter = ('color', 'is_active')
    search_fields = ('title', 'description')
    list_editable = ('is_active', 'order', 'color')
