'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useMasjidStore } from '@/store/masjid-store'
import type { PrayerTime } from '@/types/masjid'
import { THEMES, ANALOG_NUMBERS } from '@/types/masjid'

// ============================================================
// CONSTANTS
// ============================================================

const HIJRI_MONTHS_AR = [
  'مُحَرَّم', 'صَفَر', 'رَبِيع الأَوَّل', 'رَبِيع الثَّاني',
  'جُمَادَى الأُولَى', 'جُمَادَى الثَّانِيَة', 'رَجَب', 'شَعْبَان',
  'رَمَضَان', 'شَوَّال', 'ذُو القَعْدَة', 'ذُو الحِجَّة',
]

const HIJRI_MONTHS_ID = [
  'Muharram', 'Safar', "Rabi'ul Awal", "Rabi'ul Akhir",
  'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban",
  'Ramadhan', 'Syawwal', "Dzulqa'dah", 'Dzulhijjah',
]

const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
]

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]

type Lang = 'id' | 'ar' | 'en'

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/** Convert "HH:MM" string to total seconds since midnight */
function timeToSeconds(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 3600 + m * 60
}

/** Format a Date to time string, optionally showing seconds */
function formatTime(date: Date, showSec: boolean): string {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return showSec ? `${h}:${m}:${s}` : `${h}:${m}`
}

/** Convert a Date to a time-corrected Date (adds/subtracts correction) */
function getTimezonedDate(date: Date, correctionSeconds: number): Date {
  return new Date(date.getTime() + correctionSeconds * 1000)
}

/** Format a Date to localized Gregorian date string */
function formatDate(date: Date, lang: Lang): string {
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  const dayOfWeek = date.getDay()

  if (lang === 'ar') {
    const arDay = toArabicNumerals(day)
    const arYear = toArabicNumerals(year)
    return `${ARABIC_DAYS[dayOfWeek]}، ${arDay} ${MONTHS_AR[month]} ${arYear}`
  }

  const dayNames = lang === 'id' ? DAYS_ID : DAYS_EN
  const monthNames = lang === 'id' ? MONTHS_ID : MONTHS_EN
  return `${dayNames[dayOfWeek]}, ${day} ${monthNames[month]} ${year}`
}

/** Convert Latin digits to Arabic-Indic numerals */
function toArabicNumerals(num: number | string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return String(num).replace(/\d/g, (d) => arabicDigits[parseInt(d)])
}

/** Approximate Gregorian-to-Hijri date conversion (Kuwaiti algorithm) */
function getHijriDate(date: Date): { day: number; month: number; year: number } {
  const gy = date.getFullYear()
  const gm = date.getMonth() + 1
  const gd = date.getDate()

  const d = new Date(gy, gm - 1, gd)
  const jd = Math.floor(d.getTime() / 86400000) + 2440588

  const l = jd - 1948440 + 10632
  const n = Math.floor((l - 1) / 10631)
  const lp = l - 10631 * n + 354
  const j = Math.floor((10985 - lp) / 5316) * Math.floor((50 * lp) / 17719) + Math.floor(lp / 5670) * Math.floor((43 * lp) / 15238)
  const ldp = lp - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29
  const hm = Math.floor((24 * ldp) / 709)
  const hd = ldp - Math.floor((709 * hm) / 24)
  const hy = 30 * n + j - 30

  return { day: hd, month: hm - 1, year: hy }
}

/** Format Hijri date to localized string */
function formatHijriDate(date: Date, lang: Lang): string {
  const hijri = getHijriDate(date)
  const months = lang === 'ar' ? HIJRI_MONTHS_AR : lang === 'id' ? HIJRI_MONTHS_ID : HIJRI_MONTHS_EN
  const suffix = lang === 'ar' ? 'هـ' : 'H'

  if (lang === 'ar') {
    return `${toArabicNumerals(hijri.day)} ${months[hijri.month]} ${toArabicNumerals(hijri.year)} ${suffix}`
  }
  return `${hijri.day} ${months[hijri.month]} ${hijri.year} ${suffix}`
}

/** Get seconds remaining until a target "HH:MM" from current time */
function getTimeDiff(targetTimeStr: string, now: Date): number {
  const targetSec = timeToSeconds(targetTimeStr)
  const currentSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  const diff = targetSec - currentSec
  return diff > 0 ? diff : diff + 86400
}

/** Format seconds to HH:MM:SS countdown */
function formatCountdown(totalSeconds: number, showHours = true): string {
  if (totalSeconds < 0) totalSeconds = 0
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (!showHours) {
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Calculate iqomah time string from prayer time */
function calculateIqomah(prayerTime: string, minutes: number): string {
  const totalSec = timeToSeconds(prayerTime) + minutes * 60
  const h = Math.floor(totalSec / 3600) % 24
  const m = Math.floor((totalSec % 3600) / 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Play a beep sound using Web Audio API */
function playBeep(frequency: number, duration: number): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration / 1000)
    setTimeout(() => ctx.close(), duration + 200)
  } catch {
    // Audio not available
  }
}

/** Play three short beeps for iqomah countdown warning */
function playTripleBeep(): void {
  playBeep(1000, 120)
  setTimeout(() => playBeep(1000, 120), 180)
  setTimeout(() => playBeep(1200, 180), 360)
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function MosqueDisplay() {
  // ---- Store ----
  const config = useMasjidStore((s) => s.config)
  const deviceId = useMasjidStore((s) => s.deviceId)
  const previewMode = useMasjidStore((s) => s.previewMode)
  const setPreviewMode = useMasjidStore((s) => s.setPreviewMode)

  // ---- Local State ----
  const [now, setNow] = useState(() => new Date())
  const [language, setLanguage] = useState<Lang>(config.lang)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeInfoIndex, setActiveInfoIndex] = useState(0)

  // ---- Refs ----
  const lastBeepSecond = useRef(-1)

  // ---- Derived: Effective time correction in seconds ----
  const effectiveTimeCorrection = config.timezoneMode === 'manual'
    ? (config.timeCorrectionHours * 3600) + (config.timeCorrectionMinutes * 60) + config.timeCorrectionSeconds
    : 0

  // ---- Derived: Time-corrected current time for display ----
  const tzNow = getTimezonedDate(now, effectiveTimeCorrection)

  // ---- Derived: Theme ----
  const theme = THEMES[config.theme] ?? THEMES['haramain']
  const isLight = theme?.isLight ?? false
  const layout = theme?.layout || 'default'

  // ---- Derived: Main prayers sorted by time (for adhan/iqomah/overlay logic) ----
  const mainPrayers = [...config.prayerTimesTemplate]
    .filter((p) => p.isMain)
    .sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time))

  // ---- Derived: All prayers sorted by time (for bottom bar) ----
  const allPrayers = [...config.prayerTimesTemplate]
    .sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time))

  // ---- Derived: Current seconds since midnight ----
  const currentSeconds = tzNow.getHours() * 3600 + tzNow.getMinutes() * 60 + tzNow.getSeconds()

  // ---- Derived: Next prayer + countdown ----
  let nextPrayer: PrayerTime | null = null
  let countdownSeconds = 0
  for (const prayer of mainPrayers) {
    const ps = timeToSeconds(prayer.time)
    if (ps > currentSeconds) {
      nextPrayer = prayer
      countdownSeconds = ps - currentSeconds
      break
    }
  }
  if (!nextPrayer) {
    const first = mainPrayers[0]
    if (first) {
      nextPrayer = first
      countdownSeconds = 86400 - currentSeconds + timeToSeconds(first.time)
    }
  }

  // ---- Derived: Active mode (normal / adhan / iqomah / post-iqomah) ----
  let activeMode: 'normal' | 'adhan' | 'iqomah' | 'post-iqomah' = 'normal'
  for (const prayer of mainPrayers) {
    const ps = timeToSeconds(prayer.time)
    const adhanStart = ps - config.adhanDuration
    const iqomahEnd = ps + config.iqomahMinutes * 60
    const postIqomahEnd = iqomahEnd + 120 // 2 minutes after iqomah

    if (config.adhanModeEnabled && currentSeconds >= adhanStart && currentSeconds < ps) {
      activeMode = 'adhan'
      break
    }
    if (config.iqomahModeEnabled && currentSeconds >= ps && currentSeconds < iqomahEnd) {
      activeMode = 'iqomah'
      break
    }
    // Post-iqomah: 2 minutes after iqomah ends
    if (config.postIqomahEnabled && config.iqomahModeEnabled && currentSeconds >= iqomahEnd && currentSeconds < postIqomahEnd) {
      activeMode = 'post-iqomah'
      break
    }
  }

  // ---- Derived: Active prayer for overlays ----
  let activePrayer: PrayerTime | null = null
  if (activeMode !== 'normal') {
    for (const prayer of mainPrayers) {
      const ps = timeToSeconds(prayer.time)
      const adhanStart = ps - config.adhanDuration
      const iqomahEnd = ps + config.iqomahMinutes * 60
      const postIqomahEnd = iqomahEnd + 120
      if (currentSeconds >= adhanStart && currentSeconds < postIqomahEnd) {
        activePrayer = prayer
        break
      }
    }
  }

  // Override with preview mode if active
  if (previewMode === 'adhan') {
    activeMode = 'adhan'
    if (!activePrayer) {
      activePrayer = nextPrayer || mainPrayers[0] || null
    }
  } else if (previewMode === 'iqomah') {
    activeMode = 'iqomah'
    if (!activePrayer) {
      activePrayer = nextPrayer || mainPrayers[0] || null
    }
  } else if (previewMode === 'post-iqomah') {
    activeMode = 'post-iqomah'
    if (!activePrayer) {
      activePrayer = nextPrayer || mainPrayers[0] || null
    }
  }

  // ---- Derived: is currently in prayer/iqomah blackout period? ----
  const isPrayerBlackout = activeMode !== 'normal'

  // ---- Derived: Scheduled info items ----
  const activeInfoItems = (config.informationEnabled ? (config.informationItems || []) : [])
    .filter((item) => {
      if (!item.active) return false

      // If in preview mode 'info', show all active items regardless of schedule
      if (previewMode === 'info') return true

      // If schedule not enabled, only show when not in prayer blackout
      if (!item.scheduleEnabled) return !isPrayerBlackout

      // Schedule enabled: check time window
      const startSec = timeToSeconds(item.displayStartTime || '08:00')
      const endSec = timeToSeconds(item.displayEndTime || '17:00')
      let inTimeWindow = false
      if (startSec <= endSec) {
        inTimeWindow = currentSeconds >= startSec && currentSeconds < endSec
      } else {
        // Crosses midnight (e.g. 22:00 to 05:00)
        inTimeWindow = currentSeconds >= startSec || currentSeconds < endSec
      }

      if (!inTimeWindow) return false

      // In time window, but not during prayer blackout
      return !isPrayerBlackout
    })

  // Should we show the info panel (not just the banner)?
  const showInfoPanel = activeInfoItems.length > 0 && activeMode === 'normal'

  // ---- Derived: Overlay countdowns ----
  const adhanCountdown = !activePrayer || activeMode !== 'adhan'
    ? 0
    : timeToSeconds(activePrayer.time) - currentSeconds

  const iqomahCountdown = !activePrayer || activeMode !== 'iqomah'
    ? 0
    : timeToSeconds(activePrayer.time) + config.iqomahMinutes * 60 - currentSeconds

  // ---- Derived: Prayer statuses for sidebar (main prayers only) ----
  const prayerStatuses = mainPrayers.map((prayer) => {
    const ps = timeToSeconds(prayer.time)
    const iqomahEnd = ps + config.iqomahMinutes * 60
    let status: 'passed' | 'now' | 'upcoming' = 'upcoming'
    if (currentSeconds >= iqomahEnd) {
      status = 'passed'
    } else if (currentSeconds >= ps) {
      status = 'now'
    }
    return { prayer, status, isNext: nextPrayer?.id === prayer.id }
  })

  // ---- Derived: Next prayer among ALL prayers (for bottom bar highlight) ----
  let nextPrayerAll: PrayerTime | null = null
  for (const prayer of allPrayers) {
    const ps = timeToSeconds(prayer.time)
    if (ps > currentSeconds) {
      nextPrayerAll = prayer
      break
    }
  }
  if (!nextPrayerAll && allPrayers.length > 0) {
    nextPrayerAll = allPrayers[0]
  }

  // ---- Derived: All prayer statuses for bottom bar ----
  const allPrayerStatuses = allPrayers.map((prayer) => {
    const ps = timeToSeconds(prayer.time)
    const iqomahEnd = ps + config.iqomahMinutes * 60
    let status: 'passed' | 'now' | 'upcoming' = 'upcoming'
    if (currentSeconds >= iqomahEnd) {
      status = 'passed'
    } else if (currentSeconds >= ps) {
      status = 'now'
    }
    return { prayer, status, isNext: nextPrayerAll?.id === prayer.id }
  })

  // ---- Effect: Timer tick every second ----
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ---- Effect: Iqomah beep sounds ----
  useEffect(() => {
    if (activeMode === 'iqomah' && config.iqomahBeepEnabled && config.soundEnabled && iqomahCountdown > 0) {
      if (iqomahCountdown <= 10 && iqomahCountdown !== lastBeepSecond.current) {
        lastBeepSecond.current = iqomahCountdown
        playTripleBeep()
      }
    }
  }, [iqomahCountdown, activeMode, config.iqomahBeepEnabled, config.soundEnabled])
  
  // ---- Effect: Fullscreen change listener ----
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // ---- Effect: Rotate information items every 8 seconds ----
  useEffect(() => {
    if (activeInfoItems.length <= 1) return
    const timer = setInterval(() => {
      setActiveInfoIndex((prev) => (prev + 1) % activeInfoItems.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [activeInfoItems.length])

  const currentInfoItem = activeInfoItems[activeInfoIndex] || null

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }, [])

  // ---- Computed styles ----
  const digitalFontSize = config.digitalFontSize

  const isAlertMode = activeMode === 'normal' && countdownSeconds !== null && countdownSeconds < 600

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      className={`tv-screen ${theme.bgClass}`}
      style={
        {
          '--digital-font-size': `${digitalFontSize}rem`,
          '--running-speed': `${config.runningSpeed}s`,
          '--prayer-card-bg': config.cardBgColor,
          '--prayer-card-border': config.cardBorderColor,
          '--info-image-size': `${config.infoImageSize || 85}%`,
          '--text-primary': theme.textPrimary,
          '--text-muted': theme.textMuted,
          ...(config.theme === 'custom' ? {
            '--accent-gold': config.customThemeAccent || '#C9A84C',
          } : {}),
        } as React.CSSProperties
      }
    >
      {/* Custom theme background image */}
      {config.theme === 'custom' && config.customBackgroundImage && (
        <div
          className="theme-custom-bg-image"
          style={{
            backgroundImage: `url(${config.customBackgroundImage})`,
            opacity: (config.customBackgroundOpacity || 30) / 100,
          }}
        />
      )}
      {/* ======== HEADER BAR ======== */}
      <header className={`relative z-50 flex min-h-[44px] shrink-0 items-center justify-between border-b px-3 backdrop-blur-sm sm:min-h-[48px] sm:px-5 ${isLight ? 'tv-header-light' : 'border-white/5 bg-black/60'}`}>
        {/* Left: Mosque info (or Logo+Title when no info panel) */}
        {showInfoPanel ? (
          <div className="flex items-center gap-3">
            <MosqueLogo size={22} />
            <div className="flex flex-col leading-tight">
              <span
                className="font-amiri text-sm font-bold sm:text-base lg:text-lg"
                style={{ color: 'var(--accent-gold)' }}
              >
                {config.mosqueNameArabic}
              </span>
              <span
                className={isLight ? 'text-[10px] sm:text-xs' : 'text-[10px] text-white/60 sm:text-xs'}
                style={{ fontFamily: config.mosqueNameFontFamily, color: isLight ? 'var(--text-primary)' : undefined }}
              >
                {config.mosqueName}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <MosqueLogo size={24} />
            <div className="flex flex-col leading-tight">
              <span className="font-cinzel text-[10px] font-bold uppercase tracking-widest sm:text-xs" style={{ color: 'var(--accent-gold)' }}>
                MasjidScreen
              </span>
              <span className={isLight ? 'text-[9px] sm:text-[10px]' : 'text-[9px] text-white/50 sm:text-[10px]'} style={{ color: isLight ? 'var(--text-primary)' : undefined }}>
                {config.mosqueName.length > 30 ? config.mosqueName.slice(0, 30) + '...' : config.mosqueName}
              </span>
            </div>
          </div>
        )}

        {/* Center: Status (only when no info panel) */}
        {!showInfoPanel && (
          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 sm:flex">
            <div className={`status-dot ${activeMode === 'adhan' ? 'status-dot-adhan' : activeMode === 'iqomah' ? 'status-dot-iqomah' : 'status-dot-normal'}`} />
            <span className={`text-[10px] font-semibold uppercase tracking-wider sm:text-xs ${isLight ? '' : 'text-white/70'}`} style={{ color: isLight ? 'var(--text-primary)' : undefined }}>
              {activeMode === 'adhan' ? 'Adhan' : activeMode === 'iqomah' ? 'Iqomah' : 'Normal'}
            </span>
          </div>
        )}

        {/* Right: Clock (when info panel) or Controls */}
        {showInfoPanel ? (
          <div className="flex items-center gap-2">
            {config.clockType === 'digital' ? (
              <span
                className="font-bold leading-none sm:text-2xl lg:text-3xl"
                style={{
                  fontFamily: config.digitalFontFamily,
                  color: 'var(--accent-gold)',
                  ...(config.clockStyle === 'retro' ? {
                    textShadow: `0 0 10px var(--accent-gold), 0 0 20px var(--accent-gold)30`,
                    letterSpacing: '0.05em',
                  } : {}),
                }}
              >
                {formatTime(tzNow, config.showSeconds)}
              </span>
            ) : (
              <AnalogClockSVG
                size={56}
                hours={tzNow.getHours()}
                minutes={tzNow.getMinutes()}
                seconds={tzNow.getSeconds()}
                numberStyle={config.analogNumberStyle}
              />
            )}
            <div className="hidden flex-col items-end text-right sm:flex">
              <span
                className={isLight ? 'text-[10px] sm:text-xs' : 'text-[10px] text-white/60 sm:text-xs'}
                style={{
                  fontFamily: config.dateFontFamily,
                  fontSize: `calc(0.6rem * ${config.dateFontSize})`,
                  color: isLight ? 'var(--text-primary)' : (config.dateColor || '#ffffff'),
                }}
              >
                {formatDate(tzNow, language)}
              </span>
              {config.showHijri && (
                <span
                  className="font-amiri text-[9px] sm:text-[10px]"
                  style={{
                    color: isLight ? 'var(--accent-gold)' : (config.dateColor || 'var(--accent-gold)'),
                  }}
                >
                  {formatHijriDate(tzNow, language)}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {deviceId && (
              <div className={`hidden items-center gap-1.5 rounded-md border px-2.5 py-1 sm:flex ${isLight ? 'border-[var(--border-subtle)] bg-white/40' : 'border-white/10 bg-white/5'}`}>
                <span className={`text-[9px] font-medium uppercase tracking-wider ${isLight ? '' : 'text-white/40'}`} style={{ color: isLight ? 'var(--text-primary)' : undefined }}>ID Perangkat</span>
                <span className="font-mono text-sm font-bold tracking-wider" style={{ color: 'var(--accent-gold)' }}>
                  {deviceId.slice(0, 4)}
                </span>
              </div>
            )}
            <div className={`flex items-center rounded border overflow-hidden ${isLight ? 'border-[var(--border-subtle)]' : 'border-white/10'}`}>
              {(['id', 'ar', 'en'] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase transition-colors sm:px-2 sm:text-[10px] ${
                    language === l
                      ? isLight ? 'bg-[var(--accent-gold)]/15 text-[var(--text-primary)]' : 'bg-white/15 text-white'
                      : isLight ? 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]' : 'bg-transparent text-white/40 hover:text-white/60'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              onClick={toggleFullscreen}
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors sm:h-8 sm:w-8 ${isLight ? 'text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--text-primary)]' : 'text-white/40 hover:bg-white/10 hover:text-white/80'}`}
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                </svg>
              )}
            </button>
          </div>
        )}
      </header>

      {/* ======== MAIN DISPLAY AREA ======== */}
      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* ---- CENTER COLUMN: Main Content ---- */}
        {showInfoPanel ? (
          /* ═══ INFO PANEL LAYOUT: Full-screen info display ═══ */
          <div className="info-panel-fullscreen">
            <div className="info-panel-image-container">
              {currentInfoItem?.imageUrl && (
                <img
                  src={currentInfoItem.imageUrl}
                  alt={currentInfoItem.title}
                />
              )}

              {/* No image fallback - show text centered */}
              {!currentInfoItem?.imageUrl && currentInfoItem && (
                <div className="flex flex-col items-center justify-center gap-4 px-8">
                  <h2
                    className="text-center font-bold"
                    style={{
                      color: config.infoTitleFontColor,
                      fontSize: `calc(1.5rem * ${config.infoTitleFontSize})`,
                      fontFamily: config.infoTitleFontFamily,
                    }}
                  >
                    {currentInfoItem.title}
                  </h2>
                  {currentInfoItem.description && (
                    <p className="max-w-2xl text-center text-white/60" style={{ fontSize: `${config.infoDescriptionFontSize}rem`, fontFamily: config.infoDescriptionFontFamily }}>
                      {currentInfoItem.description}
                    </p>
                  )}
                </div>
              )}

              {/* Text overlay when image exists */}
              {currentInfoItem?.imageUrl && (
                config.infoTitlePosition === 'inside-image' ? (
                  <div className="info-overlay-inside-image">
                    <h2
                      className="font-bold drop-shadow-lg"
                      style={{
                        color: config.infoTitleFontColor,
                        fontSize: `calc(1rem * ${config.infoTitleFontSize})`,
                        fontFamily: config.infoTitleFontFamily,
                      }}
                    >
                      {currentInfoItem.title}
                    </h2>
                    {currentInfoItem.description && (
                      <p className="mt-1 text-white/70 drop-shadow" style={{ fontSize: `${config.infoDescriptionFontSize}rem`, fontFamily: config.infoDescriptionFontFamily }}>
                        {currentInfoItem.description}
                      </p>
                    )}
                  </div>
                ) : config.infoTitlePosition === 'top-left' ? (
                  <div className="info-overlay-top-left">
                    <h2
                      className="font-bold drop-shadow-lg"
                      style={{
                        color: config.infoTitleFontColor,
                        fontSize: `calc(0.8rem * ${config.infoTitleFontSize})`,
                        fontFamily: config.infoTitleFontFamily,
                      }}
                    >
                      {currentInfoItem.title}
                    </h2>
                    {currentInfoItem.description && (
                      <p className="mt-1 text-white/70 drop-shadow" style={{ fontSize: `${config.infoDescriptionFontSize * 0.8}rem`, fontFamily: config.infoDescriptionFontFamily }}>
                        {currentInfoItem.description}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="info-overlay-top-right">
                    <h2
                      className="font-bold drop-shadow-lg"
                      style={{
                        color: config.infoTitleFontColor,
                        fontSize: `calc(0.8rem * ${config.infoTitleFontSize})`,
                        fontFamily: config.infoTitleFontFamily,
                      }}
                    >
                      {currentInfoItem.title}
                    </h2>
                    {currentInfoItem.description && (
                      <p className="mt-1 text-white/70 drop-shadow" style={{ fontSize: `${config.infoDescriptionFontSize * 0.8}rem`, fontFamily: config.infoDescriptionFontFamily }}>
                        {currentInfoItem.description}
                      </p>
                    )}
                  </div>
                )
              )}

              {/* Pagination dots - position at bottom center */}
              {activeInfoItems.length > 1 && (
                <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
                  {activeInfoItems.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveInfoIndex(i)}
                      className={`h-2.5 w-2.5 rounded-full border border-white/20 transition-all ${
                        i === activeInfoIndex
                          ? 'scale-125 bg-amber-400 border-amber-400'
                          : 'bg-transparent hover:bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : layout === 'nabawi' ? (
          /* ═══ NABAWI LAYOUT: Left content area + Right sidebar prayer cards ═══ */
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Mosque name + Clock + Date */}
            <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden px-4 py-4 sm:gap-4 sm:px-8 sm:py-6 lg:gap-5 lg:px-10 lg:py-8">
              {/* Mosque Name */}
              <div className="text-center">
                <h1
                  className="font-amiri leading-tight sm:text-2xl lg:text-3xl"
                  style={{
                    color: 'var(--accent-gold)',
                    fontSize: `calc(1.25rem * ${config.mosqueNameFontSize})`,
                    fontFamily: "'Amiri', serif",
                  }}
                >
                  {config.mosqueNameArabic}
                </h1>
                <p
                  className={isLight ? 'mt-0.5 sm:text-sm lg:text-base' : 'mt-0.5 text-white/70 sm:text-sm lg:text-base'}
                  style={{
                    fontFamily: config.mosqueNameFontFamily,
                    fontSize: `calc(0.75rem * ${config.mosqueNameFontSize})`,
                    color: isLight ? 'var(--text-primary)' : undefined,
                  }}
                >
                  {config.mosqueName}
                </p>
              </div>

              {/* Clock */}
              {config.clockType === 'digital' ? (
                <div className="flex flex-col items-center">
                  <span
                    className={`clock-digital font-bold leading-none ${config.clockAnimation && config.clockAnimation !== 'none' ? `clock-animation-${config.clockAnimation}` : ''}`}
                    style={{
                      fontFamily: config.digitalFontFamily,
                      fontSize: `clamp(2rem, ${config.digitalFontSize}vw, ${config.digitalFontSize}rem)`,
                      color: 'var(--accent-gold)',
                      ...(config.clockStyle === 'retro' ? {
                        textShadow: isLight
                          ? `0 0 8px color-mix(in srgb, var(--accent-gold) 30%, transparent)`
                          : `0 0 10px var(--accent-gold), 0 0 30px var(--accent-gold)40, 0 0 60px var(--accent-gold)20`,
                        letterSpacing: '0.05em',
                      } : config.clockStyle === 'minimal' ? {
                        fontWeight: 300,
                        letterSpacing: '0.15em',
                        opacity: 0.9,
                      } : {}),
                    }}
                  >
                    {formatTime(tzNow, config.showSeconds)}
                  </span>
                </div>
              ) : (
                <AnalogClockSVG
                  size={Math.min(config.analogSize, 850)}
                  hours={tzNow.getHours()}
                  minutes={tzNow.getMinutes()}
                  seconds={tzNow.getSeconds()}
                  numberStyle={config.analogNumberStyle}
                />
              )}

              {/* Date Display */}
              <div
                className="flex flex-col items-center gap-0.5 text-center"
                style={{
                  opacity: config.dateOpacity ?? 0.85,
                }}
              >
                <p
                  className={isLight ? 'sm:text-xs lg:text-sm' : 'text-white/70 sm:text-xs lg:text-sm'}
                  style={{
                    fontFamily: config.dateFontFamily,
                    fontSize: `calc(0.7rem * ${config.dateFontSize})`,
                    color: isLight ? 'var(--text-primary)' : (config.dateColor || '#ffffff'),
                  }}
                >
                  {formatDate(tzNow, language)}
                </p>
                {config.showHijri && (
                  <p
                    className="font-amiri sm:text-xs lg:text-sm"
                    style={{
                      fontSize: `calc(0.7rem * ${config.dateFontSize})`,
                      color: isLight ? 'var(--accent-gold)' : (config.dateColor || 'var(--accent-gold)'),
                    }}
                  >
                    {formatHijriDate(tzNow, language)}
                  </p>
                )}
              </div>
            </div>

            {/* Vertical divider */}
            <div className="layout-vertical-divider" />

            {/* Right: Nabawi sidebar prayer cards */}
            <div className="nabawi-sidebar flex w-[280px] shrink-0 flex-col justify-center gap-2 overflow-y-auto p-3 sm:w-[320px]">
              {allPrayerStatuses.map(({ prayer, status, isNext }) => {
                const isActive = status === 'now'
                const isUpcomingNext = isNext && status === 'upcoming'
                const isPassed = status === 'passed'
                const isHighlighted = isActive || isUpcomingNext

                return (
                  <div
                    key={prayer.id}
                    className={`nabawi-prayer-card ${isHighlighted ? 'nabawi-prayer-card-active' : ''} ${isPassed ? 'nabawi-prayer-card-passed' : ''}`}
                  >
                    {/* Horizontal card: Arabic left, time right, Latin below */}
                    <div className="flex items-center justify-between">
                      <span className="font-amiri text-xl font-bold leading-tight" style={{ color: isLight ? 'var(--text-card)' : '#ffffff' }}>
                        {prayer.arabic}
                      </span>
                      <span className="font-mono text-xl font-bold" style={{ color: isLight ? 'var(--text-card)' : '#ffffff' }}>
                        {prayer.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-semibold" style={{ color: isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.7)' }}>
                        {prayer.latin}
                      </span>
                      {isHighlighted && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.5)' }}>
                          <span>Iqomah</span>
                          <span style={{ color: theme.accent }}>
                            {calculateIqomah(prayer.time, config.iqomahMinutes)}
                          </span>
                        </span>
                      )}
                    </div>
                    {isUpcomingNext && config.showCountdown && (
                      <div className="mt-1 text-center">
                        <span className={`font-mono text-sm font-bold tracking-wider ${isAlertMode ? 'blink-text' : ''}`} style={{ color: theme.accent }}>
                          {formatCountdown(countdownSeconds)}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : layout === 'makkah' ? (
          /* ═══ MAKKAH LAYOUT: Top prayer bar + Center content below ═══ */
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top prayer bar */}
            <div className="makkah-top-bar z-20 shrink-0 border-b px-3 py-3 sm:px-4 sm:py-3.5" style={{ fontSize: `${config.prayerCardFontSize}rem` }}>
              <div className="flex items-stretch justify-center gap-1.5 sm:gap-2 lg:gap-2.5">
                {allPrayerStatuses.map(({ prayer, status, isNext }) => {
                  const isActive = status === 'now'
                  const isUpcomingNext = isNext && status === 'upcoming'
                  const isPassed = status === 'passed'
                  const isHighlighted = isActive || isUpcomingNext

                  return (
                    <div
                      key={prayer.id}
                      className={`makkah-prayer-card ${isHighlighted ? 'makkah-prayer-card-active' : ''} ${isPassed ? 'makkah-prayer-card-passed' : ''}`}
                    >
                      {/* Vertical card: Arabic top, Latin middle, time bottom */}
                      <span className="font-amiri text-lg font-bold leading-tight sm:text-xl lg:text-2xl" style={{ color: isLight ? 'var(--text-card)' : '#ffffff' }}>
                        {prayer.arabic}
                      </span>
                      <span className="text-xs font-semibold sm:text-sm lg:text-base" style={{ color: isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.8)' }}>
                        {prayer.latin}
                      </span>
                      <span className="font-mono text-lg font-bold sm:text-xl lg:text-2xl" style={{ color: isLight ? 'var(--text-card)' : '#ffffff', textShadow: isHighlighted ? `0 0 15px color-mix(in srgb, ${theme.accent} 50%, transparent)` : undefined }}>
                        {prayer.time}
                      </span>
                      {isHighlighted && (
                        <span className="flex items-center gap-1 text-[10px] sm:text-xs" style={{ color: isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.5)' }}>
                          <span>Iqomah</span>
                          <span style={{ color: theme.accent }}>{calculateIqomah(prayer.time, config.iqomahMinutes)}</span>
                        </span>
                      )}
                      {isUpcomingNext && config.showCountdown && (
                        <span className={`mt-0.5 font-mono text-xs font-bold tracking-wider sm:text-sm ${isAlertMode ? 'blink-text' : ''}`} style={{ color: theme.accent }}>
                          {formatCountdown(countdownSeconds)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Horizontal divider */}
            <div className="layout-horizontal-divider" />

            {/* Center: Mosque name + Clock + Date */}
            <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden px-4 py-4 sm:gap-4 sm:px-8 sm:py-6 lg:gap-5 lg:px-10 lg:py-8">
              {/* Mosque Name */}
              <div className="text-center">
                <h1
                  className="font-amiri leading-tight sm:text-2xl lg:text-3xl"
                  style={{
                    color: 'var(--accent-gold)',
                    fontSize: `calc(1.25rem * ${config.mosqueNameFontSize})`,
                    fontFamily: "'Amiri', serif",
                  }}
                >
                  {config.mosqueNameArabic}
                </h1>
                <p
                  className={isLight ? 'mt-0.5 sm:text-sm lg:text-base' : 'mt-0.5 text-white/70 sm:text-sm lg:text-base'}
                  style={{
                    fontFamily: config.mosqueNameFontFamily,
                    fontSize: `calc(0.75rem * ${config.mosqueNameFontSize})`,
                    color: isLight ? 'var(--text-primary)' : undefined,
                  }}
                >
                  {config.mosqueName}
                </p>
              </div>

              {/* Clock */}
              {config.clockType === 'digital' ? (
                <div className="flex flex-col items-center">
                  <span
                    className={`clock-digital font-bold leading-none ${config.clockAnimation && config.clockAnimation !== 'none' ? `clock-animation-${config.clockAnimation}` : ''}`}
                    style={{
                      fontFamily: config.digitalFontFamily,
                      fontSize: `clamp(2rem, ${config.digitalFontSize}vw, ${config.digitalFontSize}rem)`,
                      color: 'var(--accent-gold)',
                      ...(config.clockStyle === 'retro' ? {
                        textShadow: isLight
                          ? `0 0 8px color-mix(in srgb, var(--accent-gold) 30%, transparent)`
                          : `0 0 10px var(--accent-gold), 0 0 30px var(--accent-gold)40, 0 0 60px var(--accent-gold)20`,
                        letterSpacing: '0.05em',
                      } : config.clockStyle === 'minimal' ? {
                        fontWeight: 300,
                        letterSpacing: '0.15em',
                        opacity: 0.9,
                      } : {}),
                    }}
                  >
                    {formatTime(tzNow, config.showSeconds)}
                  </span>
                </div>
              ) : (
                <AnalogClockSVG
                  size={Math.min(config.analogSize, 850)}
                  hours={tzNow.getHours()}
                  minutes={tzNow.getMinutes()}
                  seconds={tzNow.getSeconds()}
                  numberStyle={config.analogNumberStyle}
                />
              )}

              {/* Date Display */}
              <div
                className="flex flex-col items-center gap-0.5 text-center"
                style={{
                  opacity: config.dateOpacity ?? 0.85,
                }}
              >
                <p
                  className={isLight ? 'sm:text-xs lg:text-sm' : 'text-white/70 sm:text-xs lg:text-sm'}
                  style={{
                    fontFamily: config.dateFontFamily,
                    fontSize: `calc(0.7rem * ${config.dateFontSize})`,
                    color: isLight ? 'var(--text-primary)' : (config.dateColor || '#ffffff'),
                  }}
                >
                  {formatDate(tzNow, language)}
                </p>
                {config.showHijri && (
                  <p
                    className="font-amiri sm:text-xs lg:text-sm"
                    style={{
                      fontSize: `calc(0.7rem * ${config.dateFontSize})`,
                      color: isLight ? 'var(--accent-gold)' : (config.dateColor || 'var(--accent-gold)'),
                    }}
                  >
                    {formatHijriDate(tzNow, language)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : layout === 'cordoba' ? (
          /* ═══ CORDOBA LAYOUT: Split left (55%) + right (45%) ═══ */
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Mosque name + Clock + Date */}
            <div className="cordoba-split-left flex flex-[55] flex-col items-center justify-center gap-3 overflow-hidden px-4 py-4 sm:gap-4 sm:px-8 sm:py-6 lg:gap-5 lg:px-10 lg:py-8">
              {/* Mosque Name */}
              <div className="text-center">
                <h1
                  className="font-amiri leading-tight sm:text-2xl lg:text-3xl"
                  style={{
                    color: 'var(--accent-gold)',
                    fontSize: `calc(1.25rem * ${config.mosqueNameFontSize})`,
                    fontFamily: "'Amiri', serif",
                  }}
                >
                  {config.mosqueNameArabic}
                </h1>
                <p
                  className={isLight ? 'mt-0.5 sm:text-sm lg:text-base' : 'mt-0.5 text-white/70 sm:text-sm lg:text-base'}
                  style={{
                    fontFamily: config.mosqueNameFontFamily,
                    fontSize: `calc(0.75rem * ${config.mosqueNameFontSize})`,
                    color: isLight ? 'var(--text-primary)' : undefined,
                  }}
                >
                  {config.mosqueName}
                </p>
              </div>

              {/* Clock */}
              {config.clockType === 'digital' ? (
                <div className="flex flex-col items-center">
                  <span
                    className={`clock-digital font-bold leading-none ${config.clockAnimation && config.clockAnimation !== 'none' ? `clock-animation-${config.clockAnimation}` : ''}`}
                    style={{
                      fontFamily: config.digitalFontFamily,
                      fontSize: `clamp(2rem, ${config.digitalFontSize}vw, ${config.digitalFontSize}rem)`,
                      color: 'var(--accent-gold)',
                      ...(config.clockStyle === 'retro' ? {
                        textShadow: isLight
                          ? `0 0 8px color-mix(in srgb, var(--accent-gold) 30%, transparent)`
                          : `0 0 10px var(--accent-gold), 0 0 30px var(--accent-gold)40, 0 0 60px var(--accent-gold)20`,
                        letterSpacing: '0.05em',
                      } : config.clockStyle === 'minimal' ? {
                        fontWeight: 300,
                        letterSpacing: '0.15em',
                        opacity: 0.9,
                      } : {}),
                    }}
                  >
                    {formatTime(tzNow, config.showSeconds)}
                  </span>
                </div>
              ) : (
                <AnalogClockSVG
                  size={Math.min(config.analogSize, 850)}
                  hours={tzNow.getHours()}
                  minutes={tzNow.getMinutes()}
                  seconds={tzNow.getSeconds()}
                  numberStyle={config.analogNumberStyle}
                />
              )}

              {/* Date Display */}
              <div
                className="flex flex-col items-center gap-0.5 text-center"
                style={{
                  opacity: config.dateOpacity ?? 0.85,
                }}
              >
                <p
                  className={isLight ? 'sm:text-xs lg:text-sm' : 'text-white/70 sm:text-xs lg:text-sm'}
                  style={{
                    fontFamily: config.dateFontFamily,
                    fontSize: `calc(0.7rem * ${config.dateFontSize})`,
                    color: isLight ? 'var(--text-primary)' : (config.dateColor || '#ffffff'),
                  }}
                >
                  {formatDate(tzNow, language)}
                </p>
                {config.showHijri && (
                  <p
                    className="font-amiri sm:text-xs lg:text-sm"
                    style={{
                      fontSize: `calc(0.7rem * ${config.dateFontSize})`,
                      color: isLight ? 'var(--accent-gold)' : (config.dateColor || 'var(--accent-gold)'),
                    }}
                  >
                    {formatHijriDate(tzNow, language)}
                  </p>
                )}
              </div>
            </div>

            {/* Vertical divider */}
            <div className="layout-vertical-divider" />

            {/* Right: Cordoba prayer cards in scrollable list */}
            <div className="cordoba-split-right flex flex-[45] flex-col justify-center gap-2.5 overflow-y-auto p-4" style={{ fontSize: `${config.prayerCardFontSize}rem` }}>
              {allPrayerStatuses.map(({ prayer, status, isNext }) => {
                const isActive = status === 'now'
                const isUpcomingNext = isNext && status === 'upcoming'
                const isPassed = status === 'passed'
                const isHighlighted = isActive || isUpcomingNext

                return (
                  <div
                    key={prayer.id}
                    className={`cordoba-prayer-card flex items-center justify-between ${isHighlighted ? 'cordoba-prayer-card-active' : ''} ${isPassed ? 'cordoba-prayer-card-passed' : ''}`}
                  >
                    {/* Left: Arabic + Latin */}
                    <div className="flex min-w-0 flex-col">
                      <span className="font-amiri text-lg font-bold leading-tight sm:text-xl" style={{ color: isLight ? 'var(--text-card)' : '#ffffff' }}>
                        {prayer.arabic}
                      </span>
                      <span className="text-xs font-semibold sm:text-sm" style={{ color: isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.7)' }}>
                        {prayer.latin}
                      </span>
                    </div>
                    {/* Right: Time + Iqomah */}
                    <div className="flex shrink-0 flex-col items-end">
                      <span className="font-mono text-lg font-bold sm:text-xl" style={{ color: isLight ? 'var(--text-card)' : '#ffffff' }}>
                        {prayer.time}
                      </span>
                      {isHighlighted && (
                        <span className="text-xs" style={{ color: theme.accent }}>
                          Iqomah {calculateIqomah(prayer.time, config.iqomahMinutes)}
                        </span>
                      )}
                      {isUpcomingNext && config.showCountdown && (
                        <span className={`mt-0.5 font-mono text-xs font-bold tracking-wider ${isAlertMode ? 'blink-text' : ''}`} style={{ color: theme.accent }}>
                          {formatCountdown(countdownSeconds)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* ═══ DEFAULT LAYOUT: Mosque name + Clock + Date ═══ */
          <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden px-4 py-4 sm:gap-4 sm:px-8 sm:py-6 lg:gap-5 lg:px-10 lg:py-8">
            {/* Mosque Name */}
            <div className="text-center">
              <h1
                className="font-amiri leading-tight sm:text-2xl lg:text-3xl"
                style={{
                  color: 'var(--accent-gold)',
                  fontSize: `calc(1.25rem * ${config.mosqueNameFontSize})`,
                  fontFamily: "'Amiri', serif",
                }}
              >
                {config.mosqueNameArabic}
              </h1>
              <p
                className={isLight ? 'mt-0.5 sm:text-sm lg:text-base' : 'mt-0.5 text-white/70 sm:text-sm lg:text-base'}
                style={{
                  fontFamily: config.mosqueNameFontFamily,
                  fontSize: `calc(0.75rem * ${config.mosqueNameFontSize})`,
                  color: isLight ? 'var(--text-primary)' : undefined,
                }}
              >
                {config.mosqueName}
              </p>
            </div>

            {/* Clock */}
            {config.clockType === 'digital' ? (
              <div className="flex flex-col items-center">
                <span
                  className={`clock-digital font-bold leading-none ${config.clockAnimation && config.clockAnimation !== 'none' ? `clock-animation-${config.clockAnimation}` : ''}`}
                  style={{
                    fontFamily: config.digitalFontFamily,
                    fontSize: `clamp(2rem, ${config.digitalFontSize}vw, ${config.digitalFontSize}rem)`,
                    color: 'var(--accent-gold)',
                    ...(config.clockStyle === 'retro' ? {
                      textShadow: isLight
                        ? `0 0 8px color-mix(in srgb, var(--accent-gold) 30%, transparent)`
                        : `0 0 10px var(--accent-gold), 0 0 30px var(--accent-gold)40, 0 0 60px var(--accent-gold)20`,
                      letterSpacing: '0.05em',
                    } : config.clockStyle === 'minimal' ? {
                      fontWeight: 300,
                      letterSpacing: '0.15em',
                      opacity: 0.9,
                    } : {}),
                  }}
                >
                  {formatTime(tzNow, config.showSeconds)}
                </span>
              </div>
            ) : (
              <AnalogClockSVG
                size={Math.min(config.analogSize, 850)}
                hours={tzNow.getHours()}
                minutes={tzNow.getMinutes()}
                seconds={tzNow.getSeconds()}
                numberStyle={config.analogNumberStyle}
              />
            )}

            {/* Date Display */}
            <div
              className="flex flex-col items-center gap-0.5 text-center"
              style={{
                opacity: config.dateOpacity ?? 0.85,
              }}
            >
              <p
                className={isLight ? 'sm:text-xs lg:text-sm' : 'text-white/70 sm:text-xs lg:text-sm'}
                style={{
                  fontFamily: config.dateFontFamily,
                  fontSize: `calc(0.7rem * ${config.dateFontSize})`,
                  color: isLight ? 'var(--text-primary)' : (config.dateColor || '#ffffff'),
                }}
              >
                {formatDate(tzNow, language)}
              </p>
              {config.showHijri && (
                <p
                  className="font-amiri sm:text-xs lg:text-sm"
                  style={{
                    fontSize: `calc(0.7rem * ${config.dateFontSize})`,
                    color: isLight ? 'var(--accent-gold)' : (config.dateColor || 'var(--accent-gold)'),
                  }}
                >
                  {formatHijriDate(tzNow, language)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ======== BOTTOM PRAYER SCHEDULE BAR (default layout only) ======== */}
        {layout === 'default' && (
        <div
          className={`z-20 shrink-0 border-t px-3 py-3.5 sm:px-4 sm:py-4 min-h-[75px] sm:min-h-[90px] lg:min-h-[100px] ${isLight ? 'tv-prayer-bar-light' : 'border-white/10 bg-black/30'}`}
          style={{
            fontSize: `${config.prayerCardFontSize}rem`,
            ...(config.theme === 'custom' && config.customBackgroundImage
              ? { backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }
              : {}),
          }}
        >
          <div className="flex items-stretch gap-1.5 sm:gap-2 lg:gap-2.5">
            {allPrayerStatuses.map(({ prayer, status, isNext }) => {
              const isActive = status === 'now'
              const isUpcomingNext = isNext && status === 'upcoming'
              const isPassed = status === 'passed'
              const isHighlighted = isActive || isUpcomingNext

              return (
                <div
                  key={prayer.id}
                  className={`relative flex items-center justify-between rounded-xl border transition-all duration-300 overflow-hidden ${isLight ? (isHighlighted ? 'tv-prayer-card-light-highlight' : 'tv-prayer-card-light') : ''} ${
                    isHighlighted
                      ? 'flex-[2] sm:flex-[1.8]'
                      : 'flex-1'
                  } ${
                    isHighlighted
                      ? 'px-5 py-4 sm:px-7 sm:py-5'
                      : 'px-4 py-3 sm:px-5 sm:py-4'
                  }`}
                  style={
                    isLight
                      ? { opacity: isPassed ? 0.4 : 1 }
                      : !isActive && !isUpcomingNext
                        ? {
                            backgroundColor: (config.theme === 'custom' && config.customBackgroundImage)
                              ? 'rgba(0, 0, 0, 0.75)'
                              : config.cardBgColor,
                            borderColor: (config.theme === 'custom' && config.customBackgroundImage)
                              ? 'rgba(255, 255, 255, 0.2)'
                              : config.cardBorderColor,
                            opacity: isPassed ? 0.45 : 1,
                            ...(config.theme === 'custom' && config.customBackgroundImage
                              ? { backdropFilter: 'blur(8px)' }
                              : {}),
                          }
                        : {
                            opacity: isPassed ? 0.45 : 1,
                            backgroundColor: isHighlighted
                              ? `color-mix(in srgb, ${theme.accent} 12%, transparent)`
                              : undefined,
                            borderColor: isHighlighted
                              ? `color-mix(in srgb, ${theme.accent} 35%, transparent)`
                              : config.cardBorderColor,
                            boxShadow: isHighlighted
                              ? `0 0 20px color-mix(in srgb, ${theme.accent} 25%, transparent), 0 0 40px color-mix(in srgb, ${theme.accent} 10%, transparent), inset 0 0 25px color-mix(in srgb, ${theme.accent} 8%, transparent)`
                              : undefined,
                            ...(config.theme === 'custom' && config.customBackgroundImage
                              ? { backdropFilter: 'blur(8px)' }
                              : {}),
                          }
                  }
                >
                  {/* Left: Names (Arabic + Latin) */}
                  <div className="flex flex-col justify-center min-w-0 flex-1">
                    <span
                      className={`font-amiri leading-tight font-bold ${
                        isHighlighted
                          ? 'text-xl sm:text-2xl lg:text-3xl'
                          : 'text-lg sm:text-xl lg:text-2xl'
                      }`}
                      style={{
                        color: isLight ? 'var(--text-card)' : '#ffffff',
                        opacity: isPassed ? 0.45 : 1,
                      }}
                    >
                      {prayer.arabic}
                    </span>
                    <span
                      className={`font-semibold ${
                        isHighlighted ? 'text-sm sm:text-base lg:text-xl' : 'text-xs sm:text-sm lg:text-base'
                      } ${isLight ? '' : 'text-white/80'}`}
                      style={{ opacity: isPassed ? 0.45 : (isLight ? 0.7 : 0.85), color: isLight ? 'var(--text-primary)' : undefined }}
                    >
                      {prayer.latin}
                    </span>
                    {/* Iqomah - only for highlighted card */}
                    {isHighlighted && (
                      <span className={`mt-1 flex items-center gap-1 text-[11px] sm:text-xs lg:text-sm ${isLight ? '' : 'text-white/40'}`} style={{ color: isLight ? 'var(--text-primary)' : undefined }}>
                        <span>Iqomah</span>
                        <span style={{ color: theme.accent }}>
                          {calculateIqomah(prayer.time, config.iqomahMinutes)}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Right: Time */}
                  <div className="flex flex-col items-end justify-center shrink-0 ml-2">
                    <span
                      className={`font-mono font-bold ${
                        isHighlighted ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-lg sm:text-xl lg:text-2xl'
                      }`}
                      style={{
                        color: isLight ? 'var(--text-card)' : '#ffffff',
                        opacity: isPassed ? 0.45 : 1,
                        textShadow: isHighlighted ? `0 0 15px color-mix(in srgb, ${theme.accent} 50%, transparent)` : undefined,
                      }}
                    >
                      {prayer.time}
                    </span>
                    {/* Countdown - only for next upcoming prayer */}
                    {isUpcomingNext && config.showCountdown && (
                      <span
                        className={`mt-1 font-mono text-sm font-bold tracking-wider sm:text-base lg:text-xl ${isAlertMode ? 'blink-text' : ''}`}
                        style={{
                          color: theme.accent,
                        }}
                      >
                        {formatCountdown(countdownSeconds)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        )}
      </main>

      {/* ======== RUNNING TEXT BAR ======== */}
      {config.showAnnouncement && config.announcement && (
        <footer className={`relative z-50 min-h-[36px] shrink-0 border-t sm:min-h-[40px] ${isLight ? 'tv-footer-light' : 'border-white/5'}`}>
          <div className={`running-text-container absolute inset-0 flex items-center px-4 ${isLight ? 'tv-footer-light' : ''}`} style={{ backgroundColor: isLight ? 'color-mix(in srgb, var(--accent-gold) 8%, #F5F5F0)' : 'color-mix(in srgb, var(--accent-gold) 8%, #050505)' }}>
            <div
              className={`inline-block whitespace-nowrap text-xs font-medium sm:text-sm ${
                config.runningAnimation === 'scroll-left'
                  ? 'running-text-scroll-left'
                  : config.runningAnimation === 'scroll-right'
                    ? 'running-text-scroll-right'
                    : config.runningAnimation === 'alternate'
                      ? 'running-text-alternate'
                      : 'running-text-fade'
              }`}
              style={{
                color: isLight ? 'var(--text-primary)' : 'var(--accent-gold)',
                animationDuration: `${config.runningSpeed}s`,
                fontFamily: config.runningFontFamily || "'Inter', sans-serif",
                fontSize: `${(config.runningFontSize || 1)}rem`,
              }}
            >
              {config.announcement}
            </div>
          </div>
        </footer>
      )}

      {/* ======== ADHAN OVERLAY ======== */}
      {activeMode === 'adhan' && activePrayer && (
        <div className={isLight ? 'adhan-mode-light' : 'adhan-mode-active'}>
          {/* Close preview button */}
          {previewMode === 'adhan' && (
            <button
              onClick={() => setPreviewMode('none')}
              className={`absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isLight ? 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black/70' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
          {/* Decorative top line */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, transparent, var(--accent-gold), transparent)' }} />

          {/* Subtitle: "Menantikan Adzan" */}
          <div className={isLight ? 'adhan-light-text-latin font-cinzel' : 'adhan-text-latin font-cinzel'}>Menantikan Adzan</div>

          {/* Prayer name Arabic - BIGGER */}
          <div className={isLight ? 'adhan-light-text-arabic font-amiri' : 'adhan-text-arabic font-amiri'}>{activePrayer.arabic}</div>

          {/* Prayer name Latin - BIGGER */}
          <div className={isLight ? 'adhan-light-text-latin-prayer' : 'adhan-text-latin-prayer'}>{activePrayer.latin}</div>

          {/* Countdown - SMALLER, with animation */}
          <div className={`font-mono adhan-countdown-animation-${config.adhanCountdownAnimation} ${isLight ? 'adhan-light-countdown' : 'adhan-countdown'}`} style={{ fontFamily: config.iqomahFontFamily }}>
            {formatCountdown(adhanCountdown)}
          </div>

          {/* Label */}
          <div className={`mt-4 text-xs font-medium uppercase tracking-widest ${isLight ? 'text-black/25' : 'text-white/30'}`}>
            {language === 'ar' ? 'متبقي لصلاة' : language === 'en' ? 'Time remaining for' : 'Menuju waktu'}
          </div>
        </div>
      )}

      {/* ======== IQOMAH OVERLAY ======== */}
      {activeMode === 'iqomah' && activePrayer && (
        <div className="iqomah-mode-active">
          {/* Close preview button */}
          {previewMode === 'iqomah' && (
            <button
              onClick={() => setPreviewMode('none')}
              className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
          {/* Decorative top line */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }} />

          {/* Label */}
          <div className="iqomah-label font-cinzel">I Q O M A H</div>

          {/* Prayer name */}
          <div className="iqomah-prayer-name font-amiri">{activePrayer.arabic}</div>

          {/* Countdown */}
          <div
            className={`iqomah-countdown-display iqomah-countdown-animation-${config.iqomahCountdownAnimation || 'pulse'}`}
            style={{ fontFamily: config.iqomahFontFamily, fontSize: `clamp(4rem, ${config.iqomahFontSize}vw, ${config.iqomahFontSize}rem)` }}
          >
            {formatCountdown(iqomahCountdown, false)}
          </div>

          {/* Beep indicator in last 60s */}
          {iqomahCountdown <= 60 && (
            <div className="mt-4 flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="text-xs font-medium text-red-400/70">
                {language === 'ar' ? 'تنبيه صوتي' : language === 'en' ? 'Audio Alert' : 'Peringatan Suara'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ======== POST-IQOMAH OVERLAY (Elegant Prayer Screen) ======== */}
      {activeMode === 'post-iqomah' && activePrayer && (
        <PostIqomahScreen
          activePrayer={activePrayer}
          mosqueName={config.mosqueName}
          mosqueNameArabic={config.mosqueNameArabic}
          now={tzNow}
          language={language}
          formatDate={formatDate}
          formatHijriDate={formatHijriDate}
          formatTime={formatTime}
          showSeconds={config.showSeconds}
          hadithCollection={(config.hadithCollection || []).filter((h) => h.active)}
          previewMode={previewMode}
          onClosePreview={() => setPreviewMode('none')}
          digitalFontFamily={config.digitalFontFamily}
          showHijri={config.showHijri}
        />
      )}
    </div>
  )
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

/** Elegant Post-Iqomah Prayer Screen with Hadith rotation */
function PostIqomahScreen({
  activePrayer,
  mosqueName,
  mosqueNameArabic,
  now,
  language,
  formatDate,
  formatHijriDate,
  formatTime,
  showSeconds,
  hadithCollection,
  previewMode,
  onClosePreview,
  digitalFontFamily,
  showHijri,
}: {
  activePrayer: PrayerTime
  mosqueName: string
  mosqueNameArabic: string
  now: Date
  language: Lang
  formatDate: (d: Date, l: Lang) => string
  formatHijriDate: (d: Date, l: Lang) => string
  formatTime: (d: Date, s: boolean) => string
  showSeconds: boolean
  hadithCollection: Array<{ id: string; type: 'hadith' | 'ayat'; arabic: string; meaning: string; source: string }>
  previewMode: string
  onClosePreview: () => void
  digitalFontFamily: string
  showHijri: boolean
}) {
  const [hadithIndex, setHadithIndex] = useState(0)
  const [fadeOpacity, setFadeOpacity] = useState(1)

  // Rotate hadith every 12 seconds
  useEffect(() => {
    if (hadithCollection.length <= 1) return
    const timer = setInterval(() => {
      setFadeOpacity(0)
      setTimeout(() => {
        setHadithIndex((prev) => (prev + 1) % hadithCollection.length)
        setFadeOpacity(1)
      }, 400)
    }, 12000)
    return () => clearInterval(timer)
  }, [hadithCollection.length])

  const currentHadith = hadithCollection[hadithIndex] || null

  // Format time with individual digits for blinking colon effect
  const timeStr = formatTime(now, showSeconds)
  const timeParts = timeStr.split(':')

  return (
    <div className="post-iqomah-mode-active">
      {/* Close preview button */}
      {previewMode === 'post-iqomah' && (
        <button
          onClick={onClosePreview}
          className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, transparent, var(--accent-gold), transparent)' }} />

      {/* Mosque Name at top */}
      <div className="text-center">
        <div className="post-iqomah-mosque-name-ar">{mosqueNameArabic}</div>
        <div className="post-iqomah-mosque-name">{mosqueName}</div>
      </div>

      {/* Greeting */}
      <div className="post-iqomah-greeting">
        Selamat Menunaikan Ibadah Shalat
      </div>

      {/* Prayer Name Section */}
      <div className="post-iqomah-prayer-section">
        <div className="post-iqomah-calligraphy-ar">{activePrayer.arabic}</div>
        <div className="post-iqomah-dots">
          <span className="post-iqomah-dot" />
          <span className="post-iqomah-dot" />
          <span className="post-iqomah-dot" />
        </div>
        <div className="post-iqomah-prayer-latin">{activePrayer.latin}</div>
      </div>

      {/* Time Display */}
      <div className="post-iqomah-time-section">
        <span className="post-iqomah-time-label">
          {language === 'ar' ? 'الوقت الآن' : language === 'en' ? 'Current Time' : 'Waktu Sekarang'}
        </span>
        <div className="post-iqomah-digital-time" style={{ fontFamily: digitalFontFamily }}>
          {timeParts.map((part, i) => (
            <span key={i}>
              {part.split('').map((ch, j) => (
                <span key={j}>{ch}</span>
              ))}
              {i < timeParts.length - 1 && (
                <span className="post-iqomah-time-colon">:</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Date Display */}
      <div className="post-iqomah-date-section">
        <div>
          <p className="post-iqomah-date-masehi">{formatDate(now, language)}</p>
        </div>
        {showHijri && (
          <>
            <div className="post-iqomah-date-separator" />
            <div>
              <p className="post-iqomah-date-hijri">{formatHijriDate(now, language)}</p>
            </div>
          </>
        )}
      </div>

      {/* Hadith / Ayat Card */}
      {currentHadith && (
        <div className="post-iqomah-hadith-card">
          <div className="post-iqomah-hadith-header">
            <div className="post-iqomah-hadith-icon">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <span className="post-iqomah-hadith-title">
              {currentHadith.type === 'ayat' ? 'Ayat Al-Quran' : 'Hadits Pilihan'}
            </span>
          </div>
          <p
            className="post-iqomah-hadith-arabic"
            style={{ opacity: fadeOpacity }}
          >
            {currentHadith.arabic}
          </p>
          <p
            className="post-iqomah-hadith-meaning"
            style={{ opacity: fadeOpacity }}
          >
            {currentHadith.meaning}
          </p>
          <p
            className="post-iqomah-hadith-source"
            style={{ opacity: fadeOpacity }}
          >
            {currentHadith.source}
          </p>
        </div>
      )}
    </div>
  )
}

/** Mosque dome + minaret SVG logo */
function MosqueLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 48 40"
      width={size}
      height={size * (40 / 48)}
      fill="currentColor"
      style={{ color: 'var(--accent-gold)' }}
    >
      {/* Base */}
      <rect x="6" y="28" width="36" height="10" rx="1.5" />
      {/* Main body */}
      <rect x="8" y="22" width="32" height="7" rx="0.5" />
      {/* Dome */}
      <path d="M12 22 C12 10, 36 10, 36 22" />
      {/* Crescent on top */}
      <circle cx="24" cy="10" r="3.5" />
      <circle cx="25.5" cy="9" r="3" fill="#050505" />
      {/* Left minaret */}
      <rect x="2" y="10" width="4" height="28" rx="1" />
      <path d="M2 10 Q4 4 6 10" />
      <rect x="1" y="9" width="6" height="2" rx="1" />
      {/* Right minaret */}
      <rect x="42" y="10" width="4" height="28" rx="1" />
      <path d="M42 10 Q44 4 46 10" />
      <rect x="41" y="9" width="6" height="2" rx="1" />
    </svg>
  )
}

/** SVG analog clock face with configurable number style */
function AnalogClockSVG({
  size,
  hours,
  minutes,
  seconds,
  numberStyle,
}: {
  size: number
  hours: number
  minutes: number
  seconds: number
  numberStyle: 'arabic' | 'roman' | 'hindi'
}) {
  const cx = 150
  const cy = 150
  const outerR = 140
  const innerR = 130
  const numberR = 108
  const hourHandLen = 70
  const minuteHandLen = 95
  const secondHandLen = 105

  const numbers = ANALOG_NUMBERS[numberStyle]
  const hourAngle = ((hours % 12) + minutes / 60 + seconds / 3600) * 30
  const minuteAngle = (minutes + seconds / 60) * 6
  const secondAngle = seconds * 6

  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180

  return (
    <svg viewBox="0 0 300 300" width={size} height={size} className="analog-clock">
      {/* Outer circle */}
      <circle
        cx={cx}
        cy={cy}
        r={outerR}
        stroke="var(--accent-gold)"
        strokeWidth="2"
        fill="rgba(5,5,5,0.8)"
      />
      <circle
        cx={cx}
        cy={cy}
        r={outerR - 3}
        stroke="var(--accent-gold)"
        strokeWidth="0.5"
        fill="none"
        opacity="0.3"
      />

      {/* Tick marks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const angle = toRad(i * 6)
        const isHour = i % 5 === 0
        const r1 = isHour ? innerR - 12 : innerR - 5
        const r2 = innerR
        return (
          <line
            key={`tick-${i}`}
            x1={cx + r1 * Math.cos(angle)}
            y1={cy + r1 * Math.sin(angle)}
            x2={cx + r2 * Math.cos(angle)}
            y2={cy + r2 * Math.sin(angle)}
            stroke="var(--accent-gold)"
            strokeWidth={isHour ? 2.5 : 0.8}
            opacity={isHour ? 0.9 : 0.3}
            strokeLinecap="round"
          />
        )
      })}

      {/* Hour numbers */}
      {numbers.map((num, i) => {
        const angle = toRad(i * 30)
        return (
          <text
            key={`num-${i}`}
            x={cx + numberR * Math.cos(angle)}
            y={cy + numberR * Math.sin(angle)}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--accent-gold)"
            fontSize={numberStyle === 'roman' ? 13 : numberStyle === 'hindi' ? 16 : 18}
            fontFamily="'Cormorant Garamond', serif"
            fontWeight="600"
          >
            {num}
          </text>
        )
      })}

      {/* Hour hand */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + hourHandLen * Math.cos(toRad(hourAngle))}
        y2={cy + hourHandLen * Math.sin(toRad(hourAngle))}
        stroke="var(--accent-gold)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Minute hand */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + minuteHandLen * Math.cos(toRad(minuteAngle))}
        y2={cy + minuteHandLen * Math.sin(toRad(minuteAngle))}
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Second hand */}
      <line
        x1={cx - 15 * Math.cos(toRad(secondAngle))}
        y1={cy - 15 * Math.sin(toRad(secondAngle))}
        x2={cx + secondHandLen * Math.cos(toRad(secondAngle))}
        y2={cy + secondHandLen * Math.sin(toRad(secondAngle))}
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r="6" fill="var(--accent-gold)" />
      <circle cx={cx} cy={cy} r="2.5" fill="#050505" />
    </svg>
  )
}
