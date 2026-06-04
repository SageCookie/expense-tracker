import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function DashboardNavbar({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Left - Logo & Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">H</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:inline">Hisaab</h1>
        </div>

        {/* Center - User greeting (hidden on mobile) */}
        <div className="hidden md:block flex-1 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, <span className="font-medium">{user.name}</span></p>
        </div>

        {/* Right - Action buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium hidden sm:inline">{user.name}</span>
          
          {/* Hamburger menu button - mobile only */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <Menu size={20} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border-2 border-primary text-primary hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
