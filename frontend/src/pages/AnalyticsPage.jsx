import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, TrendingUp, DollarSign, Calendar, Target } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/Button'
import Card from '../components/Card'
import Alert from '../components/Alert'
import { PieChartComponent, BarChartComponent, LineChartComponent } from '../components/Charts'
import { expenseAPI, authAPI } from '../services/api'
import { useCurrency } from '../context/CurrencyContext'

export default function AnalyticsPage({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const { getCurrencySymbol } = useCurrency()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const symbol = getCurrencySymbol()

  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const normalizeAnalytics = (raw) => {
    if (!raw || typeof raw !== 'object') return null

    const dailyAverages =
      typeof raw.dailyAverages === 'number'
        ? raw.dailyAverages
        : parseFloat(raw.dailyAverages) || 0

    const last90DaysTotal =
      typeof raw.last90DaysTotal === 'number'
        ? raw.last90DaysTotal
        : parseFloat(raw.last90DaysTotal) || 0

    return {
      total: Number(raw.total) || 0,
      count: Number(raw.count) || 0,
      average: Number(raw.average) || 0,
      byCategory: raw.byCategory && typeof raw.byCategory === 'object' ? raw.byCategory : {},
      monthlyTrends: Array.isArray(raw.monthlyTrends) ? raw.monthlyTrends : [],
      topCategories: Array.isArray(raw.topCategories) ? raw.topCategories : [],
      dailyAverages,
      last90DaysTotal,
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await expenseAPI.getAnalytics()
      setAnalytics(normalizeAnalytics(response.data))
      setError('')
    } catch (err) {
      setError('Failed to fetch analytics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    if (!analytics) return

    const report = `
EXPENSE ANALYTICS REPORT
Generated: ${new Date().toLocaleDateString()}
================================

SUMMARY STATISTICS
================================
Total Spending: ${symbol}${analytics.total.toFixed(2)}
Total Transactions: ${analytics.count}
Average per Transaction: ${symbol}${analytics.average.toFixed(2)}
Daily Average (Last 30 Days): ${symbol}${analytics.dailyAverages.toFixed(2)}
Last 90 Days Total: ${symbol}${analytics.last90DaysTotal.toFixed(2)}

CATEGORY BREAKDOWN
================================
${Object.entries(analytics.byCategory)
  .map(([cat, amount]) => `${cat}: ${symbol}${amount.toFixed(2)}`)
  .join('\n')}

TOP SPENDING CATEGORIES
================================
${analytics.topCategories.map((cat, idx) => `${idx + 1}. ${cat.category}: ${symbol}${cat.total.toFixed(2)}`).join('\n')}

INSIGHTS
================================
- You have recorded ${analytics.count} expenses
- Your highest spending category is ${analytics.topCategories[0]?.category || 'N/A'}
- Average daily spending (last 30 days): ${symbol}${analytics.dailyAverages.toFixed(2)}
- Last 90 days spending: ${symbol}${analytics.last90DaysTotal.toFixed(2)}
    `

    const blob = new Blob([report], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expense-report-${new Date().toISOString().split('T')[0]}.txt`
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

  if (loading) {
    return (
      <MainLayout user={user} onLogout={handleLogout}>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-center text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </MainLayout>
    )
  }

  if (!analytics || analytics.count === 0) {
    return (
      <MainLayout user={user} onLogout={handleLogout}>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {error && <Alert message={error} type="error" onClose={() => setError('')} />}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">Detailed insights into your spending patterns</p>
          </div>
          <Card className="bg-white dark:bg-gray-800 text-center py-12">
            <TrendingUp size={48} className="mx-auto text-indigo-400 mb-4 opacity-60" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No expenses yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Add your first expense from the dashboard to unlock charts, trends, and spending insights here.
            </p>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Add an expense
            </Button>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const categoryData = Object.entries(analytics.byCategory)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({
      name: category,
      value: Math.round(amount * 100) / 100,
    }))

  const monthlyData = analytics.monthlyTrends.map((item) => ({
    month: item.month,
    total: item.total,
  }))

  const topCategoriesData = analytics.topCategories
    .filter((cat) => cat.total > 0)
    .map((cat) => ({
      name: cat.category,
      total: cat.total,
    }))

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {error && <Alert message={error} type="error" onClose={() => setError('')} />}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Detailed insights into your spending patterns</p>
        </div>

        {/* Export Button */}
        <div className="mb-6">
          <Button variant="outline" onClick={handleExportReport}>
            <Download size={18} className="inline mr-2" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Spending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {symbol}
                  {analytics.total.toFixed(2)}
                </p>
              </div>
              <DollarSign size={32} className="text-blue-600 dark:text-blue-400 opacity-50" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{analytics.count}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total records</p>
              </div>
              <Target size={32} className="text-purple-600 dark:text-purple-400 opacity-50" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Average</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {symbol}
                  {analytics.average.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Per transaction</p>
              </div>
              <TrendingUp size={32} className="text-green-600 dark:text-green-400 opacity-50" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Last 30 Days</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {symbol}
                  {analytics.dailyAverages.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Daily average</p>
              </div>
              <Calendar size={32} className="text-orange-600 dark:text-orange-400 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Breakdown */}
          <Card className="bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h2>
            {categoryData.length > 0 ? (
              <PieChartComponent data={categoryData} symbol={symbol} />
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400 py-8">No data available</p>
            )}
          </Card>

          {/* Top Categories */}
          <Card className="bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Spending Categories</h2>
            {topCategoriesData.length > 0 ? (
              <BarChartComponent data={topCategoriesData} dataKey="total" fill="#6366f1" />
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400 py-8">No data available</p>
            )}
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card className="bg-white dark:bg-gray-800 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Spending Trends</h2>
          {monthlyData.length > 0 ? (
            <LineChartComponent data={monthlyData} dataKey="total" stroke="#6366f1" />
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">No data available</p>
          )}
        </Card>

        {/* Insights */}
        <Card className="bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Insights</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700 dark:text-gray-300">
                You have recorded <strong>{analytics.count}</strong> expenses across {Object.values(analytics.byCategory).filter((v) => v > 0).length} categories.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700 dark:text-gray-300">
                Your highest spending category is <strong>{analytics.topCategories[0]?.category || 'N/A'}</strong> with {symbol}
                {analytics.topCategories[0]?.total.toFixed(2) || '0.00'}.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700 dark:text-gray-300">
                Average daily spending in the last 30 days is <strong>{symbol}{analytics.dailyAverages.toFixed(2)}</strong>.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700 dark:text-gray-300">
                You spent <strong>{symbol}{analytics.last90DaysTotal.toFixed(2)}</strong> in the last 90 days.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
