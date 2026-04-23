'use client'

import { useEffect } from 'react'
import { useMasjidStore } from '@/store/masjid-store'
import { useDevice } from '@/components/masjid/hooks/useDevice'
import { useRealtimeSync } from '@/components/masjid/hooks/useRealtimeSync'
import { useSearchParams } from 'next/navigation'
import MosqueDisplay from '@/components/masjid/MosqueDisplay'

export default function HomeClient() {
  const deviceId = useMasjidStore((s) => s.deviceId)
  const setPreviewMode = useMasjidStore((s) => s.setPreviewMode)
  const fetchConfig = useDevice().fetchConfig
  const initDevice = useDevice().initDevice
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')

  useEffect(() => {
    if (preview === 'adhan' || preview === 'iqomah') {
      setPreviewMode(preview)
    }
  }, [preview, setPreviewMode])

  useEffect(() => {
    const id = initDevice()
    if (id) {
      fetchConfig()
    }
  }, [])

  useRealtimeSync()

  return <MosqueDisplay />
}