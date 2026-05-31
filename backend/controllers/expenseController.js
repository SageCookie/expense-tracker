import Expense from '../models/Expense.js';
import { z } from 'zod';

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(['Food', 'Transport', 'Entertainment', 'Bills', 'Other']),
  description: z.string().optional(),
  date: z.date().optional(),
});

// @desc    Get all expenses for the logged-in user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const validatedData = expenseSchema.parse(req.body);

    const expense = await Expense.create({
      ...validatedData,
      user: req.user._id,
    });

    res.status(201).json(expense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this expense' });
    }

    const validatedData = expenseSchema.partial().parse(req.body);
    Object.assign(expense, validatedData);
    await expense.save();

    res.status(200).json(expense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expense summary (total, by category)
// @route   GET /api/expenses/summary
// @access  Private
const getExpenseSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const byCategory = {
      Food: 0,
      Transport: 0,
      Entertainment: 0,
      Bills: 0,
      Other: 0,
    };

    expenses.forEach((expense) => {
      byCategory[expense.category] += expense.amount;
    });

    res.status(200).json({
      total,
      count: expenses.length,
      byCategory,
      average: expenses.length > 0 ? total / expenses.length : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getExpenses, createExpense, updateExpense, deleteExpense, getExpenseSummary };