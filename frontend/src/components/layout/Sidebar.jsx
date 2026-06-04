import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  History, 
  BarChart3, 
  Wallet, 
  User, 
  Settings,
} from 'lucide-react'

export default function Sidebar() {
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'History', icon: History, path: '/history' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  ]

  const secondaryItems = [
    { label: 'Budget', icon: Wallet, path: '/budget' },
    { label: 'Profile', icon: User, path: '/profile' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ]

  const NavItemComponent = ({ icon: Icon, label, path }) => (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 font-medium'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`
      }
      title={label}
    >
      <Icon size={20} />
      <span className="text-sm font-medium hidden lg:inline">{label}</span>
    </NavLink>
  )

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed left-0 top-0 pt-20">
      {/* Primary Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Main
        </p>
        {navItems.map((item) => (
          <NavItemComponent key={item.path} {...item} />
        ))}
      </nav>

      {/* Secondary Navigation */}
      <nav className="px-4 py-6 space-y-2 border-t border-gray-200 dark:border-gray-800">
        <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Account
        </p>
        {secondaryItems.map((item) => (
          <NavItemComponent key={item.path} {...item} />
        ))}
      </nav>
    </aside>
  )
}
