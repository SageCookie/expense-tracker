import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

export default function PaginationBar({ pagination, onPageChange, onLimitChange }) {
  const { total, page, limit, pages } = pagination

  const handlePreviousPage = () => {
    if (page > 1) {
      onPageChange(page - 1)
    }
  }

  const handleNextPage = () => {
    if (page < pages) {
      onPageChange(page + 1)
    }
  }

  const handlePageSelect = (pageNum) => {
    onPageChange(pageNum)
  }

  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  // Generate page numbers to display
  const pageNumbers = []
  const maxPagesToShow = 5
  let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2))
  let endPage = Math.min(pages, startPage + maxPagesToShow - 1)

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Items count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{total}</span> items
        </div>

        {/* Center: Page numbers */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageSelect(1)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="px-2 text-gray-400">...</span>
              )}
            </>
          )}

          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageSelect(pageNum)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pageNum === page
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {pageNum}
            </button>
          ))}

          {endPage < pages && (
            <>
              {endPage < pages - 1 && (
                <span className="px-2 text-gray-400">...</span>
              )}
              <button
                onClick={() => handlePageSelect(pages)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {pages}
              </button>
            </>
          )}

          <button
            onClick={handleNextPage}
            disabled={page === pages}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Right: Items per page */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Items per page:
          </label>
          <select
            value={limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  )
}
