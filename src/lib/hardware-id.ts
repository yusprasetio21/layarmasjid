// Hardware ID generation using browser fingerprinting
// Generates a consistent 4-digit ID based on hardware characteristics

export function generateHardwareId(): string {
  const components = getFingerprintComponents()
  const hash = simpleHash(JSON.stringify(components))
  return String(hash % 10000).padStart(4, '0')
}

function getFingerprintComponents(): Record<string, unknown> {
  const nav = navigator as Record<string, unknown>
  const screen = window.screen as Record<string, unknown>

  return {
    userAgent: nav.userAgent,
    language: nav.language,
    languages: nav.languages ? Array.from(nav.languages as ArrayLike<string>).join(',') : '',
    platform: nav.platform,
    hardwareConcurrency: nav.hardwareConcurrency,
    deviceMemory: nav.deviceMemory,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    touchPoints: nav.maxTouchPoints || 0,
    vendor: nav.vendor,
    cpuCores: nav.hardwareConcurrency || 'unknown',
  }
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Get a display-friendly version of the hardware info
export function getHardwareInfo(): string {
  const nav = navigator
  const screen = window.screen

  const platform = (nav as Record<string, unknown>).platform || 'Unknown'
  const resolution = `${screen.width}x${screen.height}`
  const userAgent = nav.userAgent

  let browser = 'Unknown'
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari'
  else if (userAgent.includes('Edg')) browser = 'Edge'

  return `${browser} on ${platform} (${resolution})`
}
