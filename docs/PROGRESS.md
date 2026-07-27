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

## Module 2 — Authentication (done)
- [x] `User`, `RefreshToken` Prisma models + `Role` enum (models added;
      migration must be generated locally — see below)
- [x] Register, Login, Logout, Logout-all-devices
- [x] Refresh token rotation with reuse detection (stolen-token defense)
- [x] Forgot / Reset Password (invalidates all sessions on reset)
- [x] Email Verification + resend
- [x] Profile Update, Change Password (invalidates all sessions on change)
- [x] JWT access token (returned in response body) + refresh token
      (HttpOnly, `path=/api/auth` cookie; `SameSite=lax` in dev,
      `SameSite=none; Secure` in prod for the cross-domain Vercel/Render
      deployment)
- [x] Role-based authorization middleware (`authenticate`, `authorize`)
- [x] express-validator chains + centralized `validate` middleware
- [x] Stricter rate limits on login/register/password-reset
- [x] Nodemailer email sending (falls back to console logging if SMTP
      isn't configured) with verification + reset-password templates
- [x] Frontend: AuthContext (in-memory access token, silent session
      restore on load), Axios interceptors (auto-attach token,
      refresh-and-retry on 401), protected/public route guards,
      Login/Register/Forgot/Reset/Verify-Email/Profile/Dashboard pages

### Security decisions worth knowing about
- Refresh tokens and one-time tokens (email verification, password reset)
  are stored in the DB as SHA-256 hashes, never raw — a DB leak alone
  can't be replayed.
- Refresh token reuse (a revoked/rotated token presented again) revokes
  *every* session for that user — treated as a compromise signal.
- The access token is kept in memory on the client only (never
  localStorage) to limit XSS blast radius; it's restored via a silent
  `/auth/refresh-token` call on page load using the HttpOnly cookie.
- User enumeration is avoided on `forgot-password` and
  `resend-verification` — the response is identical whether or not the
  email exists.

### How to apply the Module 2 migration
```bash
cd server
# after setting DATABASE_URL in .env
npm run prisma:migrate -- --name add_user_and_refresh_token
```
This was not run in the sandbox (no DB/network access there) — run it
against your real database.

### How to test the auth flow locally
1. Start both servers (see Module 1 instructions).
2. Register at `/register`. If SMTP isn't configured, the verification
   email is logged to the **server** console (`[mail] Sent "Verify your
   email address"...`) instead of actually sending — copy the token out
   of the logged JSON payload's `html` field, or just configure real SMTP
   creds in `server/.env`.
3. Log in at `/login` — you'll land on `/dashboard`.
4. Try `/profile` to update your name, change password, or log out of all
   devices.
5. Refresh the page — you should stay logged in (silent session restore).

## Module 3 — Finance Core (next)
- [ ] `Category`, `Income`, `Expense`, `Budget`, `SavingsGoal` Prisma models
- [ ] Dashboard stats + Chart.js visualizations
- [ ] Income/expense CRUD, categories, monthly budgets, savings goals
- [ ] Transaction history with filtering
