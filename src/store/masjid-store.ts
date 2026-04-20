import { create } from 'zustand'
import type { MasjidConfig } from '@/types/masjid'
import { DEFAULT_CONFIG } from '@/types/masjid'

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

  // Preview mode (not persisted in config)
  previewMode: 'none' | 'adhan' | 'iqomah'
  setPreviewMode: (mode: 'none' | 'adhan' | 'iqomah') => void
}

export const useMasjidStore = create<MasjidStore>((set) => ({
  deviceId: null,
  setDeviceId: (id) => set({ deviceId: id }),

  isAuthenticated: false,
  setIsAuthenticated: (v) => set({ isAuthenticated: v }),

  config: DEFAULT_CONFIG,
  setConfig: (partial) =>
    set((state) => ({ config: { ...state.config, ...partial } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG }),
  loadConfig: (config) => set({ config }),

  isLoading: false,
  setIsLoading: (v) => set({ isLoading: v }),

  lastSynced: null,
  setLastSynced: (v) => set({ lastSynced: v }),

  previewMode: 'none',
  setPreviewMode: (mode) => set({ previewMode: mode }),
}))
