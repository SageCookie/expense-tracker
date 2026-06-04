import { Edit2, Trash2, Download, ArrowUpDown } from 'lucide-react'
import Button from './Button'

const categoryColors = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Entertainment: '#ec4899',
  Bills: '#6366f1',
  Other: '#10b981',
}

export default function TransactionTable({
  expenses,
  onEdit,
  onDelete,
  onSort,
  sortConfig,
  symbol,
  loading,
}) {
  const handleSort = (field) => {
    const newOrder =
      sortConfig.key === field && sortConfig.order === 'desc' ? 'asc' : 'desc'
    onSort(field, newOrder)
  }

  const SortHeader = ({ field, label }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-gray-900 dark:text-white font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
    >
      {label}
      <ArrowUpDown
        size={14}
        className={`transition-transform ${
          sortConfig.key === field
            ? sortConfig.order === 'desc'
              ? 'rotate-180'
              : ''
            : 'opacity-30'
        }`}
      />
    </button>
  )

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No transactions found. Try adjusting your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left">
                <SortHeader field="date" label="Date" />
              </th>
              <th className="px-6 py-4 text-left">
                <SortHeader field="category" label="Category" />
              </th>
              <th className="px-6 py-4 text-left">Description</th>
              <th className="px-6 py-4 text-right">
                <SortHeader field="amount" label="Amount" />
              </th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {expenses.map((expense) => (
              <tr
                key={expense._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-6 py-4 text-gray-900 dark:text-white">
                  {new Date(expense.date).toLocaleDateString('en-IN')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoryColors[expense.category] }}
                    ></div>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {expense.category}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {expense.description || '-'}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                  {symbol}
                  {expense.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(expense)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(expense._id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 p-4">
        {expenses.map((expense) => (
          <div
            key={expense._id}
            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: categoryColors[expense.category] }}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {expense.category}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(expense.date).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              <p className="font-bold text-gray-900 dark:text-white whitespace-nowrap ml-2">
                {symbol}
                {expense.amount.toFixed(2)}
              </p>
            </div>

            {expense.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {expense.description}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(expense)}
                className="flex-1 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => onDelete(expense._id)}
                className="flex-1 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
