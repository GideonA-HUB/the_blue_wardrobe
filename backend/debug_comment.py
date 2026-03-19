#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from store.models import Video, VideoComment
from store.serializers import VideoCommentSerializer

def test_comment_creation():
    print("Testing comment creation...")
    
    # Get a video
    try:
        video = Video.objects.first()
        if not video:
            print("No videos found in database")
            return
        print(f"Found video: {video.title} (ID: {video.id})")
    except Exception as e:
        print(f"Error getting video: {e}")
        return
    
    # Test creating a top-level comment
    try:
        comment_data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'content': 'This is a test comment',
            'video': video.id
        }
        
        print(f"Creating comment with data: {comment_data}")
        
        serializer = VideoCommentSerializer(data=comment_data)
        if serializer.is_valid():
            comment = serializer.save()
            print(f"✅ Successfully created comment: {comment}")
        else:
            print(f"❌ Comment validation failed: {serializer.errors}")
    except Exception as e:
        print(f"❌ Error creating comment: {e}")
        import traceback
        traceback.print_exc()
    
    # Test creating a reply
    try:
        parent_comment = VideoComment.objects.filter(video=video, parent=None).first()
        if not parent_comment:
            print("No parent comment found for reply test")
            return
            
        reply_data = {
            'name': 'Reply User',
            'email': 'reply@example.com',
            'content': 'This is a test reply',
            'video': video.id,
            'parent': parent_comment.id
        }
        
        print(f"Creating reply with data: {reply_data}")
        
        serializer = VideoCommentSerializer(data=reply_data)
        if serializer.is_valid():
            reply = serializer.save()
            print(f"✅ Successfully created reply: {reply}")
        else:
            print(f"❌ Reply validation failed: {serializer.errors}")
    except Exception as e:
        print(f"❌ Error creating reply: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_comment_creation()
