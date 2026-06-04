import { X } from 'lucide-react'
import Button from './Button'
import Input from './Input'

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Bills', 'Other']
const DATE_RANGES = [
  { label: 'This Week', value: 'thisWeek' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last 3 Months', value: 'last3Months' },
  { label: 'Last 6 Months', value: 'last6Months' },
  { label: 'Last Year', value: 'lastYear' },
  { label: 'All Time', value: 'allTime' },
  { label: 'Custom', value: 'custom' },
]

export default function FilterPanel({ filters, onFiltersChange, onClearFilters }) {
  const handleDateRangeChange = (range) => {
    onFiltersChange({ ...filters, dateRange: range, showCustomDates: range === 'custom' })
  }

  const handleCategoryChange = (e) => {
    onFiltersChange({ ...filters, category: e.target.value })
  }

  const handleMinAmountChange = (e) => {
    const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
    onFiltersChange({ ...filters, minAmount: value })
  }

  const handleMaxAmountChange = (e) => {
    const value = e.target.value === '' ? Infinity : parseFloat(e.target.value)
    onFiltersChange({ ...filters, maxAmount: value })
  }

  const handleCustomStartDate = (e) => {
    onFiltersChange({ ...filters, customStartDate: e.target.value })
  }

  const handleCustomEndDate = (e) => {
    onFiltersChange({ ...filters, customEndDate: e.target.value })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            {DATE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Min Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Min Amount (₹)
          </label>
          <input
            type="number"
            value={filters.minAmount === 0 ? '' : filters.minAmount}
            onChange={handleMinAmountChange}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* Max Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Amount (₹)
          </label>
          <input
            type="number"
            value={filters.maxAmount === Infinity ? '' : filters.maxAmount}
            onChange={handleMaxAmountChange}
            placeholder="No limit"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Custom Date Range */}
      {filters.showCustomDates && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.customStartDate || ''}
              onChange={handleCustomStartDate}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.customEndDate || ''}
              onChange={handleCustomEndDate}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  )
}
