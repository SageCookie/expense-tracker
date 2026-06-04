import DashboardNavbar from './DashboardNavbar'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function MainLayout({ children, user, onLogout }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Navbar */}
      <DashboardNavbar user={user} onLogout={onLogout} />

      <div className="flex flex-1">
        {/* Sidebar - Desktop only */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  )
}
