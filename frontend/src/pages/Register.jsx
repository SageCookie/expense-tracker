import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import Alert from '../components/Alert'
import { authAPI } from '../services/api'

export default function Register({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
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
      const response = await authAPI.register(formData)
      localStorage.setItem('token', response.data.token || 'auth-token')
      localStorage.setItem('user', JSON.stringify(response.data))
      setIsAuthenticated(true)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Expense Tracker</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        {error && <Alert message={error} type="error" onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
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
          <Button type="submit" variant="primary" className="w-full mt-6" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </Card>
    </div>
  )
}