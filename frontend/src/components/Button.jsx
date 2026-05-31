export default function Button({ children, className = '', variant = 'primary', size = 'md', ...props }) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-indigo-700 active:scale-95',
    secondary: 'bg-secondary text-white hover:bg-pink-600 active:scale-95',
    outline: 'border-2 border-primary text-primary hover:bg-indigo-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}