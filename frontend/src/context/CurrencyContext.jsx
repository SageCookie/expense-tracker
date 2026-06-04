import { createContext, useContext, useState } from 'react'

const CurrencyContext = createContext()

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
]

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('currency')
    return saved || 'INR'
  })

  const getCurrencySymbol = () => {
    const curr = CURRENCIES.find(c => c.code === currency)
    return curr?.symbol || '$'
  }

  const getCurrencyName = () => {
    const curr = CURRENCIES.find(c => c.code === currency)
    return curr?.name || 'US Dollar'
  }

  const changeCurrency = (code) => {
    if (CURRENCIES.find(c => c.code === code)) {
      setCurrency(code)
      localStorage.setItem('currency', code)
    }
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: changeCurrency, getCurrencySymbol, getCurrencyName, CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}