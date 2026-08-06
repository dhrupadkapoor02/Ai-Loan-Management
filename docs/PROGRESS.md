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

## Module 3 — Finance Core (done)
- [x] `Category` (system default + user custom), `Income`, `Expense`,
      `Budget`, `SavingsGoal` Prisma models
- [x] Categories: list (defaults + custom merged), create/update/delete
      custom categories (defaults are protected from modification)
- [x] Income: full CRUD, filterable/paginated listing (date range, category)
- [x] Expense: full CRUD, filterable/paginated listing
- [x] Monthly budgets: set/update per category, auto-computed spent /
      remaining / percentUsed / isOverBudget against real expense data
- [x] Savings goals: CRUD + atomic "contribute funds" (DB-level increment,
      not read-then-write, so concurrent contributions can't clobber each
      other), auto-marks `isCompleted` once target is reached
- [x] Transaction history: combined income+expense feed, filterable by
      type/category/date range, correctly paginated across both tables
      via a parameterized raw-SQL UNION (Prisma's query builder can't
      paginate across two models on its own)
- [x] Dashboard aggregation: summary stats + all 4 chart datasets
      (expense distribution, income vs expense, monthly expenses trend,
      cumulative savings trend — last 6 months)
- [x] `prisma/seed.js`: seeds sensible default income/expense categories
- [x] Frontend: Income/Expense pages (table + modal form), Budgets page
      (progress bars, month/year picker), Savings Goals page (progress +
      contribute), Transactions page (filterable history), Dashboard
      rewritten with real Chart.js visuals (Doughnut, Bar, 2x Line)

### Design decisions worth knowing about
- `Budget.categoryId` is **required**, not nullable. I originally modeled
  an "overall" budget with a null categoryId, then caught that a nullable
  column inside a composite `@@unique` is a Postgres footgun — Postgres
  never considers two NULLs equal, so uniqueness silently wouldn't be
  enforced for multiple "overall" budgets. Every budget is category-scoped
  instead.
- All monetary amounts are Prisma `Decimal` in the DB (exact, no float
  rounding errors) but converted to plain JS numbers before leaving the
  service layer (`utils/serialize.js`), so the frontend/Chart.js never
  has to deal with Decimal-as-string quirks.
- Category ownership check (`assertUsableCategory` in
  `category.service.js`) is shared by income/expense/budget services —
  a categoryId must either be a system default (`userId: null`) or
  belong to the authenticated user, and must match the expected
  INCOME/EXPENSE type.

### How to apply the Module 3 migration
```bash
cd server
npm run prisma:migrate -- --name add_finance_core
npm run prisma:seed
```
Not run in the sandbox (no DB/network access there) — run against your
real database, same as Module 2's migration.

### How to test locally
1. Log in, go to **Income** → add a couple of income records with
   different categories/dates.
2. Go to **Expenses** → add several expenses across different categories
   and dates (some in the current month, some in previous months, to see
   the trend charts populate).
3. Go to **Budgets** → set a monthly limit for a category you've spent
   on; confirm the progress bar and over-budget warning reflect real
   spending.
4. Go to **Savings Goals** → create a goal, contribute funds, confirm it
   marks itself completed once the target is reached.
5. Go to **Transactions** → confirm income and expenses appear merged,
   sorted by date, filterable by type.
6. Go to **Dashboard** → confirm all 4 charts render with real data and
   change when you switch the month/year selector.

## Module 4 — Loans (done)
- [x] `Loan` model — tracks loans the user currently holds (saved from the
      EMI calculator), with `isActive` marking whether it counts toward
      debt obligations
- [x] `LoanApplication` model — a formal application workflow
      (PENDING → UNDER_REVIEW → APPROVED/REJECTED/CANCELLED); user-facing
      actions this module are submit + cancel, admin approve/reject is
      reserved for Module 10 (the service function `reviewApplication`
      already exists, just isn't routed yet)
- [x] EMI Calculator — standard reducing-balance formula, full
      amortization schedule, principal-vs-interest doughnut chart,
      "save this loan" flow
- [x] Loan Eligibility Checker — a transparent debt-to-income heuristic
      using the user's **real** recorded income (last 3 months average)
      and active saved loans; clearly labeled as an estimate, not a
      lender guarantee
- [x] Loan Comparison — 2 to 5 offers side by side with an EMI/interest
      bar chart
- [x] Loan Application Tracking — submit, list, view, cancel (only while
      PENDING/UNDER_REVIEW)
- [x] Frontend: EMI Calculator, My Loans, Eligibility Checker, Compare
      Loans, Applications pages
- [x] `DashboardLayout` redesigned as a grouped sidebar (Overview /
      Finance / Loans), since the flat top nav from Module 1-3 didn't
      scale past ~12 destinations. Same color tokens/patterns as before —
      no visual identity change, just a structural one.

### Design decisions worth knowing about
- `loanMath.js` (EMI formula, amortization, inverse-EMI) was verified by
  actually running it in the sandbox with Node — a ₹5,00,000 loan at 8.5%
  over 60 months computes to a ₹10,258.27/month EMI, the amortization
  schedule's principal components sum exactly back to ₹5,00,000, and the
  inverse-EMI function correctly recovers the original principal from a
  target EMI (off by ₹0.21 due to rounding, which is expected).
- The eligibility checker is explicitly a simplified heuristic (50%
  debt-to-income threshold, most lenders use far more inputs) — the API
  response includes an `assumptions.note` field and the UI surfaces it,
  so it's never presented as a guarantee.

### How to apply the Module 4 migration
```bash
cd server
npx prisma migrate dev --name add_loans
```
Not run in the sandbox (no DB/network access there) — run against your
real database.

### How to test locally
1. Go to **EMI Calculator** → enter a loan amount/rate/tenure, confirm
   the EMI, total interest, and amortization schedule look right; try
   "Save this loan".
2. Go to **My Loans** → confirm the saved loan shows up; try toggling
   active/inactive and deleting.
3. Go to **Eligibility Checker** → enter a requested amount; confirm it
   reflects your actual income (add some Income records first if you
   haven't) and any active loans from step 2.
4. Go to **Compare Loans** → add/remove offers, confirm the chart and
   table update.
5. Go to **Applications** → submit a new application, confirm it shows
   as PENDING, then cancel it and confirm the Cancel button disappears
   once cancelled.

## Module 5 — Credit Score (next)
- [ ] `CreditScore` Prisma model
- [ ] Credit Score Estimator (heuristic based on income stability, debt
      obligations, budget adherence, savings behavior)
- [ ] Credit Score History + trend chart
