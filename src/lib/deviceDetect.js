// src/lib/deviceDetect.js
'use client'

export function applyDeviceClasses() {
  if (typeof window === 'undefined') return

  const ua = navigator.userAgent
  const html = document.documentElement

  // Device type
  const isTizen = /Tizen|SmartTV/i.test(ua)
  const isMobile = /iPhone|Android/i.test(ua) && ('ontouchstart' in window)
  const isTV = window.innerWidth >= 1280 && !('ontouchstart' in window)
  const ram = navigator.deviceMemory || 4

  if (isTizen) html.classList.add('is-tizen')
  if (isMobile) html.classList.add('is-mobile')
  if (isTV)     html.classList.add('is-tv')
  if (ram <= 1) html.classList.add('low-memory')

  // Tizen version
  const tizenMatch = ua.match(/Tizen\s([\d.]+)/)
  if (tizenMatch) {
    const v = Math.floor(parseFloat(tizenMatch[1]))
    html.classList.add(`tizen-${v}`)
  }

  // CSS support checks
  if (!CSS.supports('color', 'var(--test)')) {
    html.classList.add('no-vars')
  }

  if (!CSS.supports('backdrop-filter', 'blur(1px)') &&
      !CSS.supports('-webkit-backdrop-filter', 'blur(1px)')) {
    html.classList.add('no-backdrop')
  }
}