# Railway Deployment Checklist

## Pre-Deployment Checklist

### Backend Preparation
- [x] ✅ `requirements.txt` includes all dependencies (whitenoise, gunicorn added)
- [x] ✅ `Procfile` created with release and web commands
- [x] ✅ `runtime.txt` specifies Python version (3.11.0)
- [x] ✅ `settings.py` configured for production (WhiteNoise, security settings)
- [x] ✅ Django secret key generated: `gacyab(zb_9ukwwe75ntg14$9dh&20la=d*=9vj%eqwiy-u(q2`
- [x] ✅ `.gitignore` excludes sensitive files and build artifacts
- [x] ✅ All migrations are created and tested locally

### Frontend Preparation
- [x] ✅ `package.json` has build and preview scripts
- [x] ✅ `vite.config.ts` is configured
- [x] ✅ `railway.json` created for Railway deployment
- [x] ✅ API base URL uses environment variable (`VITE_API_URL`)

### Code Quality
- [x] ✅ No linter errors
- [x] ✅ All imports are correct
- [x] ✅ Static files configuration is correct

---

## Railway Deployment Steps

### Step 1: Create Single Service

1. **In Railway Dashboard:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect configuration from `railway.json` and `backend/Procfile`

2. **Configure Service:**
   - **Name:** `the-blue-wardrobe` (or `the_blue_wardrobe`)
   - **Root Directory:** Leave as root (`.`) - Railway will handle the build process
   - Railway automatically:
     - Builds frontend: `cd frontend && npm install && npm run build`
     - Installs backend dependencies: `pip install -r requirements.txt`
     - Runs migrations and collectstatic (via `release` in Procfile)
     - Starts Django with Gunicorn

3. **Add Postgres Database:**
   - In your Railway project, click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically set `DATABASE_URL` environment variable

4. **Set Environment Variables:**
   Go to service → "Variables" tab and add:

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

   **Note:** 
   - Railway automatically sets `DATABASE_URL` when you add Postgres
   - `VITE_API_URL` is NOT needed - frontend uses relative paths automatically

5. **Deploy:**
   - Railway will automatically build and deploy
   - Check "Deployments" tab for build logs
   - The `release` command in Procfile will:
     - Build the frontend
     - Run migrations
     - Collect static files

6. **Create Superuser:**
   - Go to "Deployments" → Click on latest deployment → "View Logs"
   - Or use Railway CLI: `railway run python manage.py createsuperuser`
   - Or use Railway's "Run Command" feature in the dashboard
   - Navigate to: `https://your-domain.railway.app/admin`

---

## Post-Deployment Verification

### Service Checks
- [ ] Service is "Active" in Railway
- [ ] Can access Django admin at `https://your-domain.railway.app/admin`
- [ ] API endpoints work: `https://your-domain.railway.app/api/collections/`
- [ ] Frontend loads at `https://your-domain.railway.app`
- [ ] React Router works (try navigating to different pages)
- [ ] Static files are served correctly (check browser Network tab)
- [ ] Database migrations ran successfully
- [ ] Can create superuser and log in

### Integration Checks
- [ ] Frontend can fetch data from backend API (check browser console)
- [ ] No CORS errors in browser console
- [ ] Images and assets load correctly
- [ ] Admin dashboard login works
- [ ] Contact form submissions work
- [ ] Newsletter subscriptions work
- [ ] Payment integration works (test mode)

---

## Troubleshooting Common Issues

### Build Fails

**Backend:**
- Check Railway logs for specific error
- Verify `requirements.txt` is correct
- Ensure Python version in `runtime.txt` matches Railway's supported versions
- Check that `Procfile` is in the `backend/` directory

**Frontend:**
- Check Railway logs for build errors
- Verify `package.json` dependencies
- Ensure `VITE_API_URL` is set correctly
- Check that build command completes successfully

### CORS Errors

- Verify `CORS_ALLOWED_ORIGINS` includes your frontend domain (with `https://`)
- Check that frontend `VITE_API_URL` matches backend domain exactly
- Ensure no trailing slashes in URLs
- Clear browser cache and try again

### Database Connection Errors

- Verify Postgres service is running
- Check that `DATABASE_URL` is automatically set by Railway
- Run migrations manually: `railway run python manage.py migrate`
- Check database logs in Railway

### Static Files Not Loading

- Verify `whitenoise` is in `requirements.txt`
- Check that `collectstatic` ran (check release logs)
- Verify `STATIC_ROOT` and `STATIC_URL` in settings
- Check that WhiteNoise middleware is in `MIDDLEWARE` list

### 404 Errors on API Endpoints

- Verify API routes are correct in `backend/store/urls.py`
- Check that Django URLs are properly configured
- Verify `ALLOWED_HOSTS` includes your domain
- Check Railway logs for routing errors

---

## Environment Variables Summary

### Backend (Required)
- `DJANGO_SECRET_KEY` ✅ (provided above)
- `DEBUG=False`
- `ALLOWED_HOSTS` ✅ (includes your Railway domain)
- `DATABASE_URL` (auto-set by Railway Postgres)
- `CORS_ALLOWED_ORIGINS` ✅ (includes frontend domain)

### Backend (Optional but Recommended)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `PAYSTACK_SECRET`
- `RESEND_API_KEY`
- `OWNER_EMAIL`

### Frontend (Required)
- `VITE_API_URL` ✅ (points to backend domain)

---

## Next Steps After Deployment

1. **Set up Custom Domain** (optional):
   - In Railway, go to service → Settings → Networking
   - Add custom domain
   - Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` accordingly

2. **Configure Monitoring:**
   - Set up Railway's built-in monitoring
   - Configure error tracking (Sentry, etc.)
   - Set up uptime monitoring

3. **Backup Strategy:**
   - Configure Postgres backups in Railway
   - Set up regular database backups

4. **Performance Optimization:**
   - Enable CDN for static files (if needed)
   - Configure caching strategies
   - Optimize database queries

---

## Support Resources

- Railway Docs: https://docs.railway.app
- Django Deployment: https://docs.djangoproject.com/en/stable/howto/deployment/
- Vite Production Build: https://vitejs.dev/guide/build.html

---

**Your Backend Domain:** `thebluewardrobe-production.up.railway.app`  
**Django Secret Key:** `gacyab(zb_9ukwwe75ntg14$9dh&20la=d*=9vj%eqwiy-u(q2`

Good luck with your deployment! 🚀

