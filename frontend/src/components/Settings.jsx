import { Globe } from 'lucide-react'
import { useCurrency } from '../context/CurrencyContext'

export default function Settings({ isOpen, onClose }) {
  const { currency, setCurrency, CURRENCIES } = useCurrency()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Currency Section */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe size={20} />
            Currency
          </h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {CURRENCIES.map((curr) => (
              <button
                key={curr.code}
                onClick={() => setCurrency(curr.code)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  currency === curr.code
                    ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{curr.code}</div>
                    <div className="text-sm opacity-75">{curr.name}</div>
                  </div>
                  <div className="text-xl font-bold">{curr.symbol}</div>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Select your preferred currency for expenses</p>
        </div>

        {/* Close Button */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-6">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}