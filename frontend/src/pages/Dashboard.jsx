import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Plus, Trash2, Settings } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import Input from '../components/Input'
import SettingsComponent from '../components/Settings'
import { PieChartComponent } from '../components/Charts'
import { expenseAPI, authAPI } from '../services/api'
import { useCurrency } from '../context/CurrencyContext'

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Bills', 'Other']
const categoryColors = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Entertainment: '#ec4899',
  Bills: '#6366f1',
  Other: '#10b981',
}

export default function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const { getCurrencySymbol } = useCurrency()
  const [expenses, setExpenses] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
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
      setExpenses(response.data || [])
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

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const categoryTotals = CATEGORIES.map((cat) => ({
    name: cat,
    value: expenses
      .filter((exp) => exp.category === cat)
      .reduce((sum, exp) => sum + exp.amount, 0),
  })).filter((item) => item.value > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading expenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hisaab</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 dark:text-gray-300 font-medium">{user.name}</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Settings"
            >
              <Settings size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={18} className="inline mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <Alert message={error} type="error" onClose={() => setError('')} />}
        {success && <Alert message={success} type="success" onClose={() => setSuccess('')} />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Spent</h3>
            <p className="text-3xl font-bold text-primary mt-2">
              {symbol}{totalSpent.toFixed(2)}
            </p>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Expenses</h3>
            <p className="text-3xl font-bold text-secondary mt-2">{expenses.length}</p>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Average Expense</h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              {symbol}{expenses.length > 0 ? (totalSpent / expenses.length).toFixed(2) : '0.00'}
            </p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Expenses List */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Expenses</h2>
                <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                  <Plus size={18} className="inline mr-2" />
                  Add Expense
                </Button>
              </div>

              {expenses.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No expenses yet. Start by adding one!</p>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: categoryColors[expense.category] }}
                          ></div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{expense.category}</p>
                            {expense.description && <p className="text-sm text-gray-600 dark:text-gray-400">{expense.description}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{symbol}{expense.amount.toFixed(2)}</p>
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

          {/* Charts */}
          {categoryTotals.length > 0 && (
            <Card className="bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">By Category</h2>
              <PieChartComponent data={categoryTotals} />
            </Card>
          )}
        </div>
      </main>

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

      {/* Settings Modal */}
      <SettingsComponent isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}