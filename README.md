# THE BLUE WARDROBE — e_commerce-api

This repository contains the initial backend scaffold for THE BLUE WARDROBE e-commerce platform.

Backend (Django + DRF)
- Django project in `backend/`
- App: `store` with core models (Collection, Design, Material, Order, etc.)
- Image uploads configured for Cloudinary (`django-cloudinary-storage`) — set env vars
- Paystack payment initiation and verification endpoints (placeholders)
- Resend email integration placeholder
- API schema and Redoc available at `/api/docs/`

Quick start (local, using sqlite)
1. cd backend
2. python -m venv venv
3. source venv/bin/activate  # (or venv\Scripts\activate on Windows)
4. pip install -r requirements.txt
5. cp .env.example .env and edit env vars
6. python manage.py migrate
7. python manage.py createsuperuser
8. python manage.py runserver

Docker (dev)
- docker-compose up --build

Next steps (frontend & extras)
- Scaffold frontend (React + Vite + TypeScript) with Tailwind and Zustand
- Implement storefront pages: Home, Collections, Product, Cart, Checkout, Success
- Implement admin dashboard (secure single owner auth)
- Implement Paystack redirect flow and order saving on verification
- Implement Resend email sending upon successful payment
- Add tests (pytest) and CI

If you want, I can now scaffold the frontend (Vite + TypeScript + Tailwind) and implement the public storefront pages and cart/checkout flow integrated with the backend endpoints.
