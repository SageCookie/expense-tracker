import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import Input from '../components/Input'
import { expenseAPI, authAPI } from '../services/api'
import { useCurrency } from '../context/CurrencyContext'

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Bills', 'Other']

export default function BudgetPage({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const { getCurrencySymbol } = useCurrency()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const symbol = getCurrencySymbol()

  const [budgets, setBudgets] = useState({
    Food: 0,
    Transport: 0,
    Entertainment: 0,
    Bills: 0,
    Other: 0,
  })
  const [expenses, setExpenses] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [budgetAmount, setBudgetAmount] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const savedBudgets = localStorage.getItem('budgets')
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets))
    }
  }, [])

  const fetchData = async () => {
    try {
      const response = await expenseAPI.getAll({ limit: 1000 })
      const expensesData = response.data?.expenses ?? response.data ?? []
      setExpenses(Array.isArray(expensesData) ? expensesData : [])
    } catch (err) {
      setError('Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBudget = (e) => {
    e.preventDefault()
    if (!editingCategory || !budgetAmount) return

    const updatedBudgets = {
      ...budgets,
      [editingCategory]: parseFloat(budgetAmount),
    }
    setBudgets(updatedBudgets)
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets))
    setSuccess(`Budget for ${editingCategory} set successfully!`)
    setIsModalOpen(false)
    setBudgetAmount('')
    setEditingCategory(null)
  }

  const handleDeleteBudget = (category) => {
    if (window.confirm(`Delete budget for ${category}?`)) {
      const updatedBudgets = {
        ...budgets,
        [category]: 0,
      }
      setBudgets(updatedBudgets)
      localStorage.setItem('budgets', JSON.stringify(updatedBudgets))
      setSuccess(`Budget for ${category} deleted!`)
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

  const getCategorySpending = (category) => {
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    return expenses
      .filter((exp) => {
        const expDate = new Date(exp.date)
        return (
          exp.category === category &&
          expDate.getMonth() === thisMonth &&
          expDate.getFullYear() === thisYear
        )
      })
      .reduce((sum, exp) => sum + exp.amount, 0)
  }

  const calculateProgress = (category) => {
    if (budgets[category] === 0) return 0
    return Math.min((getCategorySpending(category) / budgets[category]) * 100, 100)
  }

  const isExceeded = (category) => getCategorySpending(category) > budgets[category] && budgets[category] > 0

  if (loading) {
    return (
      <MainLayout user={user} onLogout={handleLogout}>
        <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading budgets...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Budget Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Set spending limits for each category and track your progress</p>
        </div>

        <div className="space-y-4">
          {CATEGORIES.map((category) => {
            const budget = budgets[category]
            const spent = getCategorySpending(category)
            const progress = calculateProgress(category)
            const exceeded = isExceeded(category)

            return (
              <Card key={category} className={`bg-white dark:bg-gray-800 ${exceeded ? 'border-l-4 border-red-500' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {budget === 0 ? 'No budget set' : `Budget: ${symbol}${budget.toFixed(2)}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCategory(category)
                        setBudgetAmount(budget?.toString() || '')
                        setIsModalOpen(true)
                      }}
                    >
                      {budget === 0 ? 'Set' : 'Edit'}
                    </Button>
                    {budget > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBudget(category)}
                        className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>

                {budget > 0 && (
                  <>
                    <div className="mb-2">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Spent: {symbol}{spent.toFixed(2)}
                        </span>
                        <span className={`text-sm font-medium ${exceeded ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            exceeded ? 'bg-red-500' : progress > 75 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {exceeded && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 dark:bg-red-900 rounded">
                        <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                        <span className="text-sm text-red-600 dark:text-red-400">
                          Budget exceeded by {symbol}{(spent - budget).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </Card>
            )
          })}
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> Set budgets for each spending category to keep track of your expenses and avoid overspending.
          </p>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCategory(null)
          setBudgetAmount('')
        }}
        title={`Set Budget for ${editingCategory}`}
      >
        <form onSubmit={handleSaveBudget}>
          <Input
            label="Monthly Budget Amount"
            type="number"
            step="0.01"
            min="0"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            placeholder="0.00"
            required
          />
          <Button type="submit" variant="primary" className="w-full mt-6">
            Save Budget
          </Button>
        </form>
      </Modal>
    </MainLayout>
  )
}
