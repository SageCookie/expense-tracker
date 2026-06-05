import { Edit2, Trash2, ArrowUpDown } from 'lucide-react'
import { getCategoryColor } from '../utils/categories'

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

  const SortHeader = ({ field, label, className = '' }) => (
    <button
      type="button"
      onClick={() => handleSort(field)}
      className={`inline-flex items-center gap-1 text-left text-gray-900 dark:text-white font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${className}`}
    >
      {label}
      <ArrowUpDown
        size={14}
        className={`flex-shrink-0 transition-transform ${
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
        <table className="w-full table-fixed min-w-[720px]">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[18%]" />
            <col className="w-[38%]" />
            <col className="w-[14%]" />
            <col className="w-[18%]" />
          </colgroup>
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                <SortHeader field="date" label="Date" />
              </th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                <SortHeader field="category" label="Category" />
              </th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Description
              </th>
              <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                <span className="inline-flex justify-end w-full">
                  <SortHeader field="amount" label="Amount" />
                </span>
              </th>
              <th className="px-4 lg:px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {expenses.map((expense) => (
              <tr
                key={expense._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                  {new Date(expense.date).toLocaleDateString('en-IN')}
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getCategoryColor(expense.category) }}
                    />
                    <span className="text-sm text-gray-900 dark:text-white font-medium truncate">
                      {expense.category}
                    </span>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 dark:text-gray-400 truncate">
                  {expense.description || '-'}
                </td>
                <td className="px-4 lg:px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-white tabular-nums whitespace-nowrap">
                  {symbol}{expense.amount.toFixed(2)}
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <div className="flex items-center justify-center gap-1">
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
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(expense.category) }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {expense.category}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(expense.date).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              <p className="font-bold text-gray-900 dark:text-white whitespace-nowrap ml-2 tabular-nums text-sm">
                {symbol}{expense.amount.toFixed(2)}
              </p>
            </div>

            {expense.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
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
