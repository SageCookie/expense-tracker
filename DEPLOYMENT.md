# Deployment Guide

Deploy **Hisaab** (Expense Tracker) with a React frontend, Express API, MongoDB Atlas, and an email provider for verification codes.

## Architecture

```
┌──────────────────────┐
│   React (Vite)       │  Vercel / Netlify
│   Static frontend    │
└──────────┬───────────┘
           │ HTTPS  VITE_API_URL
           ▼
┌──────────────────────┐
│   Express API        │  Render / Railway / Vercel
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐     ┌──────────────────────┐
│   MongoDB Atlas      │     │ Resend or SMTP       │
│   (database)         │     │ (verification email) │
└──────────────────────┘     └──────────────────────┘
```

## Prerequisites

1. GitHub repository with this project
2. **MongoDB Atlas** cluster (free M0 tier is fine)
3. **Email provider** (required in production):
   - [Resend](https://resend.com) — recommended; one API key
   - Or Gmail SMTP with an [App Password](https://myaccount.google.com/apppasswords)
4. Hosting:
   - **Backend:** Render (recommended for long-running Node) or Railway
   - **Frontend:** Vercel or Netlify

---

## Step 1: MongoDB Atlas

1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Database Access → create a user with read/write on your database
3. Network Access → allow your deployment IPs (or `0.0.0.0/0` only while testing; restrict later)
4. Connect → Drivers → copy connection string:

```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/expense-tracker?retryWrites=true&w=majority
```

Use this as `MONGO_URI` in production.

---

## Step 2: Email (required)

Verification codes are sent for **registration**, **password change**, and **account deletion**. Without email config, those flows return errors.

### Option A — Resend

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. For production, [verify your domain](https://resend.com/docs/dashboard/domains/introduction) or use `onboarding@resend.dev` (free tier: limited recipients)

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM=Hisaab <onboarding@resend.dev>
```

### Option B — Gmail SMTP

1. Enable 2-Step Verification on Google Account
2. Create an App Password (not your normal Gmail password)
3. Set:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
SMTP_FROM=Hisaab <your.email@gmail.com>
```

After deploy, check backend logs for `✓ Email delivery ready` on startup.

---

## Step 3: Backend deployment (Render)

Render suits Express apps that listen on a port (better than serverless for this project).

1. [render.com](https://render.com) → New → **Web Service**
2. Connect GitHub repo
3. **Root directory:** `backend`
4. **Build command:** `npm install`
5. **Start command:** `npm start`
6. **Environment variables:**

| Key | Value |
|-----|--------|
| `MONGO_URI` | Atlas connection string |
| `JWT_SECRET` | Long random string (32+ chars) |
| `NODE_ENV` | `production` |
| `RESEND_API_KEY` | (or full SMTP block) |
| `RESEND_FROM` | Verified sender |

7. Deploy → note URL, e.g. `https://hisaab-api.onrender.com`

### Health check

Open `https://your-api.onrender.com/` — should return `Expense Tracker API is running...`

---

## Step 4: Frontend deployment (Vercel)

1. [vercel.com](https://vercel.com) → Import repo
2. **Root directory:** `frontend`
3. **Framework preset:** Vite
4. **Build command:** `npm run build`
5. **Output directory:** `dist`
6. **Environment variable:**

```
VITE_API_URL=https://your-api.onrender.com/api
```

7. Deploy → note URL, e.g. `https://hisaab.vercel.app`

### Wire API URL in code

Update `frontend/src/services/api.js`:

```javascript
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})
```

Redeploy frontend after this change if it was not already set.

---

## Step 5: CORS (production)

Update `backend/server.js` so only your frontend origin can call the API:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
```

Set on the backend:

```env
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## Step 6: Production checklist

### Environment
- [ ] `JWT_SECRET` is unique and strong
- [ ] `MONGO_URI` points to Atlas (not localhost)
- [ ] Email configured (`RESEND_API_KEY` or SMTP)
- [ ] `FRONTEND_URL` set for CORS
- [ ] `VITE_API_URL` set on frontend host

### Security
- [ ] Atlas IP allowlist restricted where possible
- [ ] No `.env` files committed to Git
- [ ] HTTPS on both frontend and API

### Functional smoke test
- [ ] Register new user → receive email code → complete signup
- [ ] Login → add expense → view dashboard & history
- [ ] Analytics loads (empty state with no data; charts with data)
- [ ] Settings → change password (email code)
- [ ] Budget → create custom category

---

## Troubleshooting

### Verification email not received

1. Confirm backend log shows `✓ Email delivery ready`
2. Check spam folder
3. Resend free tier: may only send to verified addresses until domain is verified
4. Gmail: must use App Password, not account password

### Frontend cannot reach API

1. `VITE_API_URL` must include `/api` suffix and use `https://`
2. CORS `FRONTEND_URL` must match exact frontend origin (no trailing slash)
3. Browser DevTools → Network tab for failed requests

### Authentication fails after deploy

1. Same `JWT_SECRET` across redeploys (changing it invalidates old tokens)
2. Token sent as `Authorization: Bearer <token>` from `localStorage`

### MongoDB connection errors

1. Verify username/password in `MONGO_URI` (URL-encode special characters)
2. Atlas Network Access allows Render outbound IPs
3. Cluster is running (not paused on free tier)

### Analytics blank page

Fixed in current version: empty users see “No expenses yet” instead of a crash. Ensure latest frontend is deployed.

### Build failures

```bash
cd frontend && npm install && npm run build
cd backend && npm install && npm start
```

Fix errors locally, push, redeploy.

---

## Cost estimate (monthly)

| Service | Free tier | Notes |
|---------|-----------|--------|
| MongoDB Atlas M0 | Yes | 512 MB storage |
| Render Web Service | Yes* | Free tier spins down; cold starts |
| Vercel (frontend) | Yes | Hobby tier sufficient |
| Resend | Yes | Limited sends; domain verification for production |
| Netlify (frontend alt.) | Yes | Alternative to Vercel |

---

## Rollback

- **Vercel / Netlify:** Deployments → previous deployment → Promote to production
- **Render:** Manual deploy from earlier commit or rollback in dashboard

---

## Optional improvements

- Custom domain + SSL on Vercel/Render
- Rate limiting on auth routes (e.g. `express-rate-limit`)
- Error monitoring (Sentry)
- CI/CD GitHub Actions for test + deploy on push

For local development and API details, see [README.md](./README.md).
