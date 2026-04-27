// src/components/DeviceDetector.tsx
'use client'

import { useEffect } from 'react'
import { applyDeviceClasses } from '@/lib/deviceDetect'

export default function DeviceDetector() {
  useEffect(() => {
    applyDeviceClasses()
  }, [])

  return null
}