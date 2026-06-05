# Hisaab — Expense Tracker

A modern full-stack web app to track, manage, and visualize personal expenses. Built with **React**, **Tailwind CSS**, **Express.js**, and **MongoDB**.

## Features

### Core
- **User authentication** — JWT-based login with secure password hashing (bcrypt)
- **Email verification** — 6-digit codes for registration, password change, and account deletion (Resend or Gmail SMTP)
- **Expense management** — Add, edit, delete, filter, sort, and paginate transactions
- **Multi-page dashboard** — Dedicated views for overview, history, analytics, budget, profile, and settings

### Insights & organization
- **Analytics** — Pie, bar, and line charts; summary stats; exportable text report
- **Budget management** — Per-category monthly limits with progress bars and overspend alerts
- **Custom categories** — Create your own spending categories from the Budget page
- **Default categories** — Food, Transport, Entertainment, Bills, Other (plus any custom ones)

### UX
- **Dark / light theme** — Toggle on landing and dashboard navbar
- **Multi-currency display** — Choose display currency in Settings (stored in browser)
- **Responsive layout** — Sidebar + bottom nav on mobile; works on desktop and phone
- **Empty states** — Friendly messaging when there is no expense data (e.g. Analytics)

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide React |
| Backend | Node.js, Express 5, Mongoose, JWT, bcrypt, Zod, Nodemailer, Resend |
| Database | MongoDB (local or Atlas) |

## Quick start

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Email provider for verification codes ([Resend](https://resend.com) or Gmail App Password)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, and email (RESEND_API_KEY or SMTP_*)
npm run dev
```

API runs at `http://localhost:5000`. On startup, the console shows whether email delivery is configured.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Project structure

```
expense-tracker/
├── backend/
│   ├── controllers/
│   │   ├── userController.js      # Auth, email verification, account actions
│   │   └── expenseController.js   # CRUD, filters, analytics
│   ├── models/
│   │   ├── User.js
│   │   ├── Expense.js
│   │   └── EmailVerification.js
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   │   ├── DB.js
│   │   ├── generateToken.js
│   │   ├── sendEmail.js           # Resend + SMTP
│   │   └── verificationHelpers.js
│   ├── server.js
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── components/            # UI + layout + charts + tables
│       ├── pages/                 # Landing, auth, dashboard, history, etc.
│       ├── context/               # Theme, currency
│       ├── services/api.js
│       └── utils/categories.js    # Default + custom categories
│
├── README.md
├── DEPLOYMENT.md
├── PROJECT_COMPLETE.md
└── TESTING.md
```

## API endpoints

### Authentication (public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Start registration — sends verification email |
| POST | `/api/users/register/confirm` | Confirm registration with email code |
| POST | `/api/users/login` | Login |
| POST | `/api/users/logout` | Logout |

### Account (protected — `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/password/request-verification` | Request password change code |
| POST | `/api/users/password/confirm` | Confirm password change with code |
| POST | `/api/users/delete/request-verification` | Request account deletion code |
| POST | `/api/users/delete/confirm` | Confirm account deletion with code |

### Expenses (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List with filters, sort, pagination (`?page`, `limit`, `category`, `search`, dates, etc.) |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/summary` | Summary statistics |
| GET | `/api/expenses/analytics` | Full analytics payload for charts |

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs (use a long random string in production) |
| `PORT` | No | Default `5000` |
| `RESEND_API_KEY` | Email* | Resend API key (recommended) |
| `RESEND_FROM` | No | Sender, e.g. `Hisaab <onboarding@resend.dev>` |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Email* | Gmail or other SMTP (alternative to Resend) |
| `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM` | No | SMTP options |

\*Configure **either** Resend **or** SMTP. Verification emails are required for register, password change, and account delete.

See `backend/.env.example` for a full template.

### Frontend (optional)

For production, set `VITE_API_URL` to your deployed API base (e.g. `https://your-api.onrender.com/api`) and use it in `frontend/src/services/api.js`. See [DEPLOYMENT.md](./DEPLOYMENT.md).

## App routes (frontend)

| Path | Page |
|------|------|
| `/` | Landing |
| `/login`, `/register` | Auth (register uses 2-step email verification) |
| `/dashboard` | Overview, recent expenses, add expense |
| `/history` | Full transaction table, filters, CSV export |
| `/analytics` | Charts and insights |
| `/budget` | Category budgets + custom categories |
| `/profile` | User stats |
| `/settings` | Password, currency, preferences, delete account |

## Security

- Passwords hashed with bcrypt
- JWT in `Authorization` header (also httpOnly cookie on login)
- Protected expense and account routes
- Email verification before registration completes, password change, or account deletion
- Zod validation on expense input
- Per-user data isolation on all expense queries

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for MongoDB Atlas, Render/Vercel, CORS, email in production, and troubleshooting.


## License

ISC
