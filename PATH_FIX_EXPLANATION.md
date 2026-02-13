# Path Fix Explanation

## Problem
The build was failing with: `/bin/bash: line 1: cd: ../backend: No such file or directory`

## Root Cause
In `nixpacks.toml`, the install phase was using `cd ../backend` which is incorrect. 

Nixpacks runs all commands from `/app/` (the project root), so:
- ✅ `cd frontend` → goes to `/app/frontend` (correct)
- ❌ `cd ../backend` → tries to go to `/backend` (doesn't exist!)
- ✅ `cd backend` → goes to `/app/backend` (correct)

## Fix Applied
Updated `nixpacks.toml` to use `cd backend` instead of `cd ../backend` in all phases.

## Why Procfile is Different
The Procfile uses `cd ../backend` which is correct because:
1. First command: `cd frontend` → now in `/app/frontend`
2. Then: `cd ../backend` → goes from `/app/frontend` to `/app/backend` ✓

This works because we're already inside the `frontend` directory when we do `cd ../backend`.

## Fixed Files
- ✅ `nixpacks.toml` - Changed `cd ../backend` to `cd backend` in install and build phases
- ✅ `Procfile` - Already correct (uses `cd ../backend` after being in frontend)

## Build Process Now
1. **Setup**: Installs Node.js 20 and Python 3.11
2. **Install**: 
   - `cd frontend && npm install` (from `/app/`)
   - `cd backend && pip install ...` (from `/app/`)
3. **Build**:
   - `cd frontend && npm run build` (from `/app/`)
   - `cd backend && python manage.py migrate` (from `/app/`)
   - `cd backend && python manage.py collectstatic` (from `/app/`)
4. **Start**: `cd backend && gunicorn ...` (from `/app/`)

The build should now succeed! 🚀

