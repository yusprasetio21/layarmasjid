// lib/prayer-times.ts

export interface PrayerTimeAPI {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
  Imsak?: string
  Midnight?: string
}

export interface PrayerSchedule {
  date: string
  hijriDate: string
  timings: PrayerTimeAPI
}

export interface PrayerTimeItem {
  id: string
  latin: string
  arabic: string
  time: string
  isMain: boolean
}

// Metode perhitungan untuk Indonesia
export enum CalculationMethod {
  KEMENAG = 'KEMENAG',     // Kementerian Agama RI
  JAKIM = 'JAKIM',         // Malaysia
  MWL = 'MWL',             // Muslim World League
  ISNA = 'ISNA',           // Islamic Society of North America
  MAKKAH = 'MAKKAH',       // Umm Al-Qura
}

const methodMap: Record<CalculationMethod, number> = {
  [CalculationMethod.KEMENAG]: 11,  // KEMENAG Indonesia
  [CalculationMethod.JAKIM]: 13,
  [CalculationMethod.MWL]: 3,
  [CalculationMethod.ISNA]: 2,
  [CalculationMethod.MAKKAH]: 4,
}

// Mapping dari API ke format internal
const prayerNameMap: Record<string, { latin: string; arabic: string; isMain: boolean }> = {
  Fajr: { latin: 'Subuh', arabic: 'الفجر', isMain: true },
  Sunrise: { latin: 'Syuruq', arabic: 'الشروق', isMain: false },
  Dhuhr: { latin: 'Dzuhur', arabic: 'الظهر', isMain: true },
  Asr: { latin: 'Ashar', arabic: 'العصر', isMain: true },
  Maghrib: { latin: 'Maghrib', arabic: 'المغرب', isMain: true },
  Isha: { latin: 'Isya', arabic: 'العشاء', isMain: true },
  Imsak: { latin: 'Imsak', arabic: 'الإمساك', isMain: false },
}

/**
 * Konversi dari API response ke format PrayerTime array
 */
export function convertAPIToPrayerTimes(timings: PrayerTimeAPI): PrayerTimeItem[] {
  const prayerTimes: PrayerTimeItem[] = []
  
  Object.entries(timings).forEach(([key, time]) => {
    const mapping = prayerNameMap[key as keyof typeof prayerNameMap]
    if (mapping && time) {
      // Format time from "05:00 (WIB)" to "05:00"
      const cleanTime = time.split(' ')[0]
      prayerTimes.push({
        id: key.toLowerCase(),
        latin: mapping.latin,
        arabic: mapping.arabic,
        time: cleanTime,
        isMain: mapping.isMain,
      })
    }
  })
  
  // Urutkan berdasarkan waktu
  return prayerTimes.sort((a, b) => a.time.localeCompare(b.time))
}

/**
 * Mendapatkan jadwal sholat berdasarkan koordinat GPS
 */
export async function getPrayerTimesByCoordinates(
  lat: number,
  lng: number,
  method: CalculationMethod = CalculationMethod.KEMENAG,
  date: Date = new Date()
): Promise<PrayerSchedule | null> {
  try {
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const methodCode = methodMap[method] || 11
    
    const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lng}&method=${methodCode}&school=1`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.code === 200 && data.data) {
      return {
        date: data.data.date.readable,
        hijriDate: `${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`,
        timings: {
          Fajr: data.data.timings.Fajr,
          Sunrise: data.data.timings.Sunrise,
          Dhuhr: data.data.timings.Dhuhr,
          Asr: data.data.timings.Asr,
          Maghrib: data.data.timings.Maghrib,
          Isha: data.data.timings.Isha,
          Imsak: data.data.timings.Imsak,
        }
      }
    }
    return null
  } catch (error) {
    console.error('Gagal mengambil jadwal sholat:', error)
    return null
  }
}

/**
 * Mendapatkan lokasi dari browser (Promise wrapper)
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung browser ini'))
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // Cache 1 menit
    })
  })
}