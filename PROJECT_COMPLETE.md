# Hisaab — Expense Tracker — Project Complete

A full-stack expense tracking application with authentication, email verification, multi-page dashboard, analytics, budgets, and modern UI.

**Last updated:** June 2026  
**Status:** Production-ready (with email + MongoDB configured)

---

## Completion summary

| Area | Status | Highlights |
|------|--------|------------|
| Frontend | Done | 10+ pages, layout system, dark mode, charts, filters, pagination |
| Backend | Done | Auth, email verification, expense CRUD, analytics API |
| Database | Done | Users, expenses, email verification records |
| Email | Done | Resend + SMTP; codes for register / password / delete |
| Documentation | Done | README, DEPLOYMENT, TESTING, this file |

---

## Implemented features

### Authentication & security
- Register with **email verification** (6-digit code, 15 min expiry)
- Login / logout with JWT
- Change password (current password + email code)
- Delete account (password + email code + type DELETE)
- bcrypt password hashing, protected routes, Zod validation

### Expense tracking
- Dashboard overview with stats and recent expenses
- **Transaction history** — sort, filter (date, category, amount, search), pagination, CSV export, inline edit/delete
- Add expenses with default or **custom categories**
- Per-user data isolation

### Analytics & budget
- **Analytics** — summary cards, pie/bar/line charts, insights, report export
- **Empty state** when user has no expenses (no blank crash)
- **Budget** — per-category limits, progress bars, overspend warnings
- **Custom categories** — create/remove from Budget page (stored in `localStorage`)

### Settings & UX
- **Currency** — dedicated Settings tab (display symbol across app)
- **Theme** — dark/light toggle on landing + dashboard navbar
- **Profile** — user spending summary
- Responsive sidebar + mobile bottom navigation
- Landing page for unauthenticated users

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios, Recharts, Lucide |
| Backend | Express 5, Mongoose 9, JWT, bcrypt, Zod, Nodemailer, Resend SDK |
| Database | MongoDB / MongoDB Atlas |

---

## Project structure

```
expense-tracker/
├── backend/
│   ├── controllers/
│   │   ├── userController.js
│   │   └── expenseController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Expense.js
│   │   └── EmailVerification.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── expenseRoutes.js
│   ├── middleware/authMiddleware.js
│   ├── utils/
│   │   ├── DB.js
│   │   ├── generateToken.js
│   │   ├── sendEmail.js
│   │   └── verificationHelpers.js
│   ├── server.js
│   └── .env.example
│
├── frontend/src/
│   ├── components/
│   │   ├── layout/          # MainLayout, Sidebar, Navbar, BottomNav
│   │   ├── Button, Input, Card, Modal, Alert, Charts
│   │   ├── FilterPanel, TransactionTable, PaginationBar
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx, Register.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── TransactionHistoryPage.jsx
│   │   ├── AnalyticsPage.jsx
│   │   ├── BudgetPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── SettingsPage.jsx
│   ├── context/             # ThemeContext, CurrencyContext
│   ├── services/api.js
│   └── utils/categories.js
│
├── README.md
├── DEPLOYMENT.md
├── TESTING.md
└── PROJECT_COMPLETE.md
```

---

## API overview

### Public
- `POST /api/users` — start registration (sends email)
- `POST /api/users/register/confirm` — complete registration
- `POST /api/users/login`
- `POST /api/users/logout`

### Protected (Bearer token)
- `POST /api/users/password/request-verification`
- `POST /api/users/password/confirm`
- `POST /api/users/delete/request-verification`
- `POST /api/users/delete/confirm`
- `GET|POST|PUT|DELETE /api/expenses` (+ query filters)
- `GET /api/expenses/summary`
- `GET /api/expenses/analytics`

---

## Quick start

```bash
# Backend
cd backend && npm install
cp .env.example .env
# Set MONGO_URI, JWT_SECRET, RESEND_API_KEY (or SMTP)
npm run dev

# Frontend (new terminal)
cd frontend && npm install
npm run dev
```

- API: `http://localhost:5000`
- App: `http://localhost:5173`

---

## Environment variables (backend)

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | MongoDB connection |
| `JWT_SECRET` | JWT signing |
| `PORT` | Server port (default 5000) |
| `RESEND_API_KEY` | Email via Resend |
| `RESEND_FROM` | Sender address |
| `SMTP_*` | Alternative Gmail/SMTP |

See `backend/.env.example` for full template.

---

## Design

- **Brand:** Hisaab
- **Colors:** Indigo primary, pink accents, gradient accents
- **Icons:** Lucide React
- **Charts:** Recharts (responsive)
- **Layout:** Card-based UI, sticky nav, mobile-first

---

## Known limitations

- Budgets and custom categories stored in **browser localStorage** (not synced to server per user)
- Notification preferences in Settings are UI-only (not persisted to backend)
- No password reset via “forgot password” link (change password requires login + email)
- Email required for signup and sensitive account actions
- `VITE_API_URL` must be set manually for production frontend (see DEPLOYMENT.md)

---

## Possible future work

- Persist budgets/categories per user in MongoDB
- Forgot-password flow (email link)
- Recurring expenses
- PDF export
- Push / email budget alerts (backend-driven)
- OAuth (Google sign-in)
- Mobile app (React Native)

---

## Documentation index

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Overview, setup, API reference |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Atlas, Render, Vercel, email, CORS |
| [TESTING.md](./TESTING.md) | Manual test scenarios |
| [PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md) | This summary |

---

## Project stats (approximate)

| Metric | Value |
|--------|--------|
| Frontend pages | 10 |
| Reusable components | 15+ |
| API endpoints | 14+ |
| Database models | 3 |
| Auth flows with email | 3 (register, password, delete) |

---

**Ready for deployment** — follow [DEPLOYMENT.md](./DEPLOYMENT.md) to go live with MongoDB Atlas, Render/Vercel, and Resend or SMTP.
