import React, { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Performance utilities optimized for Nigerian marketplace
 * Designed for users with varying network speeds and device capabilities
 */

// Network speed detection for Nigerian users
export const useNetworkSpeed = () => {
  const [networkSpeed, setNetworkSpeed] = useState<'slow' | 'medium' | 'fast'>('medium')
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateNetworkInfo = () => {
      setIsOnline(navigator.onLine)
      
      // @ts-ignore - Connection API not fully supported but useful for Nigerian context
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      
      if (connection) {
        const effectiveType = connection.effectiveType
        switch (effectiveType) {
          case 'slow-2g':
          case '2g':
            setNetworkSpeed('slow')
            break
          case '3g':
            setNetworkSpeed('medium')
            break
          case '4g':
          default:
            setNetworkSpeed('fast')
            break
        }
      }
    }

    updateNetworkInfo()
    window.addEventListener('online', updateNetworkInfo)
    window.addEventListener('offline', updateNetworkInfo)

    return () => {
      window.removeEventListener('online', updateNetworkInfo)
      window.removeEventListener('offline', updateNetworkInfo)
    }
  }, [])

  return { networkSpeed, isOnline }
}

// Optimized image loading for Nigerian users
export const useOptimizedImage = (src: string, options?: {
  priority?: boolean
  quality?: number
  placeholder?: string
}) => {
  const [imageSrc, setImageSrc] = useState(options?.placeholder || '')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { networkSpeed } = useNetworkSpeed()

  useEffect(() => {
    const img = new Image()
    
    // Adjust quality based on network speed for Nigerian users
    const quality = networkSpeed === 'slow' ? 60 : networkSpeed === 'medium' ? 80 : 90
    const optimizedSrc = src.includes('?') 
      ? `${src}&q=${quality}&f=webp`
      : `${src}?q=${quality}&f=webp`

    img.onload = () => {
      setImageSrc(optimizedSrc)
      setIsLoading(false)
    }

    img.onerror = () => {
      setError('Failed to load image')
      setIsLoading(false)
      // Fallback to original image
      setImageSrc(src)
    }

    img.src = optimizedSrc
  }, [src, networkSpeed])

  return { imageSrc, isLoading, error }
}

// Debounced search for Nigerian marketplace
export const useNigerianSearch = (
  searchFn: (query: string) => Promise<any>,
  delay: number = 500
) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await searchFn(searchQuery)
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [searchFn])

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      search(query)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query, delay, search])

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearResults: () => setResults([])
  }
}

// Intersection Observer for lazy loading - crucial for Nigerian mobile users
export const useIntersectionObserver = (
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const targetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) {
          setIsIntersecting(entry.isIntersecting)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(target)

    return () => observer.unobserve(target)
  }, [options])

  return { targetRef, isIntersecting }
}

// Virtualized list for large datasets (Nigerian marketplace can have many listings)
export const useVirtualizedList = <T>(
  items: T[],
  containerHeight: number,
  itemHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  )

  const visibleItems = items.slice(startIndex, endIndex)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  }
}

// Performance monitoring for Nigerian users
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0
  })

  useEffect(() => {
    const startTime = performance.now()

    // Monitor page load performance
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime
      setMetrics(prev => ({ ...prev, loadTime }))
    })

    // Monitor memory usage (if available)
    const updateMemoryUsage = () => {
      // Memory API not fully standardized, use type assertion
      const perfWithMemory = performance as any
      if (perfWithMemory.memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: perfWithMemory.memory.usedJSHeapSize / 1024 / 1024
        }))
      }
    }

    const interval = setInterval(updateMemoryUsage, 5000)

    return () => clearInterval(interval)
  }, [])

  return metrics
}

// Nigerian currency formatting with performance optimization
export const useNairaCurrency = () => {
  const formatNaira = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }, [])

  const parseNaira = useCallback((formatted: string): number => {
    return parseInt(formatted.replace(/[₦,\s]/g, '')) || 0
  }, [])

  return { formatNaira, parseNaira }
}

// Optimized state management for offline capability
export const useOfflineSync = <T>(
  key: string,
  initialData: T,
  syncFn?: (data: T) => Promise<void>
) => {
  const [data, setData] = useState<T>(initialData)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const { isOnline } = useNetworkSpeed()

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`offline_${key}`)
    if (stored) {
      try {
        setData(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to parse stored data:', error)
      }
    }
  }, [key])

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem(`offline_${key}`, JSON.stringify(data))
  }, [key, data])

  // Sync when online and sync function is available
  useEffect(() => {
    if (isOnline && syncFn && !isSyncing) {
      setIsSyncing(true)
      syncFn(data)
        .then(() => {
          setLastSyncTime(new Date())
        })
        .catch(error => {
          console.error('Sync failed:', error)
        })
        .finally(() => {
          setIsSyncing(false)
        })
    }
  }, [isOnline, data, syncFn, isSyncing])

  return {
    data,
    setData,
    isSyncing,
    lastSyncTime,
    isOnline
  }
}

// Nigerian phone number validation hook
export const useNigerianPhone = () => {
  const validatePhone = useCallback((phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.startsWith('234') && cleaned.length === 13
  }, [])

  const formatPhone = useCallback((phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('234')) {
      return `+${cleaned}`
    }
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      return `+234${cleaned.slice(1)}`
    }
    return phone
  }, [])

  return { validatePhone, formatPhone }
}

// Optimized API cache for Nigerian marketplace
export const useAPICache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number // Time to live in milliseconds
    staleWhileRevalidate?: boolean
  }
) => {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { isOnline } = useNetworkSpeed()

  const ttl = options?.ttl || 5 * 60 * 1000 // 5 minutes default
  const swr = options?.staleWhileRevalidate ?? true

  const fetchData = useCallback(async (useCache = true) => {
    const cacheKey = `api_cache_${key}`
    const cached = useCache ? localStorage.getItem(cacheKey) : null

    if (cached && useCache) {
      try {
        const { data: cachedData, timestamp } = JSON.parse(cached)
        const isStale = Date.now() - timestamp > ttl

        if (!isStale || !isOnline) {
          setData(cachedData)
          if (!isStale) return cachedData
        }

        if (swr && isStale) {
          setData(cachedData) // Return stale data immediately
        }
      } catch (error) {
        console.error('Failed to parse cached data:', error)
      }
    }

    if (!isOnline && cached) {
      return data // Return whatever we have when offline
    }

    setIsLoading(true)
    setError(null)

    try {
      const freshData = await fetcher()
      setData(freshData)

      // Cache the fresh data
      localStorage.setItem(cacheKey, JSON.stringify({
        data: freshData,
        timestamp: Date.now()
      }))

      return freshData
    } catch (err) {
      const error = err instanceof Error ? err : new Error('API request failed')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [key, fetcher, ttl, swr, isOnline, data])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(false),
    isOnline
  }
}

// Performance-optimized component wrapper
export const memo = <P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return React.memo(Component, propsAreEqual)
}

// Nigerian time zone utilities
export const useNigerianTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatNigerianTime = useCallback((date: Date = currentTime): string => {
    return date.toLocaleString('en-NG', {
      timeZone: 'Africa/Lagos',
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }, [currentTime])

  const isBusinessHours = useCallback((date: Date = currentTime): boolean => {
    const hour = date.getHours()
    const day = date.getDay()
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 18 // Mon-Fri 9AM-6PM WAT
  }, [currentTime])

  return {
    currentTime,
    formatNigerianTime,
    isBusinessHours
  }
}