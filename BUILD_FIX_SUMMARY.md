# Railway Build Fix - Summary

## Problem
Build was failing with error: `/bin/bash: line 1: npm: command not found`

## Root Cause
Nixpacks wasn't detecting that Node.js was required, so it only installed Python. When the build tried to run `npm install`, npm wasn't available.

## Solution Applied

### 1. Created `nixpacks.toml` (Root Directory)
This file explicitly tells Nixpacks to install both Node.js 20 and Python 3.11:
```toml
[phases.setup]
nixPkgs = ["nodejs_20", "python311"]
```

### 2. Created `Procfile` (Root Directory)
Railway will use this for deployment commands:
```
release: cd frontend && npm install && npm run build && cd ../backend && python manage.py migrate --noinput && python manage.py collectstatic --noinput
web: cd backend && gunicorn bluewardrobe.wsgi:application --bind 0.0.0.0:$PORT
```

### 3. Created `package.json` (Root Directory)
Helps Nixpacks detect that Node.js is needed:
```json
{
  "name": "the-blue-wardrobe",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 4. Updated `railway.json`
Simplified to let Nixpacks handle the build process automatically.

## Files Created

1. ✅ `nixpacks.toml` - Nixpacks configuration
2. ✅ `Procfile` (root) - Deployment commands  
3. ✅ `package.json` (root) - Node.js detection
4. ✅ Updated `railway.json` - Simplified config

## Build Process (Now)

1. **Nixpacks detects configuration:**
   - Finds `nixpacks.toml` → Installs Node.js 20 and Python 3.11
   - Finds `package.json` → Confirms Node.js requirement

2. **Install phase:**
   - Installs frontend dependencies: `cd frontend && npm install`
   - Installs backend dependencies: `cd ../backend && pip install -r requirements.txt`

3. **Build phase:**
   - Builds React frontend: `cd frontend && npm run build`
   - Runs migrations: `cd ../backend && python manage.py migrate --noinput`
   - Collects static files: `cd ../backend && python manage.py collectstatic --noinput`

4. **Start:**
   - Runs Gunicorn: `cd backend && gunicorn bluewardrobe.wsgi:application --bind 0.0.0.0:$PORT`

## Next Steps

1. **Commit and push these changes:**
   ```bash
   git add .
   git commit -m "Fix Railway build: Add nixpacks.toml and root Procfile for Node.js detection"
   git push
   ```

2. **Railway will automatically redeploy** - The build should now succeed

3. **Verify deployment:**
   - Check Railway logs for successful build
   - Visit your domain: `https://thebluewardrobe-production.up.railway.app`
   - Test API: `https://thebluewardrobe-production.up.railway.app/api/collections/`
   - Test admin: `https://thebluewardrobe-production.up.railway.app/admin/`

## Environment Variables Status

✅ Already set (from your screenshot):
- `ALLOWED_HOSTS`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CORS_ALLOWED_ORIGINS`
- `DATABASE_URL` (auto-set by Railway)
- `DEBUG`
- `DJANGO_SECRET_KEY`

⚠️ Still need to add:
- `PAYSTACK_SECRET` - Get from Paystack dashboard
- `RESEND_API_KEY` - Get from Resend dashboard
- `OWNER_EMAIL` - Your email for notifications

## Expected Build Output

You should now see in Railway logs:
```
✓ Installing Node.js 20
✓ Installing Python 3.11
✓ Installing frontend dependencies
✓ Installing backend dependencies
✓ Building frontend
✓ Running migrations
✓ Collecting static files
✓ Starting Gunicorn
```

## If Build Still Fails

1. Check Railway logs for the specific error
2. Verify all environment variables are set
3. Ensure `frontend/package.json` and `backend/requirements.txt` are correct
4. Check that `frontend/dist/` is created after build
5. Verify database connection (check `DATABASE_URL`)

---

**The build should now work!** 🚀

