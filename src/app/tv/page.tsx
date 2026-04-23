'use client'

import { useEffect } from 'react'
import { useMasjidStore } from '@/store/masjid-store'
import { useOfflineConfig } from '@/components/masjid/hooks/useOfflineConfig'
import { useAndroidTv } from '@/components/masjid/hooks/useAndroidTv'
import MosqueDisplay from '@/components/masjid/MosqueDisplay'

/**
 * Android TV display page.
 *
 * Features:
 * - Display only (no settings, no superadmin)
 * - Offline-first: loads cached config instantly, syncs when online
 * - Auto fullscreen for TV display
 * - Wake lock to prevent screen sleep
 * - Auto-resume when TV wakes from standby
 * - Service Worker registration for full offline PWA support
 */
export default function TvPage() {
  const setDeviceId = useMasjidStore((s) => s.setDeviceId)
  const deviceId = useMasjidStore((s) => s.deviceId)

  // Offline config management
  const {
    isOnline,
    isOfflineMode,
    cacheAge,
    loadCachedConfig,
    fetchConfigWithCache,
  } = useOfflineConfig()

  // Android TV behaviors
  const {
    isFullscreen,
    isWakeLocked,
  } = useAndroidTv()

  // Initialize device ID and config on mount
  useEffect(() => {
    // 1. Get or create device ID from localStorage
    const stored = localStorage.getItem('masjid_device_id')
    if (stored) {
      setDeviceId(stored)
    } else {
      // Generate a simple ID for TV devices
      const id = 'TV' + Math.random().toString(36).substring(2, 6).toUpperCase()
      setDeviceId(id)
      localStorage.setItem('masjid_device_id', id)
    }
  }, [setDeviceId])

  // Load config: cached first, then network
  useEffect(() => {
    if (!deviceId) return

    // Immediately load cached config for fast display
    loadCachedConfig()

    // Then try to fetch latest from server
    fetchConfigWithCache()
  }, [deviceId, loadCachedConfig, fetchConfigWithCache])

  // Register service worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('SW registered for /tv:', reg.scope)

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                console.log('SW updated, new cache available')
              }
            })
          }
        })
      }).catch((err) => {
        console.warn('SW registration failed:', err)
      })
    }
  }, [])

  return (
    <div className="relative">
      {/* Main display */}
      <MosqueDisplay />

      {/* Tiny status indicator - only visible on hover/dev */}
      <div className="pointer-events-none fixed bottom-1 left-1 z-[9999] flex items-center gap-1.5 opacity-0 transition-opacity duration-300 hover:opacity-100">
        {/* Online status */}
        <div className="flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 backdrop-blur-sm">
          <div className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-[8px] font-medium text-white/60">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Offline mode badge */}
        {isOfflineMode && (
          <div className="rounded-full bg-amber-500/20 px-1.5 py-0.5">
            <span className="text-[8px] font-medium text-amber-400">
              Cache ({cacheAge})
            </span>
          </div>
        )}

        {/* Fullscreen indicator */}
        {isFullscreen && (
          <div className="flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 backdrop-blur-sm">
            <span className="text-[8px] font-medium text-white/40">
              {isWakeLocked ? 'Wake Lock' : 'Fullscreen'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
