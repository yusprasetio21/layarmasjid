'use client'

import { useEffect, useCallback, useRef, useState } from 'react'

/**
 * Android TV specific behaviors:
 * - Auto-enter fullscreen on mount
 * - Re-enter fullscreen when TV wakes up (visibility change)
 * - Wake lock to prevent screen sleep
 * - Handle TV power cycle gracefully
 */
export function useAndroidTv() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isWakeLocked, setIsWakeLocked] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  /** Request fullscreen mode */
  const requestFullscreen = useCallback(async () => {
    try {
      // Check if we're already in fullscreen (PWA in standalone mode)
      if (document.fullscreenElement || window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: standalone)').matches) {
        setIsFullscreen(true)
        return true
      }

      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
      return true
    } catch (e) {
      console.warn('Fullscreen request failed:', e)
      return false
    }
  }, [])

  /** Request wake lock to prevent screen sleep */
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        const wakeLock = await navigator.wakeLock.request('screen')
        wakeLockRef.current = wakeLock
        setIsWakeLocked(true)

        // Wake lock is released when page becomes hidden, re-acquire on visible
        wakeLock.addEventListener('release', () => {
          setIsWakeLocked(false)
        })
      }
    } catch (e) {
      console.warn('Wake lock request failed:', e)
    }
  }, [])

  /** Release wake lock */
  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release()
      wakeLockRef.current = null
      setIsWakeLocked(false)
    }
  }, [])

  /** Initialize fullscreen and wake lock */
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const initTimer = setTimeout(async () => {
      await requestFullscreen()
      await requestWakeLock()
    }, 300)

    return () => {
      clearTimeout(initTimer)
      releaseWakeLock()
    }
  }, [requestFullscreen, requestWakeLock, releaseWakeLock])

  /** Handle fullscreen change */
  useEffect(() => {
    const handler = () => {
      const isFs = !!document.fullscreenElement
      setIsFullscreen(isFs)

      // If user exits fullscreen manually and we're in PWA, try to re-enter
      if (!isFs && window.matchMedia('(display-mode: standalone)').matches) {
        // In PWA standalone mode, the app already handles fullscreen
        setIsFullscreen(true)
      }
    }

    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  /** Handle visibility change (TV power cycle) */
  useEffect(() => {
    const handler = async () => {
      if (document.visibilityState === 'visible') {
        setIsVisible(true)

        // TV woke up - re-enter fullscreen if needed
        if (!document.fullscreenElement && !window.matchMedia('(display-mode: fullscreen)').matches && !window.matchMedia('(display-mode: standalone)').matches) {
          // Wait a bit for the browser to fully wake up
          setTimeout(async () => {
            await requestFullscreen()
          }, 500)
        }

        // Re-acquire wake lock
        await requestWakeLock()
      } else {
        setIsVisible(false)
        // Wake lock is automatically released on page hide
      }
    }

    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [requestFullscreen, requestWakeLock])

  return {
    isFullscreen,
    isWakeLocked,
    isVisible,
    requestFullscreen,
    requestWakeLock,
    releaseWakeLock,
  }
}
