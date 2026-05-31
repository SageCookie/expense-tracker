export default function Alert({ message, type = 'info', onClose }) {
  const bgColor = {
    success: 'bg-green-100',
    error: 'bg-red-100',
    warning: 'bg-yellow-100',
    info: 'bg-blue-100',
  }
  
  const textColor = {
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-yellow-700',
    info: 'text-blue-700',
  }
  
  const borderColor = {
    success: 'border-green-300',
    error: 'border-red-300',
    warning: 'border-yellow-300',
    info: 'border-blue-300',
  }

  return (
    <div className={`${bgColor[type]} ${textColor[type]} px-4 py-3 rounded border ${borderColor[type]} mb-4 flex items-center justify-between`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 font-bold text-lg hover:opacity-70">
          ×
        </button>
      )}
    </div>
  )
}