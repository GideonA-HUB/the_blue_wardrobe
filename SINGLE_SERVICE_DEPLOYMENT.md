# Single-Service Railway Deployment Guide

This project is configured to deploy **both frontend and backend as one service** on Railway.

## How It Works

1. **Build Process:**
   - Railway builds the React frontend (`frontend/dist/`)
   - Django collects static files including the frontend build
   - WhiteNoise serves all static files (including React assets)

2. **Routing:**
   - API routes (`/api/*`, `/admin/*`) → Handled by Django
   - All other routes → Served React's `index.html` (React Router handles client-side routing)

3. **Same Domain:**
   - Frontend and backend are on the same domain
   - No CORS issues
   - API calls use relative paths (`/api`)

## Quick Start

### 1. Connect to Railway
- Go to Railway.app
- Click "New Project" → "Deploy from GitHub repo"
- Select your repository

### 2. Add Database
- Click "New" → "Database" → "Add PostgreSQL"
- Railway automatically sets `DATABASE_URL`

### 3. Set Environment Variables
Go to your service → "Variables" tab and add:

```
DJANGO_SECRET_KEY=gacyab(zb_9ukwwe75ntg14$9dh&20la=d*=9vj%eqwiy-u(q2
DEBUG=False
ALLOWED_HOSTS=thebluewardrobe-production.up.railway.app,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://thebluewardrobe-production.up.railway.app
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PAYSTACK_SECRET=sk_live_your_paystack_secret_key
RESEND_API_KEY=re_your_resend_api_key
OWNER_EMAIL=your-email@example.com
```

### 4. Deploy
- Railway automatically detects `railway.json` and `backend/Procfile`
- Build process:
  1. Installs frontend dependencies and builds React app
  2. Installs backend dependencies
  3. Runs migrations
  4. Collects static files (including frontend build)
  5. Starts Django with Gunicorn

### 5. Create Superuser
- Use Railway's "Run Command" feature
- Run: `python manage.py createsuperuser`
- Access admin at: `https://your-domain.railway.app/admin`

## File Structure

```
The_Blue_Wardrobe/
├── backend/
│   ├── Procfile              # Railway deployment commands
│   ├── requirements.txt     # Python dependencies
│   └── bluewardrobe/
│       ├── settings.py      # Django settings (serves frontend)
│       └── urls.py          # URL routing (API + React catch-all)
├── frontend/
│   ├── dist/                # Built React app (generated)
│   ├── package.json
│   └── vite.config.ts       # Vite config (relative paths)
├── railway.json             # Railway build configuration
└── .gitignore
```

## Key Configuration Files

### `railway.json`
Defines the build and start commands for Railway.

### `backend/Procfile`
- `release`: Builds frontend, runs migrations, collects static files
- `web`: Starts Gunicorn server

### `backend/bluewardrobe/urls.py`
- API routes: `/api/*`, `/admin/*`
- React catch-all: All other routes → `index.html`

### `backend/bluewardrobe/settings.py`
- `STATICFILES_DIRS`: Includes `frontend/dist/`
- `TEMPLATE_DIRS`: Includes `frontend/dist/` for `index.html`
- WhiteNoise serves static files

## Environment Variables

**Required:**
- `DJANGO_SECRET_KEY` - Django secret key
- `DEBUG=False` - Production mode
- `ALLOWED_HOSTS` - Your Railway domain
- `DATABASE_URL` - Auto-set by Railway Postgres
- `CORS_ALLOWED_ORIGINS` - Your Railway domain

**Optional:**
- `CLOUDINARY_*` - For media storage
- `PAYSTACK_SECRET` - Payment gateway
- `RESEND_API_KEY` - Email service
- `OWNER_EMAIL` - Owner notifications

**NOT Needed:**
- `VITE_API_URL` - Frontend uses relative paths automatically

## Troubleshooting

### Build Fails
- Check Railway logs for specific errors
- Verify `package.json` and `requirements.txt` are correct
- Ensure Node.js and Python are available in Railway

### Frontend Not Loading
- Check that `frontend/dist/` was created during build
- Verify `STATICFILES_DIRS` includes frontend build directory
- Check WhiteNoise is serving static files correctly

### API Not Working
- Verify API routes are correct (`/api/*`)
- Check Django logs in Railway
- Ensure migrations ran successfully

### React Router Not Working
- Verify catch-all route in `urls.py` is last
- Check that `index.html` is being served for non-API routes
- Clear browser cache

## Benefits of Single-Service Deployment

✅ **Simpler:** One service to manage  
✅ **No CORS:** Same domain for frontend and backend  
✅ **Cost-effective:** One service instead of two  
✅ **Easier routing:** No need to configure separate domains  
✅ **Faster:** Direct API calls (no network hop)

## Next Steps

1. Deploy to Railway
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Set up database backups
5. Enable error tracking (Sentry, etc.)

---

**Your Django Secret Key:** `gacyab(zb_9ukwwe75ntg14$9dh&20la=d*=9vj%eqwiy-u(q2`  
**Your Railway Domain:** `thebluewardrobe-production.up.railway.app`

Good luck with your deployment! 🚀

