import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Calendar, TrendingUp, Package } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/Button'
import Card from '../components/Card'
import Alert from '../components/Alert'
import { expenseAPI, authAPI } from '../services/api'
import { useCurrency } from '../context/CurrencyContext'

export default function ProfilePage({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const { getCurrencySymbol } = useCurrency()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const symbol = getCurrencySymbol()

  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getAll({ limit: 10000 })
      const expensesData = response.data?.expenses ?? response.data ?? []
      setExpenses(Array.isArray(expensesData) ? expensesData : [])
    } catch (err) {
      setError('Failed to fetch expenses')
    } finally {
      setLoading(false)
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

  // Calculate statistics
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const avgTransaction = expenses.length > 0 ? totalSpent / expenses.length : 0
  const firstExpenseDate = expenses.length > 0 ? new Date(expenses[expenses.length - 1].date) : null
  const memberSince = firstExpenseDate ? firstExpenseDate.toLocaleDateString() : 'No expenses yet'

  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const monthlySpending = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date)
      return expDate.getMonth() === thisMonth && expDate.getFullYear() === thisYear
    })
    .reduce((sum, exp) => sum + exp.amount, 0)

  const highestSpendingCategory = {
    category: 'N/A',
    amount: 0,
  }
  const categoryTotals = {}
  expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount
  })
  Object.entries(categoryTotals).forEach(([cat, amount]) => {
    if (amount > highestSpendingCategory.amount) {
      highestSpendingCategory.category = cat
      highestSpendingCategory.amount = amount
    }
  })

  if (loading) {
    return (
      <MainLayout user={user} onLogout={handleLogout}>
        <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {error && <Alert message={error} type="error" onClose={() => setError('')} />}
        {success && <Alert message={success} type="success" onClose={() => setSuccess('')} />}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Your account information and lifetime statistics</p>
        </div>

        {/* Profile Card */}
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900 dark:to-blue-900 border-0 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center">
              <User size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name || 'User'}</h2>
              <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mt-2">
                <Mail size={16} />
                {user.email || 'No email'}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/settings')}>
              Edit Settings
            </Button>
          </div>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <Package size={20} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{expenses.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">All time records</p>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {symbol}
              {totalSpent.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Lifetime total</p>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp size={20} className="text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Transaction</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {symbol}
              {avgTransaction.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Per transaction</p>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <Calendar size={20} className="text-orange-600 dark:text-orange-400" />
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {symbol}
              {monthlySpending.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Current month</p>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                <p className="text-gray-900 dark:text-white font-medium">{user.name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="text-gray-900 dark:text-white font-medium">{user.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                <p className="text-gray-900 dark:text-white font-medium">{memberSince}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Highest Category</p>
                <p className="text-gray-900 dark:text-white font-medium">{highestSpendingCategory.category}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {symbol}
                  {highestSpendingCategory.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Categories</p>
                <p className="text-gray-900 dark:text-white font-medium">{Object.keys(categoryTotals).filter((k) => categoryTotals[k] > 0).length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Monthly</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {symbol}
                  {(totalSpent / (Math.max(1, Math.ceil(expenses.length / 30)))).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
