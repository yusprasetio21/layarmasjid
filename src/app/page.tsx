'use client'

import { useEffect, Suspense } from 'react'
import { useMasjidStore } from '@/store/masjid-store'
import { useDevice } from '@/components/masjid/hooks/useDevice'
import { useRealtimeSync } from '@/components/masjid/hooks/useRealtimeSync'
import { useSearchParams } from 'next/navigation'
import MosqueDisplay from '@/components/masjid/MosqueDisplay'

function HomeContent() {
  const deviceId = useMasjidStore((s) => s.deviceId)
  const setPreviewMode = useMasjidStore((s) => s.setPreviewMode)
  const fetchConfig = useDevice().fetchConfig
  const initDevice = useDevice().initDevice
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')

  // Handle preview mode from URL params
  useEffect(() => {
    if (preview === 'adhan' || preview === 'iqomah') {
      setPreviewMode(preview)
    }
  }, [preview, setPreviewMode])

  // Initialize device ID on mount
  useEffect(() => {
    const id = initDevice()
    // Try to fetch config for this device (works even without auth)
    if (id) {
      fetchConfig()
    }
  }, [])

  // Set up real-time subscription
  useRealtimeSync()

  return (
    <MosqueDisplay />
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
