import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  History, 
  BarChart3,
  MoreHorizontal
} from 'lucide-react'
import { useState } from 'react'

export default function BottomNav() {
  const [showMore, setShowMore] = useState(false)

  const mainTabs = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'History', icon: History, path: '/history' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  ]

  const moreTabs = [
    { label: 'Budget', path: '/budget' },
    { label: 'Profile', path: '/profile' },
    { label: 'Settings', path: '/settings' },
  ]

  const NavTab = ({ icon: Icon, label, path }) => (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 px-4 py-3 rounded-t-lg transition-colors ${
          isActive
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
        }`
      }
      onClick={() => setShowMore(false)}
    >
      {Icon && <Icon size={20} />}
      <span className="text-xs font-medium">{label}</span>
    </NavLink>
  )

  return (
    <>
      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
        <div className="flex items-center justify-between">
          {/* Main tabs */}
          {mainTabs.map((tab) => (
            <div key={tab.path} className="flex-1">
              <NavTab {...tab} />
            </div>
          ))}

          {/* More button */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowMore(!showMore)}
              className={`flex flex-col items-center gap-1 px-4 py-3 w-full transition-colors ${
                showMore
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              <MoreHorizontal size={20} />
              <span className="text-xs font-medium">More</span>
            </button>

            {/* Dropdown menu */}
            {showMore && (
              <div className="absolute bottom-16 right-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                {moreTabs.map((tab) => (
                  <NavLink
                    key={tab.path}
                    to={tab.path}
                    onClick={() => setShowMore(false)}
                    className={({ isActive }) =>
                      `block w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    {tab.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer for mobile to account for bottom nav height */}
      <div className="h-20 md:hidden" />
    </>
  )
}
