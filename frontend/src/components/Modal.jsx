import { useState } from 'react'
import { X } from 'lucide-react'
import Button from './Button'

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
        {title && <h2 className="text-2xl font-bold mb-4 pr-8 text-gray-900 dark:text-white">{title}</h2>}
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  )
}