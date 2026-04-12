# Generated manually for homepage hero + atelier selector CMS models

from django.db import migrations, models


def seed_home_hero_copy(apps, schema_editor):
    HomeHeroCopy = apps.get_model('store', 'HomeHeroCopy')
    HomeHeroCopy.objects.get_or_create(
        pk=1,
        defaults={
            'tagline': 'Discover Timeless Elegance',
            'title_line_1': 'THE BLUE',
            'title_line_2': 'WARDROBE',
            'description': (
                'Rare fabrics. Timeless design. Global luxury. Experience our exclusive collections '
                'crafted with attention to detail and the finest materials.'
            ),
        },
    )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0024_order_payment_provider_and_flutterwave'),
    ]

    operations = [
        migrations.CreateModel(
            name='HomeHeroCopy',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tagline', models.CharField(default='Discover Timeless Elegance', max_length=200)),
                ('title_line_1', models.CharField(default='THE BLUE', max_length=120)),
                ('title_line_2', models.CharField(default='WARDROBE', max_length=120)),
                (
                    'description',
                    models.TextField(
                        default='Rare fabrics. Timeless design. Global luxury. Experience our exclusive collections crafted with attention to detail and the finest materials.'
                    ),
                ),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Home hero text',
                'verbose_name_plural': 'Home hero text',
            },
        ),
        migrations.CreateModel(
            name='HeroMarqueeSlide',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='hero/marquee/')),
                ('alt_text', models.CharField(blank=True, max_length=255)),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Hero marquee image',
                'verbose_name_plural': 'Hero marquee images',
                'ordering': ['sort_order', 'id'],
            },
        ),
        migrations.CreateModel(
            name='AtelierStorySlide',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.CharField(max_length=400)),
                ('image', models.ImageField(upload_to='atelier/selector/')),
                (
                    'icon_key',
                    models.CharField(
                        choices=[
                            ('sparkles', 'Sparkles — craft & detail'),
                            ('scissors', 'Scissors — tailoring'),
                            ('shirt', 'Garment / fabric'),
                            ('gem', 'Gem — luxury'),
                            ('award', 'Award — excellence'),
                        ],
                        default='sparkles',
                        max_length=20,
                    ),
                ),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Atelier story slide',
                'verbose_name_plural': 'Atelier story slides',
                'ordering': ['sort_order', 'id'],
            },
        ),
        migrations.RunPython(seed_home_hero_copy, noop_reverse),
    ]
