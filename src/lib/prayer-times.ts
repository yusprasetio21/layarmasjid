import { calculatePrayerTimesLocal } from './prayer-times-local'

export async function getPrayerTimesByCoordinates(
  lat: number,
  lng: number,
  // method param diabaikan saat fallback, default Kemenag
  method: CalculationMethod = CalculationMethod.KEMENAG,
  date: Date = new Date()
): Promise<PrayerSchedule | null> {
  // 1. Coba online
  try {
    const schedule = await fetchFromAPI(lat, lng, method, date)
    if (schedule) return schedule
  } catch (e) {
    console.warn('Online fetch failed, switching to local calculation')
  }

  // 2. Fallback: hitung lokal
  try {
    const timings = calculatePrayerTimesLocal(date, lat, lng, 20, 18)
    const hijri = approximateHijri(date) // gunakan fungsi yang sudah ada di MosqueDisplay atau buat pendek

    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      hijriDate: hijri,
      timings: {
        Fajr: timings.fajr,
        Sunrise: timings.sunrise,
        Dhuhr: timings.dhuhr,
        Asr: timings.asr,
        Maghrib: timings.maghrib,
        Isha: timings.isha,
      }
    }
  } catch {
    return null
  }
}

async function fetchFromAPI(lat: number, lng: number, method: CalculationMethod, date: Date): Promise<PrayerSchedule | null> {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const methodCode = methodMap[method] || 11
  const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lng}&method=${methodCode}&school=1`
  
  const response = await fetch(url)
  if (!response.ok) return null
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
      }
    }
  }
  return null
}