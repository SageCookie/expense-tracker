# Deployment Guide

## Overview

This guide covers deploying both the backend and frontend to production.

## Architecture

```
┌─────────────────┐
│   React App     │
│ (Vercel/Netlify)│
└────────┬────────┘
         │ API calls
         ↓
┌─────────────────┐
│  Express.js     │
│ (Vercel/Render) │
└────────┬────────┘
         │ Database
         ↓
┌─────────────────┐
│  MongoDB Atlas  │
│   (Cloud DB)    │
└─────────────────┘
```

## Prerequisites

1. GitHub account
2. Production database:
   - MongoDB Atlas account (free tier available)
3. Deployment platforms:
   - **Backend**: Vercel, Render, or Heroku
   - **Frontend**: Vercel, Netlify

## Step 1: Database Setup (MongoDB Atlas)

### Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a new project
4. Create a free M0 cluster
5. Add IP address: `0.0.0.0/0` (allow all for development, restrict in production)
6. Create database user with strong password
7. Get connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/expense-tracker?retryWrites=true&w=majority
   ```

## Step 2: Backend Deployment (Vercel or Render)

### Option A: Deploy with Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Add Environment Variables to `.env.production`**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/expense-tracker?retryWrites=true&w=majority
   JWT_SECRET=your-strong-secret-key-min-32-chars
   NODE_ENV=production
   ```

3. **Create `vercel.json` in backend root:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

4. **Deploy**
   - Push to GitHub
   - Go to https://vercel.com/new
   - Import your repository
   - Select `backend` folder as root directory
   - Add environment variables from step 2
   - Deploy

5. **Get Backend URL**: `https://your-backend.vercel.app`

### Option B: Deploy with Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Connect GitHub repository
   - Select `backend` directory
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Environment Variables**
   ```
   MONGO_URI=mongodb+srv://username:password@...
   JWT_SECRET=your-strong-secret-key
   NODE_ENV=production
   ```

4. **Deploy** - Render will auto-deploy on push

## Step 3: Frontend Deployment (Vercel or Netlify)

### Option A: Deploy with Vercel (Recommended)

1. **Create `vercel.json` in frontend root:**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

2. **Deploy**
   - Go to https://vercel.com/new
   - Import your repository
   - Select `frontend` folder as root directory
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add environment variable:
     ```
     VITE_API_URL=https://your-backend.vercel.app/api
     ```
   - Deploy

3. **Get Frontend URL**: `https://your-frontend.vercel.app`

### Option B: Deploy with Netlify

1. **Connect GitHub to Netlify**
   - Go to https://netlify.com
   - Sign up with GitHub
   - New site from Git → Select repository

2. **Configure Build Settings**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Add Environment Variables**
   - Site settings → Build & deploy → Environment
   - Add `VITE_API_URL=https://your-backend.vercel.app/api`

4. **Deploy** - Netlify will auto-deploy on push

## Step 4: Update Frontend API URL

Update `frontend/src/services/api.js`:

```javascript
const API = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:5000/api',
})
```

Or update for production:

```javascript
const API_URL = process.env.VITE_API_URL || 'https://your-backend.vercel.app/api'
const API = axios.create({
  baseURL: API_URL,
})
```

## Step 5: Configure CORS (Backend)

Update `backend/server.js` for production:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend.vercel.app',
    'https://your-frontend.netlify.app',
  ],
  credentials: true,
}))
```

## Step 6: Production Security Checklist

- [ ] **Environment Variables**
  - [ ] JWT_SECRET is strong (min 32 chars, random)
  - [ ] MONGO_URI is from MongoDB Atlas
  - [ ] NODE_ENV is set to 'production'

- [ ] **Database**
  - [ ] IP whitelist is restricted (not 0.0.0.0/0)
  - [ ] Database user has minimal permissions
  - [ ] Backups are enabled

- [ ] **API**
  - [ ] CORS is properly configured
  - [ ] Rate limiting is enabled
  - [ ] Input validation is in place
  - [ ] Error messages don't leak sensitive info

- [ ] **Frontend**
  - [ ] API calls use HTTPS
  - [ ] Tokens are stored securely (httpOnly cookies preferred)
  - [ ] Sensitive data is not logged
  - [ ] Build is optimized (minified, tree-shaken)

- [ ] **SSL/TLS**
  - [ ] HTTPS is enforced
  - [ ] Certificates are valid

## Monitoring & Maintenance

### Logs

**Backend (Vercel):**
- Dashboard → Deployments → Logs

**Backend (Render):**
- Service Dashboard → Logs

**Frontend (Vercel):**
- Dashboard → Deployments → Logs

### Scaling

**When to Scale:**
- Database: Upgrade MongoDB Atlas tier if nearing storage/CPU limits
- Backend: Increase concurrency/resources if requests slow
- Frontend: Already static, minimal scaling needs

### Backups

- MongoDB Atlas: Enable automated backups (35-day retention free tier)
- GitHub: Your code is already backed up

## Troubleshooting

### Frontend can't connect to backend

1. Check `VITE_API_URL` is set correctly
2. Verify CORS is enabled on backend
3. Check network tab in browser DevTools
4. Ensure backend is running and accessible

### Authentication not working

1. Check JWT_SECRET is the same in dev and production
2. Verify token is being sent in Authorization header
3. Check token expiration (7 days)

### Database connection errors

1. Verify MONGO_URI is correct
2. Check IP whitelist includes deployment server IP
3. Verify database user credentials
4. Check cluster status in MongoDB Atlas

### Build failures

1. Run `npm install` locally
2. Run `npm run build` to check for errors
3. Fix any missing dependencies
4. Push changes and redeploy

## Cost Estimation (Monthly)

| Service | Free Tier | Paid Tier | Notes |
|---------|-----------|-----------|-------|
| MongoDB Atlas | ✓ | $0-$500+ | 512MB free, sufficient for small apps |
| Vercel (Backend) | ✗ | $10+ | Pay-as-you-go for serverless |
| Vercel (Frontend) | ✓ | $10+ | Unlimited deployments |
| Render (Backend) | ✓ | $7+ | 750 hours free tier |
| Netlify (Frontend) | ✓ | Free | More than enough for this app |

## Rollback Procedure

### Vercel/Netlify
1. Go to Deployments
2. Select previous deployment
3. Click "Promote to Production"

### Render
1. Go to Deployments
2. Select previous build
3. Click "Deploy" to rollback

## Next Steps for Production

1. Add email verification on registration
2. Implement password reset functionality
3. Add expense categories management
4. Add expense filters (date range, category)
5. Add export to CSV/PDF
6. Implement recurring expenses
7. Add push notifications
8. Setup error tracking (Sentry)
9. Add analytics (Google Analytics)
10. Implement backup & restore functionality
