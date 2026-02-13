# Railway Environment Variables Configuration

This document lists all environment variables needed for deploying **The Blue Wardrobe** on Railway.

**IMPORTANT:** This project is configured for **single-service deployment** - both frontend and backend run in one Railway service.

## Service Environment Variables

Add these in your Railway service settings (Variables tab):

### Django Core Settings

```
DJANGO_SECRET_KEY=gacyab(zb_9ukwwe75ntg14$9dh&20la=d*=9vj%eqwiy-u(q2
DEBUG=False
ALLOWED_HOSTS=thebluewardrobe-production.up.railway.app,localhost,127.0.0.1
```

**Note:** Replace the `DJANGO_SECRET_KEY` with your generated secret key (already provided above).

### Database Configuration

Railway automatically provides `DATABASE_URL` when you add a Postgres service. You don't need to set this manually - Railway will inject it automatically.

If you need to set it manually:
```
DATABASE_URL=postgresql://user:password@host:port/dbname
```

### CORS Configuration

Since frontend and backend are on the same domain, you can set:

```
CORS_ALLOWED_ORIGINS=https://thebluewardrobe-production.up.railway.app
```

Or if you have a custom domain:
```
CORS_ALLOWED_ORIGINS=https://thebluewardrobe-production.up.railway.app,https://your-custom-domain.com
```

### Cloudinary (Media Storage)

```
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Get these from your Cloudinary dashboard: https://cloudinary.com/console

### Payment Gateway (Paystack)

```
PAYSTACK_SECRET=sk_live_your_paystack_secret_key
```

Get this from your Paystack dashboard: https://dashboard.paystack.com/#/settings/developer

### Email Service (Resend)

```
RESEND_API_KEY=re_your_resend_api_key
```

Get this from your Resend dashboard: https://resend.com/api-keys

### Owner Notifications

```
OWNER_EMAIL=your-email@example.com
OWNER_NOTIFICATION_WEBHOOK=https://your-webhook-url.com/notify
```

**Note:** `OWNER_NOTIFICATION_WEBHOOK` is optional - only set if you have a webhook endpoint for notifications.

---

## Frontend Configuration

**No environment variables needed for frontend!** 

Since frontend and backend are deployed together on the same domain, the frontend automatically uses relative API paths (`/api`). The `VITE_API_URL` environment variable is optional and only needed if you want to override the default behavior.

---

## Quick Setup Checklist

### Single Service Setup:
- [ ] Set `DJANGO_SECRET_KEY` (use the generated key above)
- [ ] Set `DEBUG=False`
- [ ] Set `ALLOWED_HOSTS` (include your Railway domain)
- [ ] Add Postgres service (Railway will auto-set `DATABASE_URL`)
- [ ] Set `CORS_ALLOWED_ORIGINS` (your Railway domain)
- [ ] Set Cloudinary credentials (if using Cloudinary for media)
- [ ] Set Paystack secret key
- [ ] Set Resend API key
- [ ] Set `OWNER_EMAIL`
- [ ] (Optional) Set `VITE_API_URL` if you need to override default API path

---

## Railway-Specific Notes

1. **Port Configuration**: Railway automatically sets the `$PORT` environment variable. The Procfile uses this.

2. **Database**: When you add a Postgres service in Railway, it automatically provides `DATABASE_URL`. No manual configuration needed.

3. **Static Files**: WhiteNoise is configured to serve static files. Run `python manage.py collectstatic` during build or in a startup command.

4. **Build Commands**: Railway will automatically detect and run:
   - Backend: `pip install -r requirements.txt` and migrations
   - Frontend: `npm install` and `npm run build`

---

## Deployment Steps

1. **Create Service:**
   - Connect your GitHub repository to Railway
   - Railway will auto-detect the configuration from `railway.json` and `backend/Procfile`
   - **Root Directory:** Leave as root (`.`), or set to project root
   - Railway will automatically:
     - Build frontend (`cd frontend && npm install && npm run build`)
     - Install backend dependencies (`pip install -r requirements.txt`)
     - Run migrations and collectstatic (via `release` command in Procfile)
     - Start Django with Gunicorn

2. **Add Postgres Database:**
   - In your Railway project, click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically set `DATABASE_URL` environment variable

3. **Set Environment Variables:**
   - Go to your service → "Variables" tab
   - Add all environment variables listed above

4. **Deploy:**
   - Railway will automatically build and deploy
   - Check "Deployments" tab for build logs
   - The `release` command will automatically:
     - Build the frontend
     - Run migrations
     - Collect static files

5. **Create Superuser:**
   - Go to "Deployments" → Click on latest deployment → "View Logs"
   - Or use Railway CLI: `railway run python manage.py createsuperuser`
   - Or use Railway's "Run Command" feature in the dashboard
   - Navigate to: `https://your-domain.railway.app/admin`

---

## Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `DJANGO_SECRET_KEY` (never commit to Git)
- [ ] `ALLOWED_HOSTS` includes only your domains
- [ ] `CORS_ALLOWED_ORIGINS` includes only your frontend domains
- [ ] All API keys are set and valid
- [ ] SSL/HTTPS is enabled (Railway provides this automatically)

---

## Troubleshooting

**Build fails:**
- Check that all environment variables are set
- Verify `requirements.txt` and `package.json` are correct
- Check Railway logs for specific errors

**CORS errors:**
- Since frontend and backend are on the same domain, CORS should work automatically
- Ensure `CORS_ALLOWED_ORIGINS` includes your Railway domain (with `https://`)
- Check that API calls use relative paths (`/api` not full URLs)

**Database errors:**
- Verify Postgres service is running
- Check that `DATABASE_URL` is automatically set by Railway
- Run migrations: `python manage.py migrate`

**Static files not loading:**
- Run `python manage.py collectstatic` in Railway
- Check that WhiteNoise middleware is in `MIDDLEWARE` list
- Verify `STATIC_ROOT` is set correctly

