#!/bin/bash
# Unified build script for Railway deployment
# This script builds the frontend and prepares the backend

set -e  # Exit on error

echo "🚀 Starting build process..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Prepare backend
echo "🐍 Preparing backend..."
cd backend
pip install -r requirements.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput

echo "✅ Build complete!"

