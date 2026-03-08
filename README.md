# THE BLUE WARDROBE

Luxury fashion e-commerce platform for a collection-driven clothing brand, built as a single Railway deployment with a Django + DRF backend and a React + Vite frontend.

## Stack

- **Frontend**: React, Vite, TypeScript, TailwindCSS, Zustand
- **Backend**: Django, Django REST Framework
- **Database**: PostgreSQL on Railway
- **Payments**: Paystack
- **Media**: Cloudinary when configured
- **Static files**: WhiteNoise
- **Monitoring**: Sentry when configured
- **Docs**: OpenAPI + ReDoc via DRF Spectacular
- **CI/CD**: GitHub Actions

## Project Structure

```text
The_Blue_Wardrobe/
├── backend/
│   ├── bluewardrobe/
│   ├── store/
│   ├── gunicorn.conf.py
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pytest.ini
│   └── start.sh
├── frontend/
│   ├── src/
│   ├── index.html
│   └── vite.config.ts
├── .github/workflows/ci.yml
├── .dockerignore
└── Dockerfile
```

## Local Development

### Backend

```bash
python -m venv backend/venv
source backend/venv/Scripts/activate
pip install -r backend/requirements-dev.txt
python backend/manage.py migrate
python backend/manage.py createsuperuser
python backend/manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend talks to `/api` in production and `http://localhost:8000/api` in development by default.

## Environment Variables

### Required

- `DJANGO_SECRET_KEY`
- `DATABASE_URL`
- `ALLOWED_HOSTS`

### Recommended for Railway

- `DEBUG=False`
- `CORS_ALLOWED_ORIGINS=https://thebluewardrobe-production.up.railway.app`
- `CSRF_TRUSTED_ORIGINS=https://thebluewardrobe-production.up.railway.app`
- `PAYSTACK_SECRET`
- `OWNER_EMAIL`

### Optional Services

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `OWNER_NOTIFICATION_WEBHOOK`
- `SENTRY_DSN`
- `SENTRY_TRACES_SAMPLE_RATE`
- `GUNICORN_WORKERS`
- `GUNICORN_TIMEOUT`
- `GUNICORN_LOG_LEVEL`

Cloudinary media storage is only enabled when all three Cloudinary credentials are set.

## Railway Deployment

This repository is configured for a **single-service Railway deployment**:

- Railway builds the frontend inside the Docker image
- Django collects static files during image build
- the container start command runs migrations and starts Gunicorn
- Railway Postgres provides `DATABASE_URL`

### Runtime Flow

1. Docker builds the React frontend
2. Docker installs Django dependencies
3. Docker copies the built frontend into `frontend_dist`
4. Docker runs `python manage.py collectstatic --noinput`
5. Container starts with `start.sh`
6. `start.sh` runs `python manage.py migrate --noinput`
7. Gunicorn serves Django on port `8080`

### Railway Checklist

- Add a Railway PostgreSQL service
- Set the required environment variables
- Deploy from GitHub using the root `Dockerfile`
- Verify:
  - `/`
  - `/health/`
  - `/api/collections/`
  - `/api/docs/`
  - `/admin/`

## Static and Frontend Delivery

- Vite builds production assets with base path `/static/`
- Django serves the frontend shell from `frontend_dist/index.html`
- WhiteNoise serves collected static files from `/static/`
- legacy `/assets/...` requests are redirected to `/static/assets/...`
- `/favicon.ico` resolves either from uploaded site assets or built/static fallback files

## API Documentation

- Schema: `/api/schema/`
- ReDoc: `/api/docs/`

## Testing

Backend test tooling uses `pytest` and `pytest-django`.

Run locally:

```bash
cd backend
pytest
python manage.py check
```

## CI/CD

GitHub Actions workflow: `.github/workflows/ci.yml`

It currently runs:

- backend dependency install
- `python manage.py check`
- backend tests with `pytest`
- frontend dependency install
- frontend production build

## Media and Brand Assets

Upload site assets through Django admin using these exact names:

- `favicon`
- `logo_primary`
- `logo_light`
- `logo_dark`

These assets are used by the frontend for the navbar logo, loading spinner, and browser favicon.

## Payments and Notifications

- Paystack initialization: `/api/paystack/initiate/`
- Paystack verification: `/api/paystack/verify/`
- Customer and owner emails are sent only when `RESEND_API_KEY` is configured and the Resend SDK is available

## Notes

- The production Docker image now uses a simplified startup flow designed for Railway
- The old custom entrypoint is no longer the active runtime path
- Sentry activates automatically only when `SENTRY_DSN` is set
