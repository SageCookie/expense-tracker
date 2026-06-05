import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Trash2, Bell, Eye, EyeOff, Globe } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import Input from '../components/Input'
import { authAPI } from '../services/api'
import { useCurrency } from '../context/CurrencyContext'

export default function SettingsPage({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { currency, setCurrency, CURRENCIES } = useCurrency()

  const [activeTab, setActiveTab] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteCurrentPassword, setDeleteCurrentPassword] = useState('')
  const [deleteVerificationCode, setDeleteVerificationCode] = useState('')
  const [deleteStep, setDeleteStep] = useState('form')
  const [passwordStep, setPasswordStep] = useState('form')
  const [passwordVerificationCode, setPasswordVerificationCode] = useState('')
  const [verificationEmail, setVerificationEmail] = useState(user.email || '')

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

  const handleRequestPasswordVerification = async (e) => {
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
      const response = await authAPI.requestPasswordVerification({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setVerificationEmail(response.data.email || user.email)
      setPasswordStep('verify')
      setSuccess(response.data.message || 'Verification code sent to your email')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification email')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPasswordChange = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!passwordVerificationCode.trim()) {
      setError('Enter the verification code from your email')
      return
    }

    try {
      setLoading(true)
      await authAPI.confirmPasswordChange({ code: passwordVerificationCode.trim() })
      setSuccess('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordVerificationCode('')
      setPasswordStep('form')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm password change')
    } finally {
      setLoading(false)
    }
  }

  const resetPasswordFlow = () => {
    setPasswordStep('form')
    setPasswordVerificationCode('')
  }

  const handleRequestDeleteVerification = async () => {
    setError('')
    setSuccess('')

    if (!deleteCurrentPassword) {
      setError('Enter your current password to continue')
      return
    }

    try {
      setLoading(true)
      const response = await authAPI.requestDeleteVerification({
        currentPassword: deleteCurrentPassword,
      })
      setVerificationEmail(response.data.email || user.email)
      setDeleteStep('verify')
      setSuccess(response.data.message || 'Verification code sent to your email')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification email')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDeleteAccount = async () => {
    setError('')
    setSuccess('')

    if (deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    if (!deleteVerificationCode.trim()) {
      setError('Enter the verification code from your email')
      return
    }

    try {
      setLoading(true)
      await authAPI.confirmAccountDeletion({ code: deleteVerificationCode.trim() })
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

  const resetDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDeleteConfirmText('')
    setDeleteCurrentPassword('')
    setDeleteVerificationCode('')
    setDeleteStep('form')
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
            onClick={() => setActiveTab('currency')}
            className={`pb-3 px-1 font-medium border-b-2 transition-colors ${
              activeTab === 'currency'
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Globe size={18} className="inline mr-2" />
            Currency
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Change Password</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {passwordStep === 'form'
                ? 'We will email a verification code to confirm this change.'
                : `Enter the 6-digit code sent to ${verificationEmail}`}
            </p>

            {passwordStep === 'form' ? (
            <form onSubmit={handleRequestPasswordVerification} className="space-y-4">
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
                {loading ? 'Sending...' : 'Send Verification Email'}
              </Button>
            </form>
            ) : (
            <form onSubmit={handleConfirmPasswordChange} className="space-y-4">
              <Input
                label="Verification Code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={passwordVerificationCode}
                onChange={(e) => setPasswordVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit code"
                required
              />
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={resetPasswordFlow} className="flex-1">
                  Back
                </Button>
                <Button type="submit" variant="primary" disabled={loading} className="flex-1">
                  {loading ? 'Confirming...' : 'Confirm Password Change'}
                </Button>
              </div>
            </form>
            )}
          </Card>
        )}

        {/* Currency Tab */}
        {activeTab === 'currency' && (
          <Card className="bg-white dark:bg-gray-800 max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Globe size={20} />
              Display Currency
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Choose the currency used for amounts across the dashboard, history, and analytics.
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => {
                    setCurrency(curr.code)
                    setSuccess(`Currency set to ${curr.code}`)
                  }}
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
        onClose={resetDeleteModal}
        title="Delete Account"
      >
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg mb-4">
          <p className="text-red-800 dark:text-red-200 text-sm">
            This will permanently delete your account and all expense data. We will email a verification code first.
          </p>
        </div>

        {deleteStep === 'form' ? (
          <>
            <Input
              label="Current Password"
              type="password"
              value={deleteCurrentPassword}
              onChange={(e) => setDeleteCurrentPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={resetDeleteModal} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleRequestDeleteVerification}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Sending...' : 'Send Verification Email'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter the code sent to <strong>{verificationEmail}</strong>, then type DELETE to confirm.
            </p>
            <Input
              label="Verification Code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={deleteVerificationCode}
              onChange={(e) => setDeleteVerificationCode(e.target.value.replace(/\D/g, ''))}
              placeholder="6-digit code"
            />
            <div className="mt-4">
              <Input
                label='Type "DELETE" to confirm'
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteStep('form')
                  setDeleteVerificationCode('')
                  setDeleteConfirmText('')
                }}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmDeleteAccount}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </MainLayout>
  )
}
