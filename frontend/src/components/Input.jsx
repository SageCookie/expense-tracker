import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Input({ label, type = 'text', error, icon: Icon, ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = showPassword ? 'text' : type

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-3 text-gray-400" size={20} />}
        <input
          type={inputType}
          className={`w-full px-4 py-2 ${Icon ? 'pl-10' : ''} border rounded-lg focus:outline-none transition-colors ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-primary'
          }`}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}