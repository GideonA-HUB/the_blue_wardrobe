# Pip Command Fix Explanation

## Problem
Build was failing with exit code 127: `pip: command not found`

## Root Cause
When Python is installed via Nixpacks (nixpkgs), the `pip` command might not be directly available in PATH. We need to use `python3 -m pip` instead of just `pip`.

## Fix Applied
Updated `nixpacks.toml` to use `python3 -m pip` instead of `pip`:

**Before:**
```toml
"cd backend && pip install --upgrade pip && pip install -r requirements.txt"
```

**After:**
```toml
"cd backend && python3 -m pip install --upgrade pip && python3 -m pip install -r requirements.txt"
```

Also updated all Python commands to use `python3` instead of `python` for consistency:
- `python manage.py` → `python3 manage.py`
- `gunicorn` → stays as `gunicorn` (installed as binary via pip)

## Why This Works
- `python3 -m pip` uses Python's module execution to run pip
- This works even if `pip` isn't in PATH
- `python3` is guaranteed to be available after installing `python311` via nixpkgs

## Build Process Now
1. **Setup**: Installs Node.js 20 and Python 3.11
2. **Install**: 
   - `cd frontend && npm install`
   - `cd backend && python3 -m pip install --upgrade pip && python3 -m pip install -r requirements.txt` ✓
3. **Build**:
   - `cd frontend && npm run build`
   - `cd backend && python3 manage.py migrate --noinput` ✓
   - `cd backend && python3 manage.py collectstatic --noinput` ✓
4. **Start**: `cd backend && gunicorn ...` (gunicorn is installed as binary)

The build should now succeed! 🚀

