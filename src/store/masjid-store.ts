import { create } from 'zustand'
import type { MasjidConfig, PrayerTime } from '@/types/masjid'
import { DEFAULT_CONFIG } from '@/types/masjid'
import { 
  getPrayerTimesByCoordinates, 
  getCurrentPosition, 
  convertAPIToPrayerTimes,
  CalculationMethod,
  type PrayerSchedule 
} from '@/lib/prayer-times'

interface MasjidStore {
  // Device
  deviceId: string | null
  setDeviceId: (id: string) => void

  // Auth
  isAuthenticated: boolean
  setIsAuthenticated: (v: boolean) => void

  // Config
  config: MasjidConfig
  setConfig: (config: Partial<MasjidConfig>) => void
  resetConfig: () => void
  loadConfig: (config: MasjidConfig) => void

  // Loading
  isLoading: boolean
  setIsLoading: (v: boolean) => void

  // Sync status
  lastSynced: string | null
  setLastSynced: (v: string) => void

  // Preview mode
  previewMode: 'none' | 'adhan' | 'iqomah' | 'info' | 'post-iqomah'
  setPreviewMode: (mode: 'none' | 'adhan' | 'iqomah' | 'info' | 'post-iqomah') => void

  // ========== NEW: Prayer Times Auto Fetch ==========
  prayerSchedule: PrayerSchedule | null
  lastPrayerFetchDate: string | null
  isFetchingPrayerTimes: boolean
  fetchPrayerTimesAuto: () => Promise<boolean>
  fetchPrayerTimesManual: (lat: number, lng: number) => Promise<boolean>
  updatePrayerTimesFromAPI: (timings: PrayerSchedule['timings']) => void
}

export const useMasjidStore = create<MasjidStore>((set, get) => ({
  deviceId: null,
  setDeviceId: (id) => set({ deviceId: id }),

  isAuthenticated: false,
  setIsAuthenticated: (v) => set({ isAuthenticated: v }),

  config: DEFAULT_CONFIG,
  setConfig: (partial) =>
    set((state) => ({ config: { ...state.config, ...partial } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG }),
  loadConfig: (config) =>
    set({ config: { ...DEFAULT_CONFIG, ...config } }),

  isLoading: false,
  setIsLoading: (v) => set({ isLoading: v }),

  lastSynced: null,
  setLastSynced: (v) => set({ lastSynced: v }),

  previewMode: 'none',
  setPreviewMode: (mode) => set({ previewMode: mode }),

  // ========== NEW IMPLEMENTATIONS ==========
  prayerSchedule: null,
  lastPrayerFetchDate: null,
  isFetchingPrayerTimes: false,

  fetchPrayerTimesAuto: async () => {
    const state = get()
    const today = new Date().toDateString()
    
    // Skip if already fetched today
    if (state.lastPrayerFetchDate === today && state.prayerSchedule) {
      return true
    }
    
    // Skip if already fetching
    if (state.isFetchingPrayerTimes) {
      return false
    }
    
    set({ isFetchingPrayerTimes: true })
    
    try {
      // Get current position
      const position = await getCurrentPosition()
      const { latitude, longitude } = position.coords
      
      // Fetch prayer times
      const schedule = await getPrayerTimesByCoordinates(latitude, longitude)
      
      if (schedule) {
        // Update store
        set({
          prayerSchedule: schedule,
          lastPrayerFetchDate: today,
        })
        
        // Also update config prayer times
        const prayerTimesArray = convertAPIToPrayerTimes(schedule.timings)
        set((state) => ({
          config: {
            ...state.config,
            prayerTimesTemplate: prayerTimesArray as PrayerTime[],
            prayerSourceMode: 'auto',
          }
        }))
        
        return true
      }
      return false
    } catch (error) {
      console.error('Auto fetch prayer times failed:', error)
      return false
    } finally {
      set({ isFetchingPrayerTimes: false })
    }
  },

  fetchPrayerTimesManual: async (lat: number, lng: number) => {
    set({ isFetchingPrayerTimes: true })
    
    try {
      const schedule = await getPrayerTimesByCoordinates(lat, lng)
      
      if (schedule) {
        set({
          prayerSchedule: schedule,
          lastPrayerFetchDate: new Date().toDateString(),
        })
        
        const prayerTimesArray = convertAPIToPrayerTimes(schedule.timings)
        set((state) => ({
          config: {
            ...state.config,
            prayerTimesTemplate: prayerTimesArray as PrayerTime[],
          }
        }))
        
        return true
      }
      return false
    } catch (error) {
      console.error('Manual fetch prayer times failed:', error)
      return false
    } finally {
      set({ isFetchingPrayerTimes: false })
    }
  },

  updatePrayerTimesFromAPI: (timings) => {
    const prayerTimesArray = convertAPIToPrayerTimes(timings)
    set((state) => ({
      config: {
        ...state.config,
        prayerTimesTemplate: prayerTimesArray as PrayerTime[],
      }
    }))
  },
}))