import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import Alert from '../components/Alert'
import Navbar from '../components/Navbar'
import { authAPI } from '../services/api'

export default function Register({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [verificationCode, setVerificationCode] = useState('')
  const [step, setStep] = useState('form')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const sendVerificationEmail = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await authAPI.register(formData)
      setRegisteredEmail(response.data.email || formData.email)
      setStep('verify')
      setSuccess(response.data.message || 'Verification code sent to your email')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestVerification = async (e) => {
    e.preventDefault()
    await sendVerificationEmail()
  }

  const handleConfirmRegistration = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!verificationCode.trim()) {
      setError('Enter the verification code from your email')
      return
    }

    setLoading(true)
    try {
      const response = await authAPI.confirmRegistration({
        email: registeredEmail || formData.email,
        code: verificationCode.trim(),
      })
      localStorage.setItem('token', response.data.token || 'auth-token')
      localStorage.setItem('user', JSON.stringify(response.data))
      setIsAuthenticated(true)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToForm = () => {
    setStep('form')
    setVerificationCode('')
    setSuccess('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Navbar />
      <div className="w-full max-w-md mt-20">
        <Card className="shadow-2xl bg-white dark:bg-gray-800 border-0">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">H</div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">Hisaab</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {step === 'form'
                ? 'Create your account to get started'
                : `Enter the code sent to ${registeredEmail}`}
            </p>
          </div>

          {error && <Alert message={error} type="error" onClose={() => setError('')} />}
          {success && <Alert message={success} type="success" onClose={() => setSuccess('')} />}

          {step === 'form' ? (
            <form onSubmit={handleRequestVerification}>
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                icon={User}
                required
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                icon={Mail}
                required
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={Lock}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                We will send a verification code to confirm your email before creating your account.
              </p>
              <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
                {loading ? 'Sending code...' : 'Send Verification Email'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleConfirmRegistration}>
              <Input
                label="Verification Code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit code"
                required
              />
              <div className="flex gap-3 mt-6">
                <Button type="button" variant="outline" onClick={handleBackToForm} className="flex-1">
                  Back
                </Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                  {loading ? 'Verifying...' : 'Create Account'}
                </Button>
              </div>
              <button
                type="button"
                onClick={sendVerificationEmail}
                disabled={loading}
                className="w-full mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Resend verification code
              </button>
            </form>
          )}

          <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
