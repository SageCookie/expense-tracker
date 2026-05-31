import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import Alert from '../components/Alert'
import { authAPI } from '../services/api'

export default function Login({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authAPI.login(formData)
      localStorage.setItem('token', response.data.token || 'auth-token')
      localStorage.setItem('user', JSON.stringify(response.data))
      setIsAuthenticated(true)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Expense Tracker</h1>
          <p className="text-gray-600 mt-2">Manage your money wisely</p>
        </div>

        {error && <Alert message={error} type="error" onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
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
          <Button type="submit" variant="primary" className="w-full mt-6" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  )
}