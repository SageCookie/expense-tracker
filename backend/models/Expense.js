import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // This is the relational link to the User model
        },
        amount: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['Food', 'Transport', 'Entertainment', 'Bills', 'Other'], // Restricts input to specific categories
        },
        description: {
            type: String,
            required: false,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;