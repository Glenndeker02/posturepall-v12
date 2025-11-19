import { useCallback, useRef, useEffect } from 'react'

/**
 * Debounce function calls to improve performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function calls to limit execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Hook for debounced callbacks
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    debounce((...args: Parameters<T>) => callbackRef.current(...args), delay),
    [delay]
  )
}

/**
 * Hook for throttled callbacks
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    throttle((...args: Parameters<T>) => callbackRef.current(...args), limit),
    [limit]
  )
}

/**
 * Memoize expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Calculate optimal image dimensions for display
 */
export function getOptimalImageDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight

  let width = originalWidth
  let height = originalHeight

  if (width > maxWidth) {
    width = maxWidth
    height = width / aspectRatio
  }

  if (height > maxHeight) {
    height = maxHeight
    width = height * aspectRatio
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  }
}

/**
 * Batch multiple state updates
 */
export function batchUpdates<T>(updates: Array<() => void>): void {
  updates.forEach((update) => update())
}

/**
 * Lazy load data with pagination
 */
export class LazyLoader<T> {
  private data: T[] = []
  private pageSize: number
  private currentPage: number = 0

  constructor(pageSize: number = 20) {
    this.pageSize = pageSize
  }

  setData(data: T[]) {
    this.data = data
    this.currentPage = 0
  }

  loadMore(): T[] {
    const start = this.currentPage * this.pageSize
    const end = start + this.pageSize
    const page = this.data.slice(start, end)

    if (page.length > 0) {
      this.currentPage++
    }

    return page
  }

  hasMore(): boolean {
    return this.currentPage * this.pageSize < this.data.length
  }

  reset() {
    this.currentPage = 0
  }

  getLoadedCount(): number {
    return this.currentPage * this.pageSize
  }

  getTotalCount(): number {
    return this.data.length
  }
}

/**
 * Memory-efficient data cache with size limit
 */
export class LRUCache<K, V> {
  private maxSize: number
  private cache: Map<K, V>

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
    this.cache = new Map()
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    // Delete if exists to update position
    this.cache.delete(key)

    // Add to end
    this.cache.set(key, value)

    // Remove oldest if over size limit
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

/**
 * Format large numbers for display (1000 -> 1K)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Calculate memory usage (estimate)
 */
export function estimateObjectSize(obj: any): number {
  const str = JSON.stringify(obj)
  return new Blob([str]).size
}

/**
 * Schedule heavy work for idle time
 */
export function scheduleIdleTask(task: () => void, timeout: number = 1000): void {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(task, { timeout })
  } else {
    setTimeout(task, 0)
  }
}
