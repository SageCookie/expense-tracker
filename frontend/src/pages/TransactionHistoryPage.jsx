import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Download } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import FilterPanel from '../components/FilterPanel'
import TransactionTable from '../components/TransactionTable'
import PaginationBar from '../components/PaginationBar'
import { expenseAPI, authAPI } from '../services/api'
import { useCurrency } from '../context/CurrencyContext'
import { getAllCategories } from '../utils/categories'

export default function TransactionHistoryPage({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const { getCurrencySymbol } = useCurrency()
  const categories = getAllCategories()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const symbol = getCurrencySymbol()

  // State
  const [expenses, setExpenses] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 })
  const [sortConfig, setSortConfig] = useState({ key: 'date', order: 'desc' })
  const [filters, setFilters] = useState({
    dateRange: 'thisMonth',
    category: 'all',
    minAmount: 0,
    maxAmount: Infinity,
    searchText: '',
    showCustomDates: false,
    customStartDate: '',
    customEndDate: '',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [formData, setFormData] = useState({ amount: '', category: 'Food', description: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch expenses on mount and when filters/sort/pagination change
  useEffect(() => {
    fetchExpenses()
  }, [filters, sortConfig, pagination.page, pagination.limit])

  const getDateRange = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(today)
    endDate.setHours(23, 59, 59, 999)
    let startDate = new Date(today)

    switch (filters.dateRange) {
      case 'thisWeek':
        startDate.setDate(today.getDate() - today.getDay())
        break
      case 'thisMonth':
        startDate.setDate(1)
        break
      case 'last3Months':
        startDate.setMonth(today.getMonth() - 3)
        break
      case 'last6Months':
        startDate.setMonth(today.getMonth() - 6)
        break
      case 'lastYear':
        startDate.setFullYear(today.getFullYear() - 1)
        break
      case 'allTime':
        startDate = new Date(0)
        break
      case 'custom':
        if (filters.customStartDate) {
          startDate = new Date(filters.customStartDate)
          startDate.setHours(0, 0, 0, 0)
        }
        if (filters.customEndDate) {
          endDate.setTime(new Date(filters.customEndDate).getTime())
          endDate.setHours(23, 59, 59, 999)
        }
        break
      default:
        break
    }

    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
  }

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const dateRange = getDateRange()

      const params = {
        startDate: filters.dateRange === 'allTime' ? undefined : dateRange.startDate,
        endDate: filters.dateRange === 'allTime' ? undefined : dateRange.endDate,
        category: filters.category === 'all' ? undefined : filters.category,
        minAmount: filters.minAmount === 0 ? undefined : filters.minAmount,
        maxAmount: filters.maxAmount === Infinity ? undefined : filters.maxAmount,
        search: filters.searchText || undefined,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.order,
        page: pagination.page,
        limit: pagination.limit,
      }

      // Remove undefined params
      Object.keys(params).forEach((key) => params[key] === undefined && delete params[key])

      const response = await expenseAPI.getAll(params)

      if (response.data.expenses) {
        setExpenses(response.data.expenses)
        setPagination(response.data.pagination)
      }
    } catch (err) {
      setError('Failed to fetch expenses')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingExpense) {
        // Update
        await expenseAPI.update(editingExpense._id, {
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
        })
        setSuccess('Expense updated successfully!')
        setEditingExpense(null)
      } else {
        // Create
        await expenseAPI.create({
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
        })
        setSuccess('Expense added successfully!')
      }

      setFormData({ amount: '', category: 'Food', description: '' })
      setIsModalOpen(false)
      setPagination({ ...pagination, page: 1 })
      fetchExpenses()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense')
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || '',
    })
    setIsModalOpen(true)
  }

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.delete(id)
        setSuccess('Expense deleted successfully!')
        fetchExpenses()
      } catch (err) {
        setError('Failed to delete expense')
      }
    }
  }

  const handleSort = (key, order) => {
    setSortConfig({ key, order })
    setPagination({ ...pagination, page: 1 })
  }

  const handleClearFilters = () => {
    setFilters({
      dateRange: 'thisMonth',
      category: 'all',
      minAmount: 0,
      maxAmount: Infinity,
      searchText: '',
      showCustomDates: false,
      customStartDate: '',
      customEndDate: '',
    })
    setPagination({ ...pagination, page: 1 })
  }

  const handleExportCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount']
    const rows = expenses.map((expense) => [
      new Date(expense.date).toLocaleDateString('en-IN'),
      expense.category,
      expense.description || '',
      expense.amount.toFixed(2),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {error && <Alert message={error} type="error" onClose={() => setError('')} />}
        {success && <Alert message={success} type="success" onClose={() => setSuccess('')} />}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Transaction History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View, filter, and manage all your expenses
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} className="inline mr-2" />
            Add Expense
          </Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={expenses.length === 0}>
            <Download size={18} className="inline mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
          symbol={symbol}
          categories={categories}
        />

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search by description or category..."
            value={filters.searchText}
            onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
          />
        </div>

        {/* Transaction Table */}
        <TransactionTable
          expenses={expenses}
          onEdit={handleEdit}
          onDelete={handleDeleteExpense}
          onSort={handleSort}
          sortConfig={sortConfig}
          symbol={symbol}
          loading={loading}
        />

        {/* Pagination */}
        {expenses.length > 0 && (
          <PaginationBar
            pagination={pagination}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            onLimitChange={(limit) => setPagination({ ...pagination, page: 1, limit })}
          />
        )}

        {/* Add/Edit Expense Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingExpense(null)
            setFormData({ amount: '', category: 'Food', description: '' })
          }}
          title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
        >
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary"
              >
                {categories.map((cat) => (
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
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </Button>
          </form>
        </Modal>
      </div>
    </MainLayout>
  )
}
