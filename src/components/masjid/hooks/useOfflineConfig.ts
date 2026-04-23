'use client'

import { useState, useCallback, useEffect } from 'react'
import { useMasjidStore } from '@/store/masjid-store'
import type { MasjidConfig } from '@/types/masjid'

const CACHE_KEY = 'masjid_cached_config'
const CACHE_META_KEY = 'masjid_cache_meta'

interface CacheMeta {
  timestamp: number
  deviceId: string | null
}

/**
 * Offline-first config management for Android TV.
 * - When online: fetches config from API and caches to localStorage
 * - When offline: loads config from localStorage cache
 * - Stores last-synced timestamp for freshness checks
 */
export function useOfflineConfig() {
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [isOfflineMode, setIsOfflineMode] = useState(() => typeof navigator !== 'undefined' ? !navigator.onLine : false)
  const [cacheAge, setCacheAge] = useState<string | null>(null)

  const deviceId = useMasjidStore((s) => s.deviceId)
  const loadConfig = useMasjidStore((s) => s.loadConfig)
  const setLastSynced = useMasjidStore((s) => s.setLastSynced)

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setIsOfflineMode(false)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setIsOfflineMode(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  /** Load cached config from localStorage (fast, synchronous) */
  const loadCachedConfig = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return false

      const config = JSON.parse(cached) as MasjidConfig
      loadConfig(config)

      // Show cache age
      const metaStr = localStorage.getItem(CACHE_META_KEY)
      if (metaStr) {
        const meta = JSON.parse(metaStr) as CacheMeta
        const ageMs = Date.now() - meta.timestamp
        const ageMinutes = Math.floor(ageMs / 60000)
        if (ageMinutes < 60) {
          setCacheAge(`${ageMinutes} menit lalu`)
        } else {
          const ageHours = Math.floor(ageMinutes / 60)
          setCacheAge(`${ageHours} jam lalu`)
        }
      }
      return true
    } catch {
      return false
    }
  }, [loadConfig])

  /** Save config to localStorage cache */
  const saveConfigToCache = useCallback((config: MasjidConfig) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(config))
      localStorage.setItem(CACHE_META_KEY, JSON.stringify({
        timestamp: Date.now(),
        deviceId,
      } as CacheMeta))
      setCacheAge('Baru saja')
    } catch (e) {
      // localStorage might be full
      console.warn('Failed to cache config:', e)
    }
  }, [deviceId])

  /** Fetch config from API with cache fallback */
  const fetchConfigWithCache = useCallback(async () => {
    if (!deviceId) return null

    // Try network first
    if (navigator.onLine) {
      try {
        const res = await fetch(`/api/screens/${deviceId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.screen?.config) {
            const config = data.screen.config as MasjidConfig
            loadConfig(config)
            saveConfigToCache(config)
            setLastSynced(new Date().toLocaleTimeString('id-ID'))
            setIsOfflineMode(false)
            return data
          }
        }
      } catch {
        // Network failed, fall through to cache
      }
    }

    // Fallback to cached config
    const hasCache = loadCachedConfig()
    if (hasCache) {
      setIsOfflineMode(true)
    }
    return null
  }, [deviceId, loadConfig, saveConfigToCache, loadCachedConfig, setLastSynced])

  /** Periodically sync when online (every 60s) */
  useEffect(() => {
    if (!isOnline || !deviceId) return

    const syncInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/screens/${deviceId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.screen?.config) {
            const config = data.screen.config as MasjidConfig
            loadConfig(config)
            saveConfigToCache(config)
            setLastSynced(new Date().toLocaleTimeString('id-ID'))
          }
        }
      } catch {
        // Silent fail for background sync
      }
    }, 60000) // Every 60 seconds

    return () => clearInterval(syncInterval)
  }, [isOnline, deviceId, loadConfig, saveConfigToCache, setLastSynced])

  return {
    isOnline,
    isOfflineMode,
    cacheAge,
    loadCachedConfig,
    saveConfigToCache,
    fetchConfigWithCache,
  }
}
