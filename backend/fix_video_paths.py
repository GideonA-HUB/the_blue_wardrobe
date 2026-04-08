#!/usr/bin/env python
"""
Script to fix video file paths in the database
This removes duplicate 'media/' prefixes from video file paths
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from store.models import Design, Video

def fix_design_video_paths():
    """Fix video paths in Design model"""
    designs = Design.objects.exclude(video__isnull=True).exclude(video='')
    
    print(f"Found {designs.count()} designs with videos")
    
    for design in designs:
        if design.video and design.video.name:
            old_path = design.video.name
            new_path = old_path
            
            # Remove duplicate 'media/' prefixes
            if new_path.startswith('media/media/'):
                new_path = new_path.replace('media/media/', 'media/')
                print(f"Fixing Design {design.id}: {old_path} -> {new_path}")
                design.video.name = new_path
                design.save(update_fields=['video'])
            elif new_path.startswith('/media/media/'):
                new_path = new_path.replace('/media/media/', '/media/')
                print(f"Fixing Design {design.id}: {old_path} -> {new_path}")
                design.video.name = new_path
                design.save(update_fields=['video'])

def fix_video_model_paths():
    """Fix video paths in Video model"""
    videos = Video.objects.exclude(video_file__isnull=True).exclude(video_file='')
    
    print(f"Found {videos.count()} videos with files")
    
    for video in videos:
        if video.video_file and video.video_file.name:
            old_path = video.video_file.name
            new_path = old_path
            
            # Remove duplicate 'media/' prefixes
            if new_path.startswith('media/media/'):
                new_path = new_path.replace('media/media/', 'media/')
                print(f"Fixing Video {video.id}: {old_path} -> {new_path}")
                video.video_file.name = new_path
                video.save(update_fields=['video_file'])
            elif new_path.startswith('/media/media/'):
                new_path = new_path.replace('/media/media/', '/media/')
                print(f"Fixing Video {video.id}: {old_path} -> {new_path}")
                video.video_file.name = new_path
                video.save(update_fields=['video_file'])

if __name__ == '__main__':
    print("Starting video path fixes...")
    fix_design_video_paths()
    fix_video_model_paths()
    print("Video path fixes completed!")
