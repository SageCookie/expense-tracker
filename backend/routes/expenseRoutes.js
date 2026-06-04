import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  getAnalytics,
} from '../controllers/expenseController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getExpenses);
router.post('/', createExpense);
router.get('/summary', getExpenseSummary);
router.get('/analytics', getAnalytics);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;