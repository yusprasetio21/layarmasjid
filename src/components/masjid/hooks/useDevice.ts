'use client'

import { useCallback } from 'react'
import { useMasjidStore } from '@/store/masjid-store'
import { generateHardwareId } from '@/lib/hardware-id'
import type { MasjidConfig } from '@/types/masjid'

export function useDevice() {
  const deviceId = useMasjidStore((s) => s.deviceId)
  const setDeviceId = useMasjidStore((s) => s.setDeviceId)
  const isAuthenticated = useMasjidStore((s) => s.isAuthenticated)
  const setIsAuthenticated = useMasjidStore((s) => s.setIsAuthenticated)
  const loadConfig = useMasjidStore((s) => s.loadConfig)
  const config = useMasjidStore((s) => s.config)
  const setLastSynced = useMasjidStore((s) => s.setLastSynced)
  const setIsLoading = useMasjidStore((s) => s.setIsLoading)

  const initDevice = useCallback(() => {
    // Check localStorage first
    const stored = localStorage.getItem('masjid_device_id')
    if (stored) {
      setDeviceId(stored)
      return stored
    }

    // Generate hardware-based ID
    const id = generateHardwareId()
    setDeviceId(id)
    localStorage.setItem('masjid_device_id', id)
    return id
  }, [setDeviceId])

  const registerDevice = useCallback(
    async (id: string, password: string) => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/screens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Gagal registrasi')
        setDeviceId(id)
        localStorage.setItem('masjid_device_id', id)
        return data
      } finally {
        setIsLoading(false)
      }
    },
    [setDeviceId, setIsLoading]
  )

  const authenticate = useCallback(
    async (id: string, password: string) => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/screens/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Autentikasi gagal')
        setIsAuthenticated(true)
        if (data.screen?.config) {
          loadConfig(data.screen.config as MasjidConfig)
        }
        setDeviceId(id)
        localStorage.setItem('masjid_device_id', id)
        localStorage.setItem('masjid_auth', JSON.stringify({ id, password }))
        return data
      } finally {
        setIsLoading(false)
      }
    },
    [setIsAuthenticated, loadConfig, setDeviceId, setIsLoading]
  )

  const fetchConfig = useCallback(async () => {
    if (!deviceId) return null
    setIsLoading(true)
    try {
      const res = await fetch(`/api/screens/${deviceId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil config')
      if (data.screen?.config) {
        loadConfig(data.screen.config as MasjidConfig)
        setLastSynced(new Date().toLocaleTimeString('id-ID'))
      }
      return data
    } finally {
      setIsLoading(false)
    }
  }, [deviceId, loadConfig, setLastSynced, setIsLoading])

  const saveConfig = useCallback(async () => {
    if (!deviceId || !isAuthenticated) return null
    setIsLoading(true)
    try {
      const res = await fetch(`/api/screens/${deviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan config')
      setLastSynced(new Date().toLocaleTimeString('id-ID'))
      return data
    } finally {
      setIsLoading(false)
    }
  }, [deviceId, isAuthenticated, config, setLastSynced, setIsLoading])

  const checkSavedAuth = useCallback(() => {
    const saved = localStorage.getItem('masjid_auth')
    if (saved) {
      try {
        const { id, password } = JSON.parse(saved)
        authenticate(id, password)
      } catch {
        localStorage.removeItem('masjid_auth')
      }
    }
  }, [authenticate])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    localStorage.removeItem('masjid_auth')
  }, [setIsAuthenticated])

  return {
    deviceId,
    isAuthenticated,
    config,
    initDevice,
    registerDevice,
    authenticate,
    fetchConfig,
    saveConfig,
    checkSavedAuth,
    logout,
  }
}
