# SilverHands - Quick Start Guide

## 1. Prerequisites
- Python 3.9+ installed
- Node.js 18+ installed
- Supabase account (free at supabase.com)

## 2. Quick Setup (5 minutes)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Supabase credentials
python run.py
```

Backend runs at: `http://localhost:5000`

### Frontend (new terminal)
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

Frontend runs at: `http://localhost:5173`

## 3. Supabase Setup (2 minutes)

1. Visit [supabase.com](https://supabase.com)
2. Create new project
3. In **Authentication > Providers**, enable **Email/Password**
4. Copy these values to `.env` files:
   - Project URL → `VITE_SUPABASE_URL` / `SUPABASE_URL`
   - Anon Key → `VITE_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`
   - JWT Secret → `SUPABASE_JWT_SECRET` (found in Authentication > JWT Settings)

## 4. Test the Setup

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

Expected: `{"status": "ok", "message": "SilverHands backend is running"}`

### Frontend Auth Flow
1. Open http://localhost:5173
2. Click "Sign Up" → Create test account
3. Click "Login" → Log in with test account
4. Dashboard should show your email and backend status

## 5. Folder Overview

| Folder | Purpose |
|--------|---------|
| `backend/app/routes/` | API endpoints |
| `backend/app/middleware/` | Auth & JWT validation |
| `frontend/src/pages/` | Login, Dashboard, and placeholder pages |
| `frontend/src/api/` | API client wrapper |

## 6. Key Endpoints

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /api/health` | No | Health check |
| `GET /api/auth/me` | Yes | Current user info |
| `POST /api/auth/verify-token` | Yes | Token verification |

## 7. Troubleshooting

**"Missing Supabase environment variables"**
→ Check `.env` files have all required values

**"401 Unauthorized"**
→ Restart backends, ensure JWT secret matches Supabase

**"CORS error"**
→ Make sure backend is running on port 5000

## 8. Next Steps

- Module 2: Marketplace & Listings
- Module 3: Provider Profiles
- Module 4: AI & Matching Engine
- Module 5: Polish & Deploy

---

For full documentation, see [README.md](./README.md)
