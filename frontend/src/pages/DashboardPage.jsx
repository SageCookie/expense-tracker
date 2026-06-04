import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Plus, Trash2, TrendingUp, Eye } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import Input from '../components/Input'
import { PieChartComponent } from '../components/Charts'
import { expenseAPI, authAPI } from '../services/api'
import { useCurrency } from '../context/CurrencyContext'
import MainLayout from '../components/layout/MainLayout'

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Bills', 'Other']
const categoryColors = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Entertainment: '#ec4899',
  Bills: '#6366f1',
  Other: '#10b981',
}

export default function DashboardPage({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const { getCurrencySymbol } = useCurrency()
  const [expenses, setExpenses] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ amount: '', category: 'Food', description: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const symbol = getCurrencySymbol()

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getAll()
      
      // Safely dig into the response object to find the actual array
      let extractedExpenses = [];
      if (Array.isArray(response.data)) {
        extractedExpenses = response.data;
      } else if (response.data?.expenses && Array.isArray(response.data.expenses)) {
        extractedExpenses = response.data.expenses;
      } else if (response.data?.data?.expenses && Array.isArray(response.data.data.expenses)) {
        extractedExpenses = response.data.data.expenses;
      }

      setExpenses(extractedExpenses);
    } catch (err) {
      setError('Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await expenseAPI.create({
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
      })
      setSuccess('Expense added successfully!')
      setFormData({ amount: '', category: 'Food', description: '' })
      setIsModalOpen(false)
      fetchExpenses()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense')
    }
  }

  const handleDeleteExpense = async (id) => {
    try {
      await expenseAPI.delete(id)
      setSuccess('Expense deleted successfully!')
      fetchExpenses()
    } catch (err) {
      setError('Failed to delete expense')
    }
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setIsAuthenticated(false)
      navigate('/')
    }
  }

const totalSpent = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
  
  const categoryTotals = CATEGORIES.map((cat) => ({
    name: cat,
    value: expenses
      .filter((exp) => exp.category === cat)
      .reduce((sum, exp) => sum + (exp.amount || 0), 0),
  })).filter((item) => item.value > 0)

  // 2. THIS FIXES THE CRASH: Define the missing variables for the UI
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthExpenses = expenses.filter((exp) => {
    // Fallback to createdAt if your backend uses that instead of date
    const expDate = new Date(exp.date || exp.createdAt);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });

  const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  // Sort by newest first, then grab the top 5
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 5);

  if (loading) {
    return (
      <MainLayout user={user} onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {error && <Alert message={error} type="error" onClose={() => setError('')} />}
        {success && <Alert message={success} type="success" onClose={() => setSuccess('')} />}

        {/* Welcome & Quick Actions */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {user.name || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Here's your spending overview at a glance
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} className="inline mr-2" />
              Add Expense
            </Button>
            <Button variant="outline" onClick={() => navigate('/history')}>
              <Eye size={18} className="inline mr-2" />
              View History
            </Button>
            <Button variant="outline" onClick={() => navigate('/analytics')}>
              <TrendingUp size={18} className="inline mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-0">
            <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium">Total Spent</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {symbol}{totalSpent.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">All time</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-0">
            <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium">This Month</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {symbol}{thisMonthTotal.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{thisMonthExpenses.length} transactions</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-0">
            <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium">Total Transactions</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{expenses.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Average: {symbol}{expenses.length > 0 ? (totalSpent / expenses.length).toFixed(2) : '0.00'}</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-0">
            <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium">Top Category</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {categoryTotals[0]?.name || 'N/A'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{symbol}{(categoryTotals[0]?.value || 0).toFixed(2)}</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Expenses */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Expenses</h2>
                {expenses.length > 5 && (
                  <button
                    onClick={() => navigate('/history')}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                  >
                    View All
                  </button>
                )}
              </div>

              {recentExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No expenses yet. Start by adding one!</p>
                  <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} className="inline mr-2" />
                    Add Expense
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentExpenses.map((expense) => (
                    <div key={expense._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: categoryColors[expense.category] }}
                          ></div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{expense.category}</p>
                            {expense.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{expense.description}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(expense.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {symbol}{expense.amount.toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Category Breakdown */}
          {categoryTotals.length > 0 && (
            <Card className="bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">By Category</h2>
              <PieChartComponent data={categoryTotals} />
              <div className="mt-6 space-y-2 text-sm">
                {categoryTotals.map((cat) => (
                  <div key={cat.name} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {symbol}{cat.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Expense">
        <form onSubmit={handleAddExpense}>
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            required
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Description (optional)"
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add details..."
          />
          <Button type="submit" variant="primary" className="w-full mt-6">
            Add Expense
          </Button>
        </form>
      </Modal>
    </MainLayout>
  )
}
