# Progress Log

## Module 0 — Repository Setup (done)
- Initialized git repository (`main` branch)
- Created monorepo layout: `server/` (Express + Prisma) and `client/`
  (React + Vite)
- Added `.gitignore` (node_modules, env files, build output, Prisma dev db)
- Added root `README.md` with architecture overview and module checklist

## Module 1 — Project Setup (next)
- [ ] `server/package.json` with all backend dependencies
- [ ] `client/package.json` with all frontend dependencies
- [ ] Prisma init + PostgreSQL datasource config
- [ ] `.env.example` files for server and client
- [ ] Express app bootstrap (`app.js`, `server.js`) with Helmet, CORS,
      Morgan, cookie-parser, centralized error handler
- [ ] `GET /api/health` health-check endpoint
- [ ] Vite + React 19 + Tailwind CSS client bootstrap
- [ ] Verify client ↔ server connectivity
