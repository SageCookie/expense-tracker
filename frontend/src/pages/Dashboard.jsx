import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Plus, Trash2 } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import Input from '../components/Input'
import { PieChartComponent } from '../components/Charts'
import { expenseAPI, authAPI } from '../services/api'

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
  const [expenses, setExpenses] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ amount: '', category: 'Food', description: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

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
      navigate('/login')
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">{user.name}</span>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="text-gray-600 text-sm font-medium">Total Spent</h3>
            <p className="text-3xl font-bold text-primary mt-2">${totalSpent.toFixed(2)}</p>
          </Card>
          <Card>
            <h3 className="text-gray-600 text-sm font-medium">Expenses</h3>
            <p className="text-3xl font-bold text-secondary mt-2">{expenses.length}</p>
          </Card>
          <Card>
            <h3 className="text-gray-600 text-sm font-medium">Average Expense</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              ${expenses.length > 0 ? (totalSpent / expenses.length).toFixed(2) : '0.00'}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Expenses</h2>
                <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                  <Plus size={18} className="inline mr-2" />
                  Add Expense
                </Button>
              </div>

              {expenses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No expenses yet. Start by adding one!</p>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: categoryColors[expense.category] }}
                          ></div>
                          <div>
                            <p className="font-medium text-gray-900">{expense.category}</p>
                            {expense.description && <p className="text-sm text-gray-600">{expense.description}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold text-gray-900">${expense.amount.toFixed(2)}</p>
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="text-red-500 hover:text-red-700 transition"
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

          {categoryTotals.length > 0 && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">By Category</h2>
              <PieChartComponent data={categoryTotals} />
            </Card>
          )}
        </div>
      </main>

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
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
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
    </div>
  )
}