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
  theme: 'haramain' | 'ottoman' | 'madinah' | 'nusantara' | 'ramadhan' | 'custom' | 'istanbul-pearl' | 'safavid-marble' | 'andalusian-garden' | 'ottoman-rose' | 'al-aqsa-gold' | 'nabawi' | 'makkah' | 'cordoba'

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
  prayerCardFontSize: number
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
  customBackgroundImage: string
  customBackgroundOpacity: number

  // Display Options
  showHijri: boolean
  showCountdown: boolean
  soundEnabled: boolean
  showAnnouncement: boolean

  // Announcement
  announcement: string

  // Information / Pengajian
  informationEnabled: boolean
  informationItems: InformationItem[]

  // Information Display Settings
  infoTitlePosition: 'top-left' | 'top-right' | 'inside-image'
  infoTitleFontColor: string
  infoTitleFontSize: number
  infoTitleFontFamily: string
  infoDescriptionFontSize: number
  infoDescriptionFontFamily: string

  // Adhan Display
  adhanCountdownAnimation: 'pulse' | 'glow' | 'blink' | 'scale' | 'none'

  // Iqomah Display
  iqomahCountdownAnimation: 'pulse' | 'led-jadul' | 'glow' | 'blink' | 'scale' | 'none'

  // Clock Animation
  clockAnimation: 'none' | 'glow' | 'pulse' | 'retro-blink' | 'fade-breathe'

  // Info Image Size
  infoImageSize: number

  // Post-Iqomah Display
  postIqomahEnabled: boolean

  // Hadith / Ayat Collection (for post-iqomah display)
  hadithCollection: HadithItem[]

  // Language
  lang: 'id' | 'ar' | 'en'

  // Time Correction
  timezoneMode: 'auto' | 'manual'
  timeCorrectionHours: number // manual correction: hours to add (-12 to +12)
  timeCorrectionMinutes: number // manual correction: minutes to add (-59 to +59)
  timeCorrectionSeconds: number // manual correction: seconds to add (-59 to +59)
  timezoneName: string // display name, e.g. "WIB (GMT+7)"
}

export interface HadithItem {
  id: string
  type: 'hadith' | 'ayat'
  arabic: string
  meaning: string
  source: string
  active: boolean
}

export interface InformationItem {
  id: string
  title: string
  description: string
  imageUrl: string // URL from Supabase storage or empty
  imageFileName: string // file name in Supabase bucket
  active: boolean
  scheduleEnabled: boolean
  displayStartTime: string // 'HH:MM' format
  displayEndTime: string // 'HH:MM' format
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
  prayerCardFontSize: 1.55,
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
  customBackgroundImage: '',
  customBackgroundOpacity: 30,
  showHijri: true,
  showCountdown: true,
  soundEnabled: true,
  showAnnouncement: true,
  announcement: "Assalamu'alaikum Warahmatullahi Wabarakatuh — Selamat datang di Masjid Jami Al Ikhlas Petukangan Selatan.",
  informationEnabled: false,
  informationItems: [],
  infoTitlePosition: 'top-left',
  infoTitleFontColor: '#ffffff',
  infoTitleFontSize: 2.5,
  infoTitleFontFamily: "'Amiri', serif",
  infoDescriptionFontSize: 1.2,
  infoDescriptionFontFamily: "'Inter', sans-serif",
  adhanCountdownAnimation: 'pulse',
  iqomahCountdownAnimation: 'pulse',
  clockAnimation: 'none',
  infoImageSize: 85,
  postIqomahEnabled: true,
  hadithCollection: [
    {
      id: 'h1',
      type: 'hadith',
      arabic: 'إِنَّ أَوَّلَ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ مِنْ عَمَلِهِ صَلَاتُهُ',
      meaning: 'Sesungguhnya amal pertama kali yang dihisab dari seorang hamba pada hari kiamat adalah shalatnya.',
      source: 'HR. Tirmidzi & Abu Dawud',
      active: true,
    },
    {
      id: 'h2',
      type: 'ayat',
      arabic: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ',
      meaning: 'Sungguh beruntung orang-orang yang beriman, yaitu orang yang khusyuk dalam shalatnya.',
      source: 'QS. Al-Mu\'minun: 1-2',
      active: true,
    },
    {
      id: 'h3',
      type: 'hadith',
      arabic: 'الصَّلَاةُ عَمُودُ الدِّينِ فَمَنْ أَقَامَهَا فَقَدْ أَقَامَ الدِّينَ',
      meaning: 'Shalat adalah tiang agama, maka siapa yang mendirikannya ia telah mendirikan agama.',
      source: 'HR. Baihaqi',
      active: true,
    },
    {
      id: 'h4',
      type: 'ayat',
      arabic: 'وَأَقِمِ الصَّلَاةَ لِذِكْرِي',
      meaning: 'Dan dirikanlah shalat untuk mengingat-Ku.',
      source: 'QS. Thaha: 14',
      active: true,
    },
    {
      id: 'h5',
      type: 'hadith',
      arabic: 'الصَّلَاةُ نُورٌ',
      meaning: 'Shalat itu cahaya.',
      source: 'HR. Muslim',
      active: true,
    },
    {
      id: 'h6',
      type: 'hadith',
      arabic: 'خَيْرُ الْأَعْمَالِ الصَّلَاةُ لِوَقْتِهَا',
      meaning: 'Sebaik-baik amalan adalah shalat pada waktunya.',
      source: 'HR. Bukhari',
      active: true,
    },
  ],
  lang: 'id',
  timezoneMode: 'auto',
  timeCorrectionHours: 0,
  timeCorrectionMinutes: 0,
  timeCorrectionSeconds: 0,
  timezoneName: '',
}

export type ThemeLayout = 'default' | 'nabawi' | 'makkah' | 'cordoba'

export interface ThemeConfig {
  accent: string
  accentLight: string
  bgClass: string
  isLight: boolean
  textPrimary: string
  textMuted: string
  layout?: ThemeLayout // If undefined, uses 'default'
}

export const THEMES: Record<string, ThemeConfig> = {
  // ─── Dark Themes (default layout) ───
  haramain: { accent: '#C9A84C', accentLight: '#E8D48B', bgClass: 'theme-haramain', isLight: false, textPrimary: '#ffffff', textMuted: '#ffffff99' },
  ottoman: { accent: '#08D9D6', accentLight: '#4EEAEA', bgClass: 'theme-ottoman', isLight: false, textPrimary: '#ffffff', textMuted: '#ffffff99' },
  madinah: { accent: '#A8C0D6', accentLight: '#D0E0F0', bgClass: 'theme-madinah', isLight: false, textPrimary: '#ffffff', textMuted: '#ffffff99' },
  nusantara: { accent: '#8DC06A', accentLight: '#B8DD9E', bgClass: 'theme-nusantara', isLight: false, textPrimary: '#ffffff', textMuted: '#ffffff99' },
  ramadhan: { accent: '#F5D78A', accentLight: '#FFF5DB', bgClass: 'theme-ramadhan', isLight: false, textPrimary: '#ffffff', textMuted: '#ffffff99' },
  custom: { accent: '#C9A84C', accentLight: '#E8D48B', bgClass: 'theme-custom', isLight: false, textPrimary: '#ffffff', textMuted: '#ffffff99' },
  // ─── Light / Bright elegant themes (default layout) ───
  'istanbul-pearl': { accent: '#8B6914', accentLight: '#C9A84C', bgClass: 'theme-istanbul-pearl', isLight: true, textPrimary: '#2C1810', textMuted: '#6B5744' },
  'safavid-marble': { accent: '#0D7377', accentLight: '#14B8A6', bgClass: 'theme-safavid-marble', isLight: true, textPrimary: '#1A2332', textMuted: '#4B6478' },
  'andalusian-garden': { accent: '#065F46', accentLight: '#059669', bgClass: 'theme-andalusian-garden', isLight: true, textPrimary: '#1C1917', textMuted: '#57534E' },
  'ottoman-rose': { accent: '#9F1239', accentLight: '#E11D48', bgClass: 'theme-ottoman-rose', isLight: true, textPrimary: '#3B1020', textMuted: '#7A3048' },
  'al-aqsa-gold': { accent: '#92400E', accentLight: '#B45309', bgClass: 'theme-al-aqsa-gold', isLight: true, textPrimary: '#1C1108', textMuted: '#78716C' },
  // ─── Layout Variant Themes (different component positions) ───
  nabawi: {
    accent: '#C9A84C', accentLight: '#E8D48B',
    bgClass: 'theme-nabawi', isLight: false,
    textPrimary: '#ffffff', textMuted: '#ffffff99',
    layout: 'nabawi', // Right sidebar prayer cards
  },
  makkah: {
    accent: '#E8C547', accentLight: '#FFF2A8',
    bgClass: 'theme-makkah', isLight: false,
    textPrimary: '#ffffff', textMuted: '#ffffff99',
    layout: 'makkah', // Top bar prayer cards
  },
  cordoba: {
    accent: '#8B4513', accentLight: '#CD853F',
    bgClass: 'theme-cordoba', isLight: true,
    textPrimary: '#2C1810', textMuted: '#6B5744',
    layout: 'cordoba', // Split horizontal layout
  },
}

export const ANALOG_NUMBERS = {
  arabic: ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
  roman: ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'],
  hindi: ['١٢', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١'],
}
