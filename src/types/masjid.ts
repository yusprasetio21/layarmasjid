export interface PrayerTime {
  id: string
  latin: string
  arabic: string
  time: string
  isMain: boolean
  status?: 'upcoming' | 'now' | 'passed'
  isNext?: boolean
}

export interface MasjidConfig {
  // Mosque Info
  mosqueName: string
  mosqueNameArabic: string
  mosqueNameFontFamily: string
  mosqueNameFontSize: number

  // Date Settings
  dateOpacity: number
  dateColor: string
  dateFontFamily: string
  dateFontSize: number

  // Theme
  theme: 'haramain' | 'ottoman' | 'madinah' | 'nusantara' | 'ramadhan' | 'custom'

  // Clock
  clockType: 'digital' | 'analog'
  clockStyle: 'default' | 'retro' | 'minimal'
  digitalFontFamily: string
  digitalFontSize: number
  showSeconds: boolean
  analogNumberStyle: 'arabic' | 'roman' | 'hindi'
  analogSize: number

  // Prayer Schedule
  prayerSourceMode: 'auto' | 'manual'
  cardBgColor: string
  cardBorderColor: string
  prayerTimesTemplate: PrayerTime[]

  // Adhan & Iqomah
  adhanModeEnabled: boolean
  adhanDuration: number
  iqomahModeEnabled: boolean
  iqomahFontFamily: string
  iqomahFontSize: number
  iqomahBeepEnabled: boolean
  iqomahMinutes: number

  // Running Text
  runningAnimation: 'scroll-left' | 'scroll-right' | 'alternate' | 'fade'
  runningSpeed: number
  runningFontFamily: string
  runningFontSize: number

  // Custom Theme
  customThemeAccent: string
  customThemeAccentLight: string

  // Display Options
  showHijri: boolean
  showCountdown: boolean
  soundEnabled: boolean
  showAnnouncement: boolean

  // Announcement
  announcement: string

  // Language
  lang: 'id' | 'ar' | 'en'
}

export interface ScreenData {
  id: string
  password: string
  config: MasjidConfig
  created_at: string
  updated_at?: string
}

export const DEFAULT_CONFIG: MasjidConfig = {
  mosqueName: 'Masjid Jami Al Ikhlas Petukangan Selatan',
  mosqueNameArabic: 'مَسْجِد جَامِع الإِخْلَاص',
  mosqueNameFontFamily: "'Cormorant Garamond', serif",
  mosqueNameFontSize: 1,
  dateOpacity: 0.85,
  dateColor: '#ffffff',
  dateFontFamily: "'Cormorant Garamond', serif",
  dateFontSize: 1,
  theme: 'haramain',
  clockType: 'digital',
  clockStyle: 'default',
  digitalFontFamily: "'Orbitron', monospace",
  digitalFontSize: 6.5,
  showSeconds: true,
  analogNumberStyle: 'arabic',
  analogSize: 200,
  prayerSourceMode: 'auto',
  cardBgColor: 'rgba(201,168,76,0.08)',
  cardBorderColor: 'rgba(201,168,76,0.2)',
  prayerTimesTemplate: [
    { id: 'subuh', latin: 'Subuh', arabic: 'الفَجْر', time: '04:32', isMain: true },
    { id: 'dzuhur', latin: 'Dzuhur', arabic: 'الظُّهْر', time: '11:58', isMain: true },
    { id: 'ashar', latin: 'Ashar', arabic: 'العَصْر', time: '15:15', isMain: true },
    { id: 'maghrib', latin: 'Maghrib', arabic: 'المَغْرِب', time: '17:58', isMain: true },
    { id: 'isya', latin: 'Isya', arabic: 'العِشَاء', time: '19:08', isMain: true },
    { id: 'dhuha', latin: 'Dhuha', arabic: 'الضُّحَى', time: '07:00', isMain: false },
    { id: 'tahajjud', latin: 'Tahajud', arabic: 'تَهَجُّد', time: '03:30', isMain: false },
  ],
  adhanModeEnabled: true,
  adhanDuration: 180,
  iqomahModeEnabled: true,
  iqomahFontFamily: "'Orbitron', monospace",
  iqomahFontSize: 12,
  iqomahBeepEnabled: true,
  iqomahMinutes: 10,
  runningAnimation: 'scroll-left',
  runningSpeed: 25,
  runningFontFamily: "'Inter', sans-serif",
  runningFontSize: 1.0,
  customThemeAccent: '#C9A84C',
  customThemeAccentLight: '#E8D48B',
  showHijri: true,
  showCountdown: true,
  soundEnabled: true,
  showAnnouncement: true,
  announcement: "Assalamu'alaikum Warahmatullahi Wabarakatuh — Selamat datang di Masjid Jami Al Ikhlas Petukangan Selatan.",
  lang: 'id',
}

export const THEMES = {
  haramain: { accent: '#C9A84C', accentLight: '#E8D48B', bgClass: 'theme-haramain' },
  ottoman: { accent: '#08D9D6', accentLight: '#4EEAEA', bgClass: 'theme-ottoman' },
  madinah: { accent: '#A8C0D6', accentLight: '#D0E0F0', bgClass: 'theme-madinah' },
  nusantara: { accent: '#8DC06A', accentLight: '#B8DD9E', bgClass: 'theme-nusantara' },
  ramadhan: { accent: '#F5D78A', accentLight: '#FFF5DB', bgClass: 'theme-ramadhan' },
  custom: { accent: '#C9A84C', accentLight: '#E8D48B', bgClass: 'theme-custom' },
}

export const ANALOG_NUMBERS = {
  arabic: ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
  roman: ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'],
  hindi: ['١٢', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١'],
}
