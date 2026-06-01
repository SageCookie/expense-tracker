# 💰 Expense Tracker

A modern, minimal web application to help users easily track, manage, and visualize their expenses. Built with **React**, **Tailwind CSS**, **Express.js**, and **MongoDB**.

## 🌟 Features

- 👤 **User Authentication** - Secure registration and login with JWT tokens
- 💳 **Expense Management** - Add, edit, delete, and view expenses
- 📊 **Analytics Dashboard** - Visualize spending by category with pie charts
- 🏷️ **Category Organization** - Food, Transport, Entertainment, Bills, Other
- 📈 **Statistics** - Total spent, average expense, expense count
- 🎨 **Modern UI** - Clean, minimal design with Tailwind CSS
- 🔒 **Secure** - Password hashing with bcrypt, JWT authentication
- 📱 **Responsive** - Works seamlessly on desktop and mobile

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Charts & visualizations
- **Lucide Icons** - Icon library

### Backend
- **Node.js & Express.js** - Server
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Data validation

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- npm/yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```
   Update the values:
   ```
   MONGO_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your-secret-key-here
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## 📁 Project Structure

```
expense-tracker/
├── backend/
│   ├── controllers/
│   │   ├── userController.js
│   │   └── expenseController.js
│   ├── models/
│   │   ├── User.js
│   │   └── Expense.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── expenseRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── utils/
│   │   ├── DB.js
│   │   └── generateToken.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Alert.jsx
│   │   │   └── Charts.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/users` - Register new user
- `POST /api/users/login` - Login user
- `POST /api/users/logout` - Logout user

### Expenses (Protected - Requires JWT Token)
- `GET /api/expenses` - Get all expenses for user
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary` - Get expense summary/statistics

## 🧪 Testing the API

You can test the API using Postman or curl:

### Register
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Add Expense (use token from login)
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":50.00,"category":"Food","description":"Lunch"}'
```

## 🎨 Design Philosophy

- **Minimal & Modern** - Clean interface focusing on essential features
- **User-Centric** - Intuitive navigation and easy expense tracking
- **Responsive** - Adapts to all screen sizes
- **Performance** - Fast load times with Vite and optimized components

## 📊 Expense Categories

- 🍔 Food
- 🚗 Transport
- 🎬 Entertainment
- 💡 Bills
- 📝 Other

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens for stateless authentication
- Protected routes with auth middleware
- CORS enabled
- HttpOnly cookies for token storage

## 📝 Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
Optional - Vite proxy handles API calls to localhost:5000

## 🚀 Deployment

### Backend (Vercel/Render)
1. Push code to GitHub
2. Connect to Vercel/Render
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect to Vercel/Netlify
3. Set build command: `npm run build`
4. Deploy

## 📞 Support

For issues or questions, please create an issue in the repository.

## 📄 License

ISC

---

**Happy Tracking! 💸**