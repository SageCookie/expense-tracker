# Testing Guide

## Prerequisites for Full Testing

1. **MongoDB Setup** (choose one):
   - **Local MongoDB**: Install and run MongoDB locally
     ```bash
     # Windows with MongoDB installed:
     mongod
     ```
   - **MongoDB Atlas** (Recommended): 
     - Create account at https://www.mongodb.com/cloud/atlas
     - Create a free cluster
     - Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority`
     - Update `.env` in backend with the connection string

2. **Node.js**: Version 16 or higher
3. **npm**: Latest version

## Setup Instructions

### Backend Setup
```bash
cd backend
npm install
```

**Create `.env` file:**
```
MONGO_URI=mongodb://localhost:27017/expense-tracker
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority

JWT_SECRET=test-secret-key-12345
PORT=5000
NODE_ENV=development
```

**Start backend:**
```bash
npm run dev
# Server should start on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
```

**Start frontend:**
```bash
npm run dev
# App should open on http://localhost:5173
```

## Test Scenarios

### 1. User Registration

**Request:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response (201):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "jwt_token_here"
}
```

**Test Steps:**
- Open http://localhost:5173/register
- Enter name, email, password
- Click Register
- Should redirect to dashboard if successful

### 2. User Login

**Request:**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response (200):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "jwt_token_here"
}
```

**Test Steps:**
- Open http://localhost:5173/login
- Enter email and password
- Click Login
- Should redirect to dashboard

### 3. Create Expense

**Request:**
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 50.00,
    "category": "Food",
    "description": "Lunch at restaurant"
  }'
```

**Expected Response (201):**
```json
{
  "_id": "expense_id",
  "user": "user_id",
  "amount": 50,
  "category": "Food",
  "description": "Lunch at restaurant",
  "date": "2026-05-31T10:30:00.000Z",
  "createdAt": "2026-05-31T10:30:00.000Z",
  "updatedAt": "2026-05-31T10:30:00.000Z"
}
```

**Test Steps (in Dashboard):**
- Click "Add Expense" button
- Enter amount, category, description
- Click "Add Expense"
- Expense should appear in the list
- Category pie chart should update

### 4. Get All Expenses

**Request:**
```bash
curl -X GET http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200):**
```json
[
  {
    "_id": "expense_id",
    "user": "user_id",
    "amount": 50,
    "category": "Food",
    "description": "Lunch",
    "date": "2026-05-31T10:30:00.000Z"
  }
]
```

**Test Steps:**
- Navigate to dashboard after login
- Should see all expenses in the list

### 5. Update Expense

**Request:**
```bash
curl -X PUT http://localhost:5000/api/expenses/EXPENSE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 60.00,
    "description": "Updated description"
  }'
```

**Expected Response (200):**
```json
{
  "_id": "expense_id",
  "user": "user_id",
  "amount": 60,
  "category": "Food",
  "description": "Updated description",
  "date": "2026-05-31T10:30:00.000Z"
}
```

### 6. Delete Expense

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/expenses/EXPENSE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200):**
```json
{
  "message": "Expense deleted successfully"
}
```

**Test Steps (in Dashboard):**
- Click trash icon on any expense
- Expense should be removed from list
- Stats should update

### 7. Get Expense Summary

**Request:**
```bash
curl -X GET http://localhost:5000/api/expenses/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200):**
```json
{
  "total": 110,
  "count": 2,
  "byCategory": {
    "Food": 110,
    "Transport": 0,
    "Entertainment": 0,
    "Bills": 0,
    "Other": 0
  },
  "average": 55
}
```

### 8. User Logout

**Request:**
```bash
curl -X POST http://localhost:5000/api/users/logout
```

**Expected Response (200):**
```json
{
  "message": "User logged out successfully"
}
```

**Test Steps (in Dashboard):**
- Click "Logout" button
- Should redirect to login page
- Token should be cleared from localStorage

## Authorization Tests

### Test 1: Access expense without token
**Expected:** 401 Unauthorized
```bash
curl -X GET http://localhost:5000/api/expenses
```

### Test 2: Access with invalid token
**Expected:** 401 Unauthorized
```bash
curl -X GET http://localhost:5000/api/expenses \
  -H "Authorization: Bearer invalid_token"
```

### Test 3: User cannot access other user's expenses
1. Register user A, create expenses
2. Register user B
3. Try to access user A's expenses with user B's token
**Expected:** Should only see empty list or 403 Forbidden

## Validation Tests

### Invalid Amount (negative)
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": -50, "category": "Food"}'
```
**Expected:** 400 Bad Request with error message

### Invalid Category
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 50, "category": "InvalidCategory"}'
```
**Expected:** 400 Bad Request

### Duplicate Email Registration
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "existing@example.com",
    "password": "password123"
  }'
```
**Expected:** 400 Bad Request - "User already exists"

## UI Testing Checklist

- [ ] Login page loads correctly with email/password fields
- [ ] Register page has name, email, password fields
- [ ] Password field shows eye icon to toggle visibility
- [ ] Error messages display on failed auth
- [ ] Successful login redirects to dashboard
- [ ] Dashboard shows user name in navbar
- [ ] Dashboard displays stats (Total, Count, Average)
- [ ] Add expense modal opens with form fields
- [ ] Expense list displays all expenses
- [ ] Category breakdown pie chart updates on add/delete
- [ ] Delete button removes expense from list
- [ ] Logout button clears session and redirects to login
- [ ] Responsive design works on mobile/tablet
- [ ] UI transitions are smooth

## Performance Checklist

- [ ] Page load time < 2 seconds
- [ ] Expense operations (add/delete) respond quickly
- [ ] No console errors
- [ ] No memory leaks
- [ ] Proper error handling and user feedback

## Deployment Testing

After deploying to production, verify:
- [ ] Frontend loads from production URL
- [ ] Backend API is accessible from production frontend
- [ ] CORS is properly configured
- [ ] Environment variables are correctly set
- [ ] Database connection works in production
- [ ] All CRUD operations work end-to-end
- [ ] Authentication flow works

## Common Issues & Solutions

### MongoDB Connection Error
**Error:** `MongoDB connection error: connect ECONNREFUSED`
**Solution:**
- Ensure MongoDB is running: `mongod`
- Or use MongoDB Atlas and update MONGO_URI in .env

### CORS Errors
**Error:** `Access to XMLHttpRequest blocked by CORS`
**Solution:**
- Backend CORS is already enabled in server.js
- Check that frontend is running on http://localhost:5173
- Backend should be on http://localhost:5000

### Token Expired
**Error:** `Invalid or expired token`
**Solution:**
- Log in again to get a fresh token
- Token expires after 7 days

### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`
**Solution:**
```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```
