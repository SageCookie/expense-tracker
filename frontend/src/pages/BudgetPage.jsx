import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, AlertCircle, FolderPlus } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import Input from '../components/Input'
import { expenseAPI, authAPI } from '../services/api'
import { useCurrency } from '../context/CurrencyContext'
import {
  getAllCategories,
  addCustomCategory,
  removeCustomCategory,
  isCustomCategory,
  getCategoryColor,
} from '../utils/categories'

function loadBudgets(categories) {
  const saved = localStorage.getItem('budgets')
  const parsed = saved ? JSON.parse(saved) : {}
  const budgets = {}
  categories.forEach((cat) => {
    budgets[cat] = parsed[cat] ?? 0
  })
  return budgets
}

export default function BudgetPage({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const { getCurrencySymbol } = useCurrency()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const symbol = getCurrencySymbol()

  const [categories, setCategories] = useState(getAllCategories)
  const [budgets, setBudgets] = useState(() => loadBudgets(getAllCategories()))
  const [expenses, setExpenses] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [budgetAmount, setBudgetAmount] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const syncCategoriesAndBudgets = (nextCategories) => {
    setCategories(nextCategories)
    setBudgets((prev) => {
      const next = loadBudgets(nextCategories)
      nextCategories.forEach((cat) => {
        if (prev[cat] !== undefined) next[cat] = prev[cat]
      })
      localStorage.setItem('budgets', JSON.stringify(next))
      return next
    })
  }

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

  const handleAddCategory = (e) => {
    e.preventDefault()
    setError('')
    const result = addCustomCategory(newCategoryName)
    if (!result.ok) {
      setError(result.error)
      return
    }
    const nextCategories = getAllCategories()
    syncCategoriesAndBudgets(nextCategories)
    setSuccess(`Category "${result.name}" created!`)
    setNewCategoryName('')
    setIsCategoryModalOpen(false)
  }

  const handleRemoveCategory = (category) => {
    if (!isCustomCategory(category)) return
    if (!window.confirm(`Remove category "${category}"? Its budget will be cleared.`)) return

    removeCustomCategory(category)
    const nextCategories = getAllCategories()
    const updatedBudgets = { ...budgets }
    delete updatedBudgets[category]
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets))
    syncCategoriesAndBudgets(nextCategories)
    setSuccess(`Category "${category}" removed`)
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

        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Budget Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set spending limits for each category and track your progress
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsCategoryModalOpen(true)}>
            <FolderPlus size={18} className="inline mr-2" />
            New Category
          </Button>
        </div>

        <div className="space-y-4">
          {categories.map((category) => {
            const budget = budgets[category] ?? 0
            const spent = getCategorySpending(category)
            const progress = calculateProgress(category)
            const exceeded = isExceeded(category)
            const custom = isCustomCategory(category)

            return (
              <Card key={category} className={`bg-white dark:bg-gray-800 ${exceeded ? 'border-l-4 border-red-500' : ''}`}>
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category}</h3>
                        {custom && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {budget === 0 ? 'No budget set' : `Budget: ${symbol}${budget.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
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
                        title="Clear budget"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                    {custom && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveCategory(category)}
                        className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                        title="Remove category"
                      >
                        Remove
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
                        />
                      </div>
                    </div>

                    {exceeded && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 dark:bg-red-900 rounded">
                        <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0" />
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
            <strong>Tip:</strong> Use <strong>New Category</strong> for spending types like Groceries or Health. Custom categories appear when adding expenses and in filters.
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

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false)
          setNewCategoryName('')
        }}
        title="Create New Category"
      >
        <form onSubmit={handleAddCategory}>
          <Input
            label="Category Name"
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g. Groceries, Health, Education"
            maxLength={30}
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
            Up to 30 characters. You can set a monthly budget after creating it.
          </p>
          <Button type="submit" variant="primary" className="w-full">
            <Plus size={18} className="inline mr-2" />
            Create Category
          </Button>
        </form>
      </Modal>
    </MainLayout>
  )
}
