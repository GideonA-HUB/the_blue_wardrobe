# Migration Instructions

## Backend Setup

After adding the new models (Video and InfoCard), you need to run migrations:

```bash
cd backend
source venv/Scripts/activate  # On Windows Git Bash
# OR
source venv/bin/activate  # On Linux/Mac

python manage.py makemigrations
python manage.py migrate
```

This will create the database tables for:
- `store_video` - For video content
- `store_infocard` - For info cards

## Django Admin

After migrations, you can manage videos and info cards in Django Admin:

1. Go to `http://localhost:8000/admin/`
2. Login with your superuser credentials
3. You'll see:
   - **Videos** - Add/edit videos with URLs, thumbnails, types
   - **Info Cards** - Add/edit business/company info cards with colors and images

## Adding Content

### Videos
- Upload videos to YouTube/Vimeo or use direct URLs
- Set `is_featured=True` to display them
- Choose video type (product, collection, design, promotional, behind_scenes)
- Set order for display sequence

### Info Cards
- Create cards with title, description, icon (emoji), color theme
- Upload images for visual appeal
- Set `is_active=True` to display
- Set order for display sequence

## Frontend

The frontend will automatically fetch and display:
- Videos from `/api/videos/`
- Info cards from `/api/info-cards/`

No additional configuration needed!

