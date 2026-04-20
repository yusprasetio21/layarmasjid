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
function formatCountdown(totalSeconds: number): string {
  if (totalSeconds < 0) totalSeconds = 0
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
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

  // ---- Refs ----
  const lastBeepSecond = useRef(-1)

  // ---- Derived: Theme ----
  const theme = THEMES[config.theme]

  // ---- Derived: Main prayers sorted by time (for adhan/iqomah/overlay logic) ----
  const mainPrayers = [...config.prayerTimesTemplate]
    .filter((p) => p.isMain)
    .sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time))

  // ---- Derived: All prayers sorted by time (for bottom bar) ----
  const allPrayers = [...config.prayerTimesTemplate]
    .sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time))

  // ---- Derived: Current seconds since midnight ----
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()

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

  // ---- Derived: Active mode (normal / adhan / iqomah) ----
  let activeMode: 'normal' | 'adhan' | 'iqomah' = 'normal'
  for (const prayer of mainPrayers) {
    const ps = timeToSeconds(prayer.time)
    const adhanStart = ps - config.adhanDuration
    const iqomahEnd = ps + config.iqomahMinutes * 60

    if (config.adhanModeEnabled && currentSeconds >= adhanStart && currentSeconds < ps) {
      activeMode = 'adhan'
      break
    }
    if (config.iqomahModeEnabled && currentSeconds >= ps && currentSeconds < iqomahEnd) {
      activeMode = 'iqomah'
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
      if (currentSeconds >= adhanStart && currentSeconds < iqomahEnd) {
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
  }

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
      } else if (iqomahCountdown <= 60 && iqomahCountdown > 10 && iqomahCountdown % 10 === 0 && iqomahCountdown !== lastBeepSecond.current) {
        lastBeepSecond.current = iqomahCountdown
        playBeep(800, 200)
      }
    }
  }, [iqomahCountdown, activeMode, config.iqomahBeepEnabled, config.soundEnabled])

  // ---- Effect: Fullscreen change listener ----
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

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
          ...(config.theme === 'custom' ? {
            '--accent-gold': config.customThemeAccent || '#C9A84C',
          } : {}),
        } as React.CSSProperties
      }
    >
      {/* ======== HEADER BAR ======== */}
      <header className="relative z-50 flex h-11 shrink-0 items-center justify-between border-b border-white/5 bg-black/60 px-3 backdrop-blur-sm sm:h-12 sm:px-5">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mosque Logo SVG */}
          <MosqueLogo size={24} />
          <div className="flex flex-col leading-tight">
            <span className="font-cinzel text-[10px] font-bold uppercase tracking-widest sm:text-xs" style={{ color: 'var(--accent-gold)' }}>
              MasjidScreen
            </span>
            <span className="text-[9px] text-white/50 sm:text-[10px]">
              {config.mosqueName.length > 30 ? config.mosqueName.slice(0, 30) + '...' : config.mosqueName}
            </span>
          </div>
        </div>

        {/* Center: Status */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 sm:flex">
          <div className={`status-dot ${activeMode === 'adhan' ? 'status-dot-adhan' : activeMode === 'iqomah' ? 'status-dot-iqomah' : 'status-dot-normal'}`} />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70 sm:text-xs">
            {activeMode === 'adhan' ? 'Adhan' : activeMode === 'iqomah' ? 'Iqomah' : 'Normal'}
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Device ID Badge - Prominent */}
          {deviceId && (
            <div className="hidden items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 sm:flex">
              <span className="text-[9px] font-medium uppercase tracking-wider text-white/40">ID Perangkat</span>
              <span className="font-mono text-sm font-bold tracking-wider" style={{ color: 'var(--accent-gold)' }}>
                {deviceId.slice(0, 4)}
              </span>
            </div>
          )}

          {/* Language Selector */}
          <div className="flex items-center rounded border border-white/10 overflow-hidden">
            {(['id', 'ar', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase transition-colors sm:px-2 sm:text-[10px] ${
                  language === l
                    ? 'bg-white/15 text-white'
                    : 'bg-transparent text-white/40 hover:text-white/60'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="flex h-7 w-7 items-center justify-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white/80 sm:h-8 sm:w-8"
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
      </header>

      {/* ======== MAIN DISPLAY AREA ======== */}
      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* ---- CENTER COLUMN: Main Content (full-width, centered) ---- */}
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
                className="mt-0.5 text-white/70 sm:text-sm lg:text-base"
                style={{
                  fontFamily: config.mosqueNameFontFamily,
                  fontSize: `calc(0.75rem * ${config.mosqueNameFontSize})`,
                }}
              >
                {config.mosqueName}
              </p>
            </div>

            {/* Clock */}
            {config.clockType === 'digital' ? (
              <div className="flex flex-col items-center">
                <span
                  className="clock-digital font-bold leading-none"
                  style={{
                    fontFamily: config.digitalFontFamily,
                    fontSize: `clamp(2.5rem, ${config.digitalFontSize}vw, ${config.digitalFontSize}rem)`,
                    color: 'var(--accent-gold)',
                    ...(config.clockStyle === 'retro' ? {
                      textShadow: `0 0 10px var(--accent-gold), 0 0 30px var(--accent-gold)40, 0 0 60px var(--accent-gold)20`,
                      letterSpacing: '0.05em',
                    } : config.clockStyle === 'minimal' ? {
                      fontWeight: 300,
                      letterSpacing: '0.15em',
                      opacity: 0.9,
                    } : {}),
                  }}
                >
                  {formatTime(now, config.showSeconds)}
                </span>
              </div>
            ) : (
              <AnalogClockSVG
                size={Math.min(config.analogSize, 850)}
                hours={now.getHours()}
                minutes={now.getMinutes()}
                seconds={now.getSeconds()}
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
                className="text-white/70 sm:text-xs lg:text-sm"
                style={{
                  fontFamily: config.dateFontFamily,
                  fontSize: `calc(0.7rem * ${config.dateFontSize})`,
                  color: config.dateColor || '#ffffff',
                }}
              >
                {formatDate(now, language)}
              </p>
              {config.showHijri && (
                <p
                  className="font-amiri sm:text-xs lg:text-sm"
                  style={{
                    fontSize: `calc(0.7rem * ${config.dateFontSize})`,
                    color: config.dateColor || 'var(--accent-gold)',
                  }}
                >
                  {formatHijriDate(now, language)}
                </p>
              )}
            </div>

          </div>

        {/* ======== BOTTOM PRAYER SCHEDULE BAR ======== */}
        <div className="z-20 shrink-0 border-t border-white/10 bg-black/30 px-2 py-2 sm:px-4 sm:py-3">
          <div className="flex items-stretch gap-1.5 sm:gap-2 lg:gap-2.5">
            {allPrayerStatuses.map(({ prayer, status, isNext }) => {
              const isActive = status === 'now'
              const isUpcomingNext = isNext && status === 'upcoming'
              const isPassed = status === 'passed'
              const isHighlighted = isActive || isUpcomingNext

              return (
                <div
                  key={prayer.id}
                  className={`flex flex-col items-center justify-center rounded-lg border transition-all duration-300 ${
                    isHighlighted
                      ? 'flex-[2] sm:flex-[1.8]'
                      : 'flex-1'
                  } ${
                    isActive
                      ? 'border-red-500/60 bg-red-500/15'
                      : isUpcomingNext
                        ? 'border-white/20 bg-white/5'
                        : ''
                  } ${
                    isHighlighted
                      ? 'px-3 py-2.5 sm:px-5 sm:py-3.5'
                      : 'px-1.5 py-1.5 sm:px-3 sm:py-2'
                  }`}
                  style={
                    !isActive && !isUpcomingNext
                      ? {
                          backgroundColor: config.cardBgColor,
                          borderColor: config.cardBorderColor,
                          opacity: isPassed ? 0.5 : 1,
                        }
                      : {
                          opacity: isPassed ? 0.5 : 1,
                          boxShadow: isUpcomingNext ? `0 0 16px ${theme.accent}25, inset 0 0 20px ${theme.accent}08` : undefined,
                        }
                  }
                >
                  {/* Arabic name */}
                  <span
                    className={`font-amiri leading-tight ${
                      isHighlighted
                        ? 'text-sm font-bold sm:text-base lg:text-lg'
                        : 'text-[10px] sm:text-xs'
                    }`}
                    style={{
                      color: isActive ? '#ef4444' : theme.accent,
                      opacity: isPassed ? 0.5 : 1,
                    }}
                  >
                    {prayer.arabic}
                  </span>
                  {/* Latin name */}
                  <span
                    className={`mt-0.5 font-medium text-white/50 ${
                      isHighlighted ? 'text-[10px] sm:text-xs' : 'text-[8px] sm:text-[9px]'
                    }`}
                    style={{ opacity: isPassed ? 0.5 : 1 }}
                  >
                    {prayer.latin}
                  </span>
                  {/* Time */}
                  <span
                    className={`mt-0.5 font-mono font-bold ${
                      isHighlighted ? 'text-sm sm:text-base lg:text-lg' : 'text-[10px] sm:text-[11px]'
                    }`}
                    style={{
                      color: isActive ? '#ef4444' : '#ffffff',
                      opacity: isPassed ? 0.5 : 1,
                    }}
                  >
                    {prayer.time}
                  </span>
                  {/* Iqomah - only for highlighted card */}
                  {isHighlighted && (
                    <span className="mt-1 flex items-center gap-1 text-[9px] text-white/40 sm:text-[10px]">
                      <span>Iqomah</span>
                      <span style={{ color: theme.accent }}>
                        {calculateIqomah(prayer.time, config.iqomahMinutes)}
                      </span>
                    </span>
                  )}
                  {/* Countdown - only for next upcoming prayer */}
                  {isUpcomingNext && config.showCountdown && (
                    <span
                      className={`mt-0.5 font-mono text-xs font-bold tracking-wider sm:text-sm lg:text-base ${isAlertMode ? 'blink-text' : ''}`}
                      style={{
                        color: isAlertMode ? '#ef4444' : '#ffffff',
                      }}
                    >
                      {formatCountdown(countdownSeconds)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* ======== RUNNING TEXT BAR ======== */}
      {config.showAnnouncement && config.announcement && (
        <footer className="relative z-50 h-9 shrink-0 border-t border-white/5 sm:h-10">
          <div className="running-text-container absolute inset-0 flex items-center px-4" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-gold) 8%, #050505)' }}>
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
                color: 'var(--accent-gold)',
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
        <div className="adhan-mode-active">
          {/* Close preview button */}
          {previewMode === 'adhan' && (
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
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, transparent, var(--accent-gold), transparent)' }} />

          {/* Title */}
          <div className="adhan-text-latin font-cinzel">A D H A N</div>

          {/* Prayer name Arabic */}
          <div className="adhan-text-arabic font-amiri">{activePrayer.arabic}</div>

          {/* Prayer name Latin */}
          <div className="mt-2 text-lg font-semibold text-white/60">{activePrayer.latin}</div>

          {/* Countdown */}
          <div className="adhan-countdown font-mono" style={{ fontFamily: config.iqomahFontFamily }}>
            {formatCountdown(adhanCountdown)}
          </div>

          {/* Label */}
          <div className="mt-4 text-xs font-medium uppercase tracking-widest text-white/30">
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
            className="iqomah-countdown-display"
            style={{ fontFamily: config.iqomahFontFamily, fontSize: `clamp(4rem, ${config.iqomahFontSize}vw, ${config.iqomahFontSize}rem)` }}
          >
            {formatCountdown(iqomahCountdown)}
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
    </div>
  )
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

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
