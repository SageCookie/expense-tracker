import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Trash2, Bell, Eye, EyeOff } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import Input from '../components/Input'
import { authAPI } from '../services/api'

export default function SettingsPage({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [activeTab, setActiveTab] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    monthlyReport: true,
    budgetAlerts: true,
  })

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      await authAPI.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setSuccess('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    try {
      setLoading(true)
      await authAPI.deleteAccount()
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setIsAuthenticated(false)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account')
    } finally {
      setLoading(false)
    }
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

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {error && <Alert message={error} type="error" onClose={() => setError('')} />}
        {success && <Alert message={success} type="success" onClose={() => setSuccess('')} />}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 px-1 font-medium border-b-2 transition-colors ${
              activeTab === 'password'
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Lock size={18} className="inline mr-2" />
            Password
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-3 px-1 font-medium border-b-2 transition-colors ${
              activeTab === 'preferences'
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Bell size={18} className="inline mr-2" />
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`pb-3 px-1 font-medium border-b-2 transition-colors ${
              activeTab === 'danger'
                ? 'text-red-600 dark:text-red-400 border-red-600 dark:border-red-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Trash2 size={18} className="inline mr-2" />
            Danger Zone
          </button>
        </div>

        {/* Password Tab */}
        {activeTab === 'password' && (
          <Card className="bg-white dark:bg-gray-800 max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-600 dark:text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-10 text-gray-600 dark:text-gray-400"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-10 text-gray-600 dark:text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Card>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <Card className="bg-white dark:bg-gray-800 max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive email updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Monthly Report</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get monthly spending summary</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.monthlyReport}
                  onChange={(e) => setPreferences({ ...preferences, monthlyReport: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Budget Alerts</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Alert when budget exceeds</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.budgetAlerts}
                  onChange={(e) => setPreferences({ ...preferences, budgetAlerts: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </div>

              <Button variant="primary" className="w-full mt-6">
                Save Preferences
              </Button>
            </div>
          </Card>
        )}

        {/* Danger Zone Tab */}
        {activeTab === 'danger' && (
          <Card className="bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800 max-w-2xl">
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-6">Danger Zone</h2>
            <div className="space-y-4">
              <div className="p-4 bg-red-100 dark:bg-red-800 rounded-lg">
                <p className="font-medium text-red-900 dark:text-red-100 mb-2">Delete Account</p>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-800"
                >
                  <Trash2 size={18} className="inline mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeleteConfirmText('')
        }}
        title="Delete Account"
      >
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg mb-4">
          <p className="text-red-800 dark:text-red-200 text-sm">
            ⚠️ This will permanently delete your account and all your expense data. This cannot be undone.
          </p>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          To confirm, type <strong>DELETE</strong> below:
        </p>
        <Input
          placeholder="Type DELETE"
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
        />
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteModalOpen(false)
              setDeleteConfirmText('')
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDeleteAccount}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </div>
      </Modal>
    </MainLayout>
  )
}
