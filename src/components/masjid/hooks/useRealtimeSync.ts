'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useMasjidStore } from '@/store/masjid-store'

/**
 * Realtime sync using polling only (no Supabase dependency).
 * Polls the API every 15 seconds for config updates.
 */
export function useRealtimeSync() {
  const deviceId = useMasjidStore((s) => s.deviceId)
  const loadConfig = useMasjidStore((s) => s.loadConfig)
  const setLastSynced = useMasjidStore((s) => s.setLastSynced)
  const isAuthenticated = useMasjidStore((s) => s.isAuthenticated)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pollConfig = useCallback(async () => {
    if (!deviceId) return
    try {
      const res = await fetch(`/api/screens/${deviceId}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.screen?.config) {
        loadConfig(data.screen.config)
        setLastSynced(new Date().toLocaleTimeString('id-ID'))
      }
    } catch {
      // Silent fail for polling
    }
  }, [deviceId, loadConfig, setLastSynced])

  useEffect(() => {
    // Start polling for all devices
    pollConfig()
    pollingRef.current = setInterval(pollConfig, 15000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [pollConfig])

  // More frequent polling when authenticated (every 5s)
  useEffect(() => {
    if (isAuthenticated && deviceId) {
      const fastPoll = setInterval(pollConfig, 5000)
      return () => clearInterval(fastPoll)
    }
  }, [isAuthenticated, deviceId, pollConfig])

  return { pollConfig }
}
