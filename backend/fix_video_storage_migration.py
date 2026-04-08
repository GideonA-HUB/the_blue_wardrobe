#!/usr/bin/env python
"""
Script to create a migration to fix the video field storage
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from django.db import migrations, models
from django.conf import settings

def create_migration():
    """Create a migration file to fix video field storage"""
    
    migration_content = '''# Generated migration to fix video field storage
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0009_video_likes_video_video_file_video_views_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='design',
            name='video',
            field=models.FileField(blank=True, help_text='Product video file (MP4, WebM, etc.)', null=True, upload_to='designs/videos/'),
        ),
    ]
'''
    
    # Find the next migration number
    migrations_dir = os.path.join(os.path.dirname(__file__), 'store', 'migrations')
    migration_files = [f for f in os.listdir(migrations_dir) if f.startswith('0') and f.endswith('.py')]
    
    if migration_files:
        last_migration = sorted(migration_files)[-1]
        last_number = int(last_migration.split('_')[0])
        next_number = last_number + 1
    else:
        next_number = 1
    
    migration_filename = f"{next_number:04d}_fix_video_field_storage.py"
    migration_path = os.path.join(migrations_dir, migration_filename)
    
    with open(migration_path, 'w') as f:
        f.write(migration_content)
    
    print(f"Created migration file: {migration_path}")
    return migration_filename

if __name__ == '__main__':
    create_migration()
