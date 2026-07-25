# Progress Log

## Module 0 — Repository Setup (done)
- Initialized git repository (`main` branch)
- Created monorepo layout: `server/` (Express + Prisma) and `client/`
  (React + Vite)
- Added `.gitignore` (node_modules, env files, build output, Prisma dev db)
- Added root `README.md` with architecture overview and module checklist

## Module 1 — Project Setup (done)
- [x] `server/package.json` with all backend dependencies
- [x] `client/package.json` with all frontend dependencies
- [x] Prisma init (`server/prisma/schema.prisma`) + PostgreSQL datasource,
      singleton Prisma client (`server/src/prisma/client.js`)
- [x] `.env.example` for server and client
- [x] Centralized, validated env config (`server/src/config/env.js`)
- [x] Reusable `ApiError` class + `sendSuccess` response helper
- [x] Centralized error handling (404 + global error handler)
- [x] Express app bootstrap (`app.js`, `server.js`) with Helmet, CORS,
      Morgan, cookie-parser, rate limiting, graceful shutdown
- [x] `GET /api/health` health-check endpoint (checks DB round-trip)
- [x] Vite + React 19 + Tailwind CSS (dark mode via `class` strategy)
      client bootstrap
- [x] Axios client + health service wired to prove client ↔ server
      connectivity

### How to run this module locally
```bash
# 1. Backend
cd server
cp .env.example .env         # fill in DATABASE_URL at minimum
npm install
npm run prisma:generate
npm run dev                  # http://localhost:5000

# 2. Frontend (separate terminal)
cd client
cp .env.example .env
npm install
npm run dev                  # http://localhost:5173
```
Open http://localhost:5173 — the page should show a green "API Health"
panel with `"status": "ok"` and `"database": "up"` once both servers and
Postgres are running. This environment has no network access, so these
commands were not executed here — please run/verify them locally.

## Module 2 — Authentication (next)
- [ ] `User`, `RefreshToken` Prisma models + migration
- [ ] Register, Login, Logout, Refresh Token
- [ ] Forgot / Reset Password, Email Verification
- [ ] Profile Update, Change Password
- [ ] JWT access + refresh token issuing, HttpOnly cookie handling
- [ ] Role-based authorization middleware
