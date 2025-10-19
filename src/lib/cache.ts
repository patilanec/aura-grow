interface CacheEntry<T> {
  data: T
  at: number
}

const memoryCache = new Map<string, CacheEntry<any>>()

export function getCache<T>(key: string): T | null {
  // Check memory cache first
  const memoryEntry = memoryCache.get(key)
  if (memoryEntry && Date.now() - memoryEntry.at < 3600000) {
    // 1 hour TTL
    return memoryEntry.data
  }

  // Check localStorage
  try {
    const stored = localStorage.getItem(`cache:${key}`)
    if (stored) {
      const entry: CacheEntry<T> = JSON.parse(stored)
      if (Date.now() - entry.at < 3600000) {
        // 1 hour TTL
        // Restore to memory cache
        memoryCache.set(key, entry)
        return entry.data
      } else {
        // Expired, remove from localStorage
        localStorage.removeItem(`cache:${key}`)
      }
    }
  } catch (error) {
    console.warn('Failed to read from localStorage cache:', error)
  }

  return null
}

export function setCache<T>(
  key: string,
  value: T,
  _ttlMs: number = 3600000
): void {
  const entry: CacheEntry<T> = {
    data: value,
    at: Date.now(),
  }

  // Store in memory cache
  memoryCache.set(key, entry)

  // Store in localStorage
  try {
    localStorage.setItem(`cache:${key}`, JSON.stringify(entry))
  } catch (error) {
    console.warn('Failed to write to localStorage cache:', error)
  }
}

export function getCacheTimestamp(key: string): number | null {
  // Check memory cache first
  const memoryEntry = memoryCache.get(key)
  if (memoryEntry) {
    return memoryEntry.at
  }

  // Check localStorage
  try {
    const stored = localStorage.getItem(`cache:${key}`)
    if (stored) {
      const entry: CacheEntry<any> = JSON.parse(stored)
      return entry.at
    }
  } catch (error) {
    console.warn('Failed to read cache timestamp from localStorage:', error)
  }

  return null
}

export function clearCache(key: string): void {
  // Remove from memory cache
  memoryCache.delete(key)

  // Remove from localStorage
  try {
    localStorage.removeItem(`cache:${key}`)
  } catch (error) {
    console.warn('Failed to remove from localStorage cache:', error)
  }
}
