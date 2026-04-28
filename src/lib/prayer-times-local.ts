// lib/prayer-times-local.ts
// Pure JS local prayer times calculator – No dependencies
// Based on astronomical algorithms (Solar position, equation of time)
// Adapted for Kemenag method: Fajr 20°, Isha 18°, Asr Shafi

interface PrayerTimesResult {
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

function toDeg(rad: number): number { return (rad * 180) / Math.PI }
function toRad(deg: number): number { return (deg * Math.PI) / 180 }

// Julian Day
function julianDay(year: number, month: number, day: number): number {
  if (month <= 2) { year -= 1; month += 12 }
  const a = Math.floor(year / 100)
  const b = 2 - a + Math.floor(a / 4)
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5
}

// Solar Declination and Equation of Time
function solarPosition(jd: number): { declination: number; eqTime: number } {
  const n = jd - 2451545.0
  const g = (357.528 + 0.98560028 * n) % 360
  const c = 1.9148 * Math.sin(toRad(g)) + 0.02 * Math.sin(toRad(2 * g)) + 0.0003 * Math.sin(toRad(3 * g))
  const lambda = (g + c + 180 + 102.9372) % 360 // ecliptic longitude
  
  const declination = Math.asin(Math.sin(toRad(lambda)) * Math.sin(toRad(23.44)))
  const eqTime = 4 * (c - 40 * Math.sin(toRad(2 * lambda)) + 0.5 * Math.sin(toRad(4 * lambda)) - 1.25 * Math.sin(toRad(2 * g)))
  
  return { declination: toDeg(declination), eqTime }
}

// Calculate prayer times
export function calculatePrayerTimesLocal(
  date: Date,
  lat: number,
  lng: number,
  fajrAngle: number = 20,   // Kemenag
  ishaAngle: number = 18     // Kemenag
): PrayerTimesResult {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const jd = julianDay(year, month, day)
  const { declination, eqTime } = solarPosition(jd)

  // Noon (when sun reaches highest)
  const noon = 12 + (lng / 15) - (eqTime / 60)

  // Dhuhr = noon
  const dhuhrTime = noon

  // Fajr & Isha using angles
  const fajrHour = getHourByAngle(lat, declination, fajrAngle, 'dawn')
  const ishaHour = getHourByAngle(lat, declination, ishaAngle, 'dusk')

  const fajr = noon - fajrHour
  const sunrise = noon - getHourByAngle(lat, declination, 0.833, 'dawn')
  const maghrib = noon + getHourByAngle(lat, declination, 0.833, 'dusk')
  const isha = noon + ishaHour

  // Asr (Shafi: shadow factor = 1)
  const asrHour = getAsrHour(lat, declination)
  const asr = noon + asrHour

  return {
    fajr: toTimeString(fajr),
    sunrise: toTimeString(sunrise),
    dhuhr: toTimeString(dhuhrTime),
    asr: toTimeString(asr),
    maghrib: toTimeString(maghrib),
    isha: toTimeString(isha),
  }
}

function getHourByAngle(lat: number, dec: number, angle: number, type: 'dawn' | 'dusk'): number {
  const d = toRad(dec)
  const l = toRad(lat)
  const numerator = -Math.sin(toRad(angle)) - Math.sin(l) * Math.sin(d)
  const denominator = Math.cos(l) * Math.cos(d)
  if (denominator === 0) return 0
  const cosT = numerator / denominator
  if (Math.abs(cosT) > 1) return 0
  const t = toDeg(Math.acos(cosT)) / 15
  return t
}

function getAsrHour(lat: number, dec: number): number {
  const l = toRad(lat)
  const d = toRad(dec)
  const s = 1 // Shafi (object shadow = 1)
  const numerator = Math.sin(l) * Math.sin(d) + s
  const denominator = Math.cos(l) * Math.cos(d)
  if (denominator === 0) return 0
  const cosT = numerator / denominator
  if (Math.abs(cosT) > 1) return 0
  const t = toDeg(Math.acos(cosT)) / 15
  return t
}

function toTimeString(hour: number): string {
  if (hour < 0) hour += 24
  if (hour >= 24) hour -= 24
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}