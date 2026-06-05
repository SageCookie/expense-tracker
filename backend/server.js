import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './utils/DB.js';
import { verifyEmailSetup } from './utils/sendEmail.js';
import userRoutes from './routes/userRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'https://expense-tracker-a3y7.vercel.app', 
    credentials: true 
}));

app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/', (req, res) => {
    res.send('Expense Tracker API is running...');
});

const startServer = async () => {
    await connectDB();
    await verifyEmailSetup();

    app.listen(PORT, () => {
        console.log(`Server is locked in on port ${PORT}`);
    });
};

startServer();