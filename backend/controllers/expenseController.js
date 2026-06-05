import Expense from '../models/Expense.js';
import { z } from 'zod';

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.string().trim().min(1, 'Category is required').max(30, 'Category name is too long'),
  description: z.string().optional(),
  date: z.date().optional(),
});

// @desc    Get all expenses for the logged-in user with filters, sorting, and pagination
// @route   GET /api/expenses
// @access  Private
// @query   startDate, endDate, category, minAmount, maxAmount, search, sortBy, sortOrder, page, limit
const getExpenses = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      category,
      minAmount,
      maxAmount,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) {
        filter.amount.$gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        filter.amount.$lte = parseFloat(maxAmount);
      }
    }

    // Search filter (in description and category)
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Determine sort order
    const sortOrderValue = sortOrder === 'asc' ? 1 : -1;
    const sortConfig = {};

    // Set sort field
    if (sortBy === 'amount') {
      sortConfig.amount = sortOrderValue;
    } else if (sortBy === 'category') {
      sortConfig.category = sortOrderValue;
    } else {
      sortConfig.date = sortOrderValue; // default to date
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Max 100 items per page
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await Expense.countDocuments(filter);

    // Fetch expenses
    const expenses = await Expense.find(filter)
      .sort(sortConfig)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      expenses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
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

// @desc    Get comprehensive analytics data
// @route   GET /api/expenses/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });

    if (expenses.length === 0) {
      return res.status(200).json({
        total: 0,
        count: 0,
        average: 0,
        byCategory: {},
        monthlyTrends: [],
        topCategories: [],
        dailyAverages: 0,
        last90DaysTotal: 0,
        last30DaysCount: 0,
        last90DaysCount: 0,
      });
    }

    // Calculate totals and category breakdown
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = {};
    expenses.forEach((expense) => {
      byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
    });

    // Calculate monthly trends
    const monthlyTrends = {};
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyTrends[monthYear]) {
        monthlyTrends[monthYear] = 0;
      }
      monthlyTrends[monthYear] += expense.amount;
    });

    const monthlyTrendsArray = Object.entries(monthlyTrends).map(([month, total]) => ({
      month,
      total: Math.round(total * 100) / 100,
    }));

    // Top categories by amount
    const topCategories = Object.entries(byCategory)
      .map(([category, categoryTotal]) => ({
        category,
        total: Math.round(categoryTotal * 100) / 100,
        percentage: total > 0 ? ((categoryTotal / total) * 100).toFixed(1) : '0.0',
      }))
      .sort((a, b) => b.total - a.total);

    // Daily averages for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last30Days = expenses.filter((e) => new Date(e.date) >= thirtyDaysAgo);
    const dailyAverages =
      last30Days.length > 0 ? (total / last30Days.length).toFixed(2) : 0;

    // Last 90 days summary
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const last90Days = expenses.filter((e) => new Date(e.date) >= ninetyDaysAgo);
    const last90Total =
      last90Days.length > 0 ? last90Days.reduce((sum, e) => sum + e.amount, 0) : 0;

    res.status(200).json({
      total: Math.round(total * 100) / 100,
      count: expenses.length,
      average: Math.round((total / expenses.length) * 100) / 100,
      byCategory,
      monthlyTrends: monthlyTrendsArray.slice(-12), // Last 12 months
      topCategories,
      dailyAverages: parseFloat(dailyAverages),
      last90DaysTotal: Math.round(last90Total * 100) / 100,
      last30DaysCount: last30Days.length,
      last90DaysCount: last90Days.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getExpenses, createExpense, updateExpense, deleteExpense, getExpenseSummary, getAnalytics };