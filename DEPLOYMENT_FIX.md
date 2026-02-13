# Railway Deployment Fix

## Problem
Build was failing with: `npm: command not found`

## Root Cause
Nixpacks wasn't detecting that Node.js was needed for the frontend build.

## Solution
Created multiple configuration files to ensure Nixpacks detects both Node.js and Python:

1. **`nixpacks.toml`** - Explicitly tells Nixpacks we need both Node.js 20 and Python 3.11
2. **`Procfile`** (at root) - Railway will find this and use it for deployment
3. **`package.json`** (at root) - Helps Nixpacks detect Node.js requirement
4. **Updated `railway.json`** - Simplified to let nixpacks.toml handle the build

## Files Created/Updated

### New Files:
- `nixpacks.toml` - Nixpacks configuration
- `Procfile` (root) - Deployment commands
- `package.json` (root) - Node.js detection helper

### Updated Files:
- `railway.json` - Simplified configuration

## Build Process (Now)

1. Nixpacks detects `nixpacks.toml` and `package.json` → Installs Node.js 20 and Python 3.11
2. Install phase: Installs frontend and backend dependencies
3. Build phase: Builds frontend, runs migrations, collects static files
4. Start: Runs Gunicorn

## Next Steps

1. Commit and push these changes to GitHub
2. Railway will automatically redeploy
3. The build should now succeed

## Verification

After deployment succeeds, verify:
- Frontend loads at your Railway domain
- API endpoints work (`/api/collections/`)
- Admin panel works (`/admin/`)
- Static files are served correctly

