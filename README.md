# AI-Powered Finance & Loan Management System

A production-ready full-stack platform for personal finance management, loan
tools, credit score estimation, and AI-powered financial advice, with a
separate admin dashboard for user, loan, and analytics management.

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router DOM, Axios, React
Hook Form, Chart.js, React Hot Toast

**Backend:** Node.js, Express.js, Prisma ORM, PostgreSQL, JWT
(access + refresh tokens, HttpOnly cookies), bcrypt, Helmet, Morgan, CORS,
Cookie Parser, Express Validator, Nodemailer

**AI:** Google Gemini API
**PDF Reports:** PDFKit
**Deployment:** Vercel (frontend) · Render (backend) · Neon PostgreSQL (DB)

## Monorepo Structure

```
ai-finance-loan-system/
├── server/                 # Express + Prisma API
│   ├── src/
│   │   ├── config/         # env, db, third-party client setup
│   │   ├── controllers/    # thin HTTP layer, calls services
│   │   ├── middleware/     # auth, error handling, validation, rate limiting
│   │   ├── routes/         # Express routers
│   │   ├── services/       # business logic
│   │   ├── repositories/   # Prisma data access layer
│   │   ├── utils/          # shared helpers (API response, tokens, etc.)
│   │   ├── validators/     # express-validator schemas
│   │   ├── prisma/         # Prisma client instance
│   │   ├── emails/         # Nodemailer templates + senders
│   │   ├── ai/             # Gemini API integration
│   │   ├── app.js          # Express app (middleware, routes)
│   │   └── server.js       # entry point (listen)
│   └── prisma/
│       └── schema.prisma   # database schema
│
└── client/                 # React + Vite SPA
    └── src/
        ├── components/     # reusable UI components
        ├── pages/          # route-level pages
        ├── layouts/        # shared page layouts (auth, dashboard, admin)
        ├── hooks/          # custom React hooks
        ├── context/        # React context providers (auth, theme)
        ├── services/       # Axios API clients
        ├── utils/          # shared frontend helpers
        ├── assets/         # static assets
        └── routes/         # route definitions / route guards
```

## Development Status

This repository is being built module by module. See commit history and
`docs/PROGRESS.md` for what's implemented so far.

## Modules

- [x] Module 1 — Project setup, folder structure, Prisma init, Express
      server bootstrap, Vite + Tailwind client bootstrap, health-check API
- [ ] Module 2 — Authentication (register, login, JWT + refresh tokens,
      email verification, password reset)
- [ ] Module 3 — Finance core (income, expenses, categories, budgets,
      savings goals, transactions)
- [ ] Module 4 — Loans (EMI calculator, eligibility, comparison, applications)
- [ ] Module 5 — Credit score estimator + history
- [ ] Module 6 — Reports (PDF export)
- [ ] Module 7 — AI financial advisor (Gemini)
- [ ] Module 8 — Notifications & emails
- [ ] Module 9 — Dashboard & charts
- [ ] Module 10 — Admin panel
- [ ] Module 11 — Security hardening & deployment
