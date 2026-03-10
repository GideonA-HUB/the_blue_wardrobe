from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0002_businessprofile_blog_models'),
    ]

    operations = [
        migrations.AddField(
            model_name='collection',
            name='is_featured',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='collection',
            name='order',
            field=models.IntegerField(default=0, help_text='Display order (lower numbers first)'),
        ),
        migrations.AlterModelOptions(
            name='collection',
            options={'ordering': ['order', 'code', '-created_at']},
        ),
    ]
