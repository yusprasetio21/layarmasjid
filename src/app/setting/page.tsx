'use client'

import { useEffect } from 'react'
import { useDevice } from '@/components/masjid/hooks/useDevice'
import { useRealtimeSync } from '@/components/masjid/hooks/useRealtimeSync'
import SettingsPanel from '@/components/masjid/SettingsPanel'

export default function SettingPage() {
  const { initDevice, checkSavedAuth } = useDevice()

  useEffect(() => {
    initDevice()
  }, [])

  useEffect(() => {
    checkSavedAuth()
  }, [])

  useRealtimeSync()

  return <SettingsPanel />
}
