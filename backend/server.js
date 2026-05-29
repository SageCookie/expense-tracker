import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './utils/DB.js';
import userRoutes from './routes/userRoutes.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); 
app.use(cookieParser()); 
app.use(cors()); 

app.use('/api/users', userRoutes); 

app.get('/', (req, res) => {
    res.send('Expense Tracker API is running...');
});

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server is locked in on port ${PORT}`);
    });
};

startServer();