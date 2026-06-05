export const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Bills', 'Other']

const CUSTOM_STORAGE_KEY = 'customCategories'

const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Entertainment: '#ec4899',
  Bills: '#6366f1',
  Other: '#10b981',
}

const FALLBACK_COLORS = ['#8b5cf6', '#14b8a6', '#f97316', '#06b6d4', '#84cc16']

export function getCustomCategories() {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function getAllCategories() {
  const custom = getCustomCategories()
  const merged = [...DEFAULT_CATEGORIES]
  custom.forEach((name) => {
    if (!merged.some((c) => c.toLowerCase() === name.toLowerCase())) {
      merged.push(name)
    }
  })
  return merged
}

export function addCustomCategory(name) {
  const trimmed = name.trim()
  if (!trimmed) {
    return { ok: false, error: 'Category name is required' }
  }
  if (trimmed.length > 30) {
    return { ok: false, error: 'Category name must be 30 characters or less' }
  }
  if (getAllCategories().some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
    return { ok: false, error: 'This category already exists' }
  }
  const custom = getCustomCategories()
  custom.push(trimmed)
  localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(custom))
  return { ok: true, name: trimmed }
}

export function removeCustomCategory(name) {
  if (DEFAULT_CATEGORIES.includes(name)) {
    return { ok: false, error: 'Default categories cannot be removed' }
  }
  const custom = getCustomCategories().filter((c) => c !== name)
  localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(custom))
  return { ok: true }
}

export function isCustomCategory(name) {
  return getCustomCategories().includes(name)
}

export function getCategoryColor(category) {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category]
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length]
}
