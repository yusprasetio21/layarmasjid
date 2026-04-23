'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { useMasjidStore } from '@/store/masjid-store'
import type { MasjidConfig } from '@/types/masjid'
import { DEFAULT_CONFIG } from '@/types/masjid'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Trash2,
  Edit3,
  Copy,
  Save,
  Eye,
  Maximize2,
  Loader2,
  Upload,
  X,
  Palette,
  Layout,
  Image,
  Type,
  Clock,
  Layers,
  MoveText,
  Bell,
  Calendar,
  ChevronLeft,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────

interface CustomTheme {
  id: string
  name: string
  description: string
  config: Record<string, unknown>
  thumbnail_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ThemeDesignerProps {
  token: string
}

interface ThemeEditorState {
  id: string | null
  name: string
  description: string
  thumbnail_url: string
  thumbnail_fileName: string
  // Config overrides
  layoutType: 'default' | 'sidebar-right' | 'bottom-bar' | 'horizontal'
  bgType: 'gradient' | 'solid' | 'image'
  bgColor: string
  bgGradientFrom: string
  bgGradientTo: string
  bgGradientDirection: string
  bgImageUrl: string
  bgImageFileName: string
  bgOverlayOpacity: number
  customThemeAccent: string
  customThemeAccentLight: string
  mosqueNameFontFamily: string
  mosqueNameFontSize: number
  digitalFontFamily: string
  digitalFontSize: number
  dateFontFamily: string
  dateFontSize: number
  runningFontFamily: string
  runningFontSize: number
  iqomahFontFamily: string
  iqomahFontSize: number
  clockType: 'digital' | 'analog'
  clockStyle: 'default' | 'retro' | 'minimal'
  showSeconds: boolean
  analogNumberStyle: 'arabic' | 'roman' | 'hindi'
  analogSize: number
  cardBgColor: string
  cardBorderColor: string
  prayerCardFontSize: number
  runningAnimation: 'scroll-left' | 'scroll-right' | 'alternate' | 'fade'
  runningSpeed: number
  showAnnouncement: boolean
  adhanModeEnabled: boolean
  adhanDuration: number
  iqomahModeEnabled: boolean
  iqomahBeepEnabled: boolean
  iqomahMinutes: number
  showHijri: boolean
  showCountdown: boolean
  dateOpacity: number
  dateColor: string
}

// ─── Dynamic Import ──────────────────────────────────────────────────

const MosqueDisplay = dynamic(
  () => import('@/components/masjid/MosqueDisplay').then(m => m.default),
  { ssr: false }
)

// ─── Default Editor State ────────────────────────────────────────────

const defaultEditorState: ThemeEditorState = {
  id: null,
  name: '',
  description: '',
  thumbnail_url: '',
  thumbnail_fileName: '',
  layoutType: 'default',
  bgType: 'gradient',
  bgColor: '#050505',
  bgGradientFrom: '#050505',
  bgGradientTo: '#1a0f00',
  bgGradientDirection: 'to bottom',
  bgImageUrl: '',
  bgImageFileName: '',
  bgOverlayOpacity: 0.3,
  customThemeAccent: '#C9A84C',
  customThemeAccentLight: '#E8D48B',
  mosqueNameFontFamily: "'Cormorant Garamond', serif",
  mosqueNameFontSize: 1,
  digitalFontFamily: "'Orbitron', monospace",
  digitalFontSize: 6.5,
  dateFontFamily: "'Cormorant Garamond', serif",
  dateFontSize: 1,
  runningFontFamily: "'Inter', sans-serif",
  runningFontSize: 1.0,
  iqomahFontFamily: "'Orbitron', monospace",
  iqomahFontSize: 12,
  clockType: 'digital',
  clockStyle: 'default',
  showSeconds: true,
  analogNumberStyle: 'arabic',
  analogSize: 200,
  cardBgColor: 'rgba(201,168,76,0.08)',
  cardBorderColor: 'rgba(201,168,76,0.2)',
  prayerCardFontSize: 1,
  runningAnimation: 'scroll-left',
  runningSpeed: 25,
  showAnnouncement: true,
  adhanModeEnabled: true,
  adhanDuration: 180,
  iqomahModeEnabled: true,
  iqomahBeepEnabled: true,
  iqomahMinutes: 10,
  showHijri: true,
  showCountdown: true,
  dateOpacity: 0.85,
  dateColor: '#ffffff',
}

// ─── Font Options ────────────────────────────────────────────────────

const FONT_OPTIONS = {
  mosqueName: [
    { value: "'Amiri', serif", label: 'Amiri' },
    { value: "'Cormorant Garamond', serif", label: 'Cormorant Garamond' },
    { value: "'Cinzel', serif", label: 'Cinzel' },
    { value: "'Playfair Display', serif", label: 'Playfair Display' },
    { value: "'Tajawal', sans-serif", label: 'Tajawal' },
    { value: "'Rajdhani', sans-serif", label: 'Rajdhani' },
  ],
  digitalClock: [
    { value: "'Orbitron', monospace", label: 'Orbitron' },
    { value: "'Rajdhani', sans-serif", label: 'Rajdhani' },
    { value: "'Teko', sans-serif", label: 'Teko' },
    { value: "'Monoton', cursive", label: 'Monoton' },
    { value: "'Cinzel', serif", label: 'Cinzel' },
  ],
  date: [
    { value: "'Cormorant Garamond', serif", label: 'Cormorant Garamond' },
    { value: "'Cinzel', serif", label: 'Cinzel' },
    { value: "'Playfair Display', serif", label: 'Playfair Display' },
    { value: "'Tajawal', sans-serif", label: 'Tajawal' },
    { value: "'Rajdhani', sans-serif", label: 'Rajdhani' },
    { value: "'Inter', sans-serif", label: 'Inter' },
  ],
  runningText: [
    { value: "'Inter', sans-serif", label: 'Inter' },
    { value: "'Cormorant Garamond', serif", label: 'Cormorant Garamond' },
    { value: "'Cinzel', serif", label: 'Cinzel' },
    { value: "'Tajawal', sans-serif", label: 'Tajawal' },
    { value: "'Rajdhani', sans-serif", label: 'Rajdhani' },
    { value: "'Teko', sans-serif", label: 'Teko' },
    { value: "'Orbitron', monospace", label: 'Orbitron' },
    { value: "'Amiri', serif", label: 'Amiri' },
  ],
  iqomah: [
    { value: "'Orbitron', monospace", label: 'Orbitron' },
    { value: "'Rajdhani', sans-serif", label: 'Rajdhani' },
    { value: "'Teko', sans-serif", label: 'Teko' },
    { value: "'Cinzel', serif", label: 'Cinzel' },
  ],
}

const CARD_COLOR_PRESETS = [
  { label: 'Emas', bg: 'rgba(201,168,76,0.08)', border: 'rgba(201,168,76,0.2)' },
  { label: 'Biru', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
  { label: 'Hijau', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
  { label: 'Ungu', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)' },
  { label: 'Merah', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  { label: 'Tosca', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.2)' },
]

const DATE_COLOR_PRESETS = [
  { label: 'Putih', value: '#ffffff' },
  { label: 'Emas', value: '#C9A84C' },
  { label: 'Biru Muda', value: '#A8C0D6' },
  { label: 'Hijau', value: '#8DC06A' },
  { label: 'Kuning', value: '#F5D78A' },
  { label: 'Tosca', value: '#08D9D6' },
]

const GRADIENT_DIRECTIONS = [
  { value: 'to bottom', label: 'Bawah' },
  { value: 'to top', label: 'Atas' },
  { value: 'to right', label: 'Kanan' },
  { value: 'to left', label: 'Kiri' },
  { value: 'to bottom right', label: 'Bawah Kanan' },
  { value: 'to bottom left', label: 'Bawah Kiri' },
  { value: 'to top right', label: 'Atas Kanan' },
  { value: 'to top left', label: 'Atas Kiri' },
]

// ─── Helper: build config override from editor state ─────────────────

function buildConfigFromEditor(s: ThemeEditorState): Record<string, unknown> {
  return {
    theme: 'custom' as const,
    layoutType: s.layoutType,
    bgType: s.bgType,
    bgColor: s.bgColor,
    bgGradientFrom: s.bgGradientFrom,
    bgGradientTo: s.bgGradientTo,
    bgGradientDirection: s.bgGradientDirection,
    bgImageUrl: s.bgImageUrl,
    bgImageFileName: s.bgImageFileName,
    bgOverlayOpacity: s.bgOverlayOpacity,
    customThemeAccent: s.customThemeAccent,
    customThemeAccentLight: s.customThemeAccentLight,
    mosqueNameFontFamily: s.mosqueNameFontFamily,
    mosqueNameFontSize: s.mosqueNameFontSize,
    digitalFontFamily: s.digitalFontFamily,
    digitalFontSize: s.digitalFontSize,
    dateFontFamily: s.dateFontFamily,
    dateFontSize: s.dateFontSize,
    runningFontFamily: s.runningFontFamily,
    runningFontSize: s.runningFontSize,
    iqomahFontFamily: s.iqomahFontFamily,
    iqomahFontSize: s.iqomahFontSize,
    clockType: s.clockType,
    clockStyle: s.clockStyle,
    showSeconds: s.showSeconds,
    analogNumberStyle: s.analogNumberStyle,
    analogSize: s.analogSize,
    cardBgColor: s.cardBgColor,
    cardBorderColor: s.cardBorderColor,
    prayerCardFontSize: s.prayerCardFontSize,
    runningAnimation: s.runningAnimation,
    runningSpeed: s.runningSpeed,
    showAnnouncement: s.showAnnouncement,
    adhanModeEnabled: s.adhanModeEnabled,
    adhanDuration: s.adhanDuration,
    iqomahModeEnabled: s.iqomahModeEnabled,
    iqomahBeepEnabled: s.iqomahBeepEnabled,
    iqomahMinutes: s.iqomahMinutes,
    showHijri: s.showHijri,
    showCountdown: s.showCountdown,
    dateOpacity: s.dateOpacity,
    dateColor: s.dateColor,
  }
}

function buildMasjidConfigFromEditor(s: ThemeEditorState): Partial<MasjidConfig> {
  return {
    theme: 'custom',
    customThemeAccent: s.customThemeAccent,
    customThemeAccentLight: s.customThemeAccentLight,
    mosqueNameFontFamily: s.mosqueNameFontFamily,
    mosqueNameFontSize: s.mosqueNameFontSize,
    digitalFontFamily: s.digitalFontFamily,
    digitalFontSize: s.digitalFontSize,
    dateFontFamily: s.dateFontFamily,
    dateFontSize: s.dateFontSize,
    dateOpacity: s.dateOpacity,
    dateColor: s.dateColor,
    runningFontFamily: s.runningFontFamily,
    runningFontSize: s.runningFontSize,
    iqomahFontFamily: s.iqomahFontFamily,
    iqomahFontSize: s.iqomahFontSize,
    clockType: s.clockType,
    clockStyle: s.clockStyle,
    showSeconds: s.showSeconds,
    analogNumberStyle: s.analogNumberStyle,
    analogSize: s.analogSize,
    cardBgColor: s.cardBgColor,
    cardBorderColor: s.cardBorderColor,
    prayerCardFontSize: s.prayerCardFontSize,
    runningAnimation: s.runningAnimation,
    runningSpeed: s.runningSpeed,
    showAnnouncement: s.showAnnouncement,
    adhanModeEnabled: s.adhanModeEnabled,
    adhanDuration: s.adhanDuration,
    iqomahModeEnabled: s.iqomahModeEnabled,
    iqomahBeepEnabled: s.iqomahBeepEnabled,
    iqomahMinutes: s.iqomahMinutes,
    showHijri: s.showHijri,
    showCountdown: s.showCountdown,
  }
}

// ─── Layout Preview Thumbnail Component ──────────────────────────────

function LayoutPreviewThumb({ layout, active, onClick }: { layout: string; active: boolean; onClick: () => void }) {
  const layouts: Record<string, JSX.Element> = {
    'default': (
      <svg viewBox="0 0 60 40" className="h-10 w-15">
        <rect x="1" y="1" width="58" height="38" rx="3" fill={active ? '#f59e0b' : '#3f3f46'} stroke={active ? '#fbbf24' : '#52525b'} strokeWidth="1.5" />
        <line x1="1" y1="30" x2="59" y2="30" stroke={active ? '#fbbf2480' : '#52525b80'} strokeWidth="1" />
        <rect x="20" y="6" width="20" height="4" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="22" y="14" width="16" height="6" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="24" y="23" width="12" height="3" rx="1" fill={active ? '#fbbf2480' : '#71717a80'} />
        <rect x="4" y="32" width="14" height="4" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="22" y="32" width="14" height="4" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="40" y="32" width="14" height="4" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
      </svg>
    ),
    'sidebar-right': (
      <svg viewBox="0 0 60 40" className="h-10 w-15">
        <rect x="1" y="1" width="58" height="38" rx="3" fill={active ? '#f59e0b' : '#3f3f46'} stroke={active ? '#fbbf24' : '#52525b'} strokeWidth="1.5" />
        <line x1="40" y1="1" x2="40" y2="39" stroke={active ? '#fbbf2480' : '#52525b80'} strokeWidth="1" />
        <line x1="1" y1="30" x2="39" y2="30" stroke={active ? '#fbbf2480' : '#52525b80'} strokeWidth="1" />
        <rect x="10" y="6" width="18" height="3" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="12" y="13" width="14" height="5" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="14" y="21" width="10" height="3" rx="1" fill={active ? '#fbbf2480' : '#71717a80'} />
        <rect x="4" y="32" width="10" height="4" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="18" y="32" width="10" height="4" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="44" y="6" width="10" height="3" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="44" y="13" width="10" height="3" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="44" y="20" width="10" height="3" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="44" y="27" width="10" height="3" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="44" y="34" width="10" height="3" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
      </svg>
    ),
    'bottom-bar': (
      <svg viewBox="0 0 60 40" className="h-10 w-15">
        <rect x="1" y="1" width="58" height="38" rx="3" fill={active ? '#f59e0b' : '#3f3f46'} stroke={active ? '#fbbf24' : '#52525b'} strokeWidth="1.5" />
        <rect x="2" y="26" width="56" height="12" rx="2" fill={active ? '#d97706' : '#27272a'} />
        <rect x="12" y="5" width="22" height="3" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="14" y="12" width="18" height="5" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="16" y="20" width="14" height="3" rx="1" fill={active ? '#fbbf2480' : '#71717a80'} />
        <rect x="6" y="28" width="10" height="6" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="20" y="28" width="10" height="6" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="34" y="28" width="10" height="6" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="48" y="28" width="6" height="6" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
      </svg>
    ),
    'horizontal': (
      <svg viewBox="0 0 60 40" className="h-10 w-15">
        <rect x="1" y="1" width="58" height="38" rx="3" fill={active ? '#f59e0b' : '#3f3f46'} stroke={active ? '#fbbf24' : '#52525b'} strokeWidth="1.5" />
        <line x1="20" y1="1" x2="20" y2="39" stroke={active ? '#fbbf2480' : '#52525b80'} strokeWidth="1" />
        <line x1="40" y1="1" x2="40" y2="39" stroke={active ? '#fbbf2480' : '#52525b80'} strokeWidth="1" />
        <rect x="4" y="6" width="12" height="3" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="6" y="14" width="8" height="6" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="5" y="26" width="10" height="6" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="5" y="34" width="10" height="3" rx="1" fill={active ? '#fbbf2480' : '#71717a80'} />
        <rect x="24" y="6" width="12" height="3" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="26" y="14" width="8" height="6" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="25" y="26" width="10" height="6" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="25" y="34" width="10" height="3" rx="1" fill={active ? '#fbbf2480' : '#71717a80'} />
        <rect x="44" y="6" width="12" height="3" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="46" y="14" width="8" height="6" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="45" y="26" width="10" height="6" rx="1" fill={active ? '#fbbf24' : '#71717a'} />
        <rect x="45" y="34" width="10" height="3" rx="1" fill={active ? '#fbbf2480' : '#71717a80'} />
      </svg>
    ),
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-all ${
        active
          ? 'border-amber-500 bg-amber-500/10'
          : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800'
      }`}
    >
      {layouts[layout] || layouts['default']}
      <span className={`text-[10px] font-medium ${active ? 'text-amber-400' : 'text-zinc-400'}`}>
        {layout === 'sidebar-right' ? 'Sidebar' : layout === 'bottom-bar' ? 'Bar Bawah' : layout === 'horizontal' ? 'Horizontal' : 'Default'}
      </span>
    </button>
  )
}

// ─── Main Component ──────────────────────────────────────────────────

export default function ThemeDesigner({ token }: ThemeDesignerProps) {
  // ── Store refs ──
  const storeConfig = useMasjidStore((s) => s.config)
  const storeSetConfig = useMasjidStore((s) => s.setConfig)

  // ── State ──
  const [themes, setThemes] = useState<CustomTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editor, setEditor] = useState<ThemeEditorState>(defaultEditorState)
  const [saving, setSaving] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)

  // ── Refs ──
  const prevStoreConfig = useRef<MasjidConfig>(storeConfig)
  const thumbInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)

  // ── Fetch themes ──
  const fetchThemes = useCallback(async () => {
    try {
      const res = await fetch('/api/themes')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memuat tema')
      setThemes(data.themes || [])
    } catch (err) {
      console.error('Fetch themes error:', err)
      toast.error('Gagal memuat daftar tema')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchThemes()
  }, [fetchThemes])

  // ── New Theme ──
  const handleNewTheme = useCallback(() => {
    setEditingId('new')
    setEditor({ ...defaultEditorState })
    setSidebarMobileOpen(false)
  }, [])

  // ── Edit Theme ──
  const handleEdit = useCallback((theme: CustomTheme) => {
    const cfg = (theme.config || {}) as Record<string, unknown>
    setEditingId(theme.id)
    setEditor({
      id: theme.id,
      name: theme.name || '',
      description: theme.description || '',
      thumbnail_url: theme.thumbnail_url || '',
      thumbnail_fileName: '',
      layoutType: (cfg.layoutType as ThemeEditorState['layoutType']) || 'default',
      bgType: (cfg.bgType as ThemeEditorState['bgType']) || 'gradient',
      bgColor: (cfg.bgColor as string) || '#050505',
      bgGradientFrom: (cfg.bgGradientFrom as string) || '#050505',
      bgGradientTo: (cfg.bgGradientTo as string) || '#1a0f00',
      bgGradientDirection: (cfg.bgGradientDirection as string) || 'to bottom',
      bgImageUrl: (cfg.bgImageUrl as string) || '',
      bgImageFileName: (cfg.bgImageFileName as string) || '',
      bgOverlayOpacity: (cfg.bgOverlayOpacity as number) ?? 0.3,
      customThemeAccent: (cfg.customThemeAccent as string) || '#C9A84C',
      customThemeAccentLight: (cfg.customThemeAccentLight as string) || '#E8D48B',
      mosqueNameFontFamily: (cfg.mosqueNameFontFamily as string) || "'Cormorant Garamond', serif",
      mosqueNameFontSize: (cfg.mosqueNameFontSize as number) || 1,
      digitalFontFamily: (cfg.digitalFontFamily as string) || "'Orbitron', monospace",
      digitalFontSize: (cfg.digitalFontSize as number) || 6.5,
      dateFontFamily: (cfg.dateFontFamily as string) || "'Cormorant Garamond', serif",
      dateFontSize: (cfg.dateFontSize as number) || 1,
      runningFontFamily: (cfg.runningFontFamily as string) || "'Inter', sans-serif",
      runningFontSize: (cfg.runningFontSize as number) || 1.0,
      iqomahFontFamily: (cfg.iqomahFontFamily as string) || "'Orbitron', monospace",
      iqomahFontSize: (cfg.iqomahFontSize as number) || 12,
      clockType: (cfg.clockType as ThemeEditorState['clockType']) || 'digital',
      clockStyle: (cfg.clockStyle as ThemeEditorState['clockStyle']) || 'default',
      showSeconds: (cfg.showSeconds as boolean) ?? true,
      analogNumberStyle: (cfg.analogNumberStyle as ThemeEditorState['analogNumberStyle']) || 'arabic',
      analogSize: (cfg.analogSize as number) || 200,
      cardBgColor: (cfg.cardBgColor as string) || 'rgba(201,168,76,0.08)',
      cardBorderColor: (cfg.cardBorderColor as string) || 'rgba(201,168,76,0.2)',
      prayerCardFontSize: (cfg.prayerCardFontSize as number) || 1,
      runningAnimation: (cfg.runningAnimation as ThemeEditorState['runningAnimation']) || 'scroll-left',
      runningSpeed: (cfg.runningSpeed as number) || 25,
      showAnnouncement: (cfg.showAnnouncement as boolean) ?? true,
      adhanModeEnabled: (cfg.adhanModeEnabled as boolean) ?? true,
      adhanDuration: (cfg.adhanDuration as number) || 180,
      iqomahModeEnabled: (cfg.iqomahModeEnabled as boolean) ?? true,
      iqomahBeepEnabled: (cfg.iqomahBeepEnabled as boolean) ?? true,
      iqomahMinutes: (cfg.iqomahMinutes as number) || 10,
      showHijri: (cfg.showHijri as boolean) ?? true,
      showCountdown: (cfg.showCountdown as boolean) ?? true,
      dateOpacity: (cfg.dateOpacity as number) ?? 0.85,
      dateColor: (cfg.dateColor as string) || '#ffffff',
    })
    setSidebarMobileOpen(false)
  }, [])

  // ── Duplicate Theme ──
  const handleDuplicate = useCallback(async (theme: CustomTheme) => {
    try {
      const res = await fetch('/api/themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `${theme.name} (Salinan)`,
          description: theme.description,
          config: theme.config,
          thumbnail_url: theme.thumbnail_url,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menduplikasi')
      toast.success('Tema berhasil diduplikasi')
      fetchThemes()
    } catch (err) {
      console.error('Duplicate error:', err)
      toast.error('Gagal menduplikasi tema')
    }
  }, [token, fetchThemes])

  // ── Delete Theme ──
  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/themes?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus')
      toast.success('Tema berhasil dihapus')
      if (editingId === id) {
        setEditingId(null)
        setEditor(defaultEditorState)
      }
      fetchThemes()
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Gagal menghapus tema')
    } finally {
      setDeletingId(null)
    }
  }, [token, editingId, fetchThemes])

  // ── Upload Image Helper ──
  const uploadImage = useCallback(async (file: File, folder: string): Promise<{ url: string; fileName: string } | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload gagal')
      return { url: data.url, fileName: data.fileName }
    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Gagal mengunggah gambar')
      return null
    }
  }, [])

  // ── Delete Image Helper ──
  const deleteImage = useCallback(async (fileName: string) => {
    if (!fileName) return
    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      })
    } catch {
      // Ignore deletion errors
    }
  }, [])

  // ── Upload Thumbnail ──
  const handleThumbnailUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingThumb(true)
    // Delete old thumbnail
    if (editor.thumbnail_fileName) {
      await deleteImage(editor.thumbnail_fileName)
    }
    const result = await uploadImage(file, 'themes')
    if (result) {
      setEditor((prev) => ({ ...prev, thumbnail_url: result.url, thumbnail_fileName: result.fileName }))
      toast.success('Thumbnail berhasil diunggah')
    }
    setUploadingThumb(false)
    e.target.value = ''
  }, [editor.thumbnail_fileName, uploadImage, deleteImage])

  // ── Upload Background Image ──
  const handleBgImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBg(true)
    // Delete old bg image
    if (editor.bgImageFileName) {
      await deleteImage(editor.bgImageFileName)
    }
    const result = await uploadImage(file, 'themes')
    if (result) {
      setEditor((prev) => ({ ...prev, bgImageUrl: result.url, bgImageFileName: result.fileName }))
      toast.success('Gambar latar berhasil diunggah')
    }
    setUploadingBg(false)
    e.target.value = ''
  }, [editor.bgImageFileName, uploadImage, deleteImage])

  // ── Save Theme ──
  const handleSave = useCallback(async () => {
    if (!editor.name.trim()) {
      toast.error('Nama tema wajib diisi')
      return
    }
    setSaving(true)
    try {
      const isUpdate = editingId !== null && editingId !== 'new'
      const method = isUpdate ? 'PUT' : 'POST'
      const configData = buildConfigFromEditor(editor)

      const body: Record<string, unknown> = {
        name: editor.name.trim(),
        description: editor.description.trim(),
        config: configData,
        thumbnail_url: editor.thumbnail_url,
      }
      if (isUpdate) body.id = editingId

      const res = await fetch('/api/themes', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan')

      toast.success(isUpdate ? 'Tema berhasil diperbarui' : 'Tema berhasil dibuat')

      // If new theme, update editingId
      if (!isUpdate && data.theme?.id) {
        setEditingId(data.theme.id)
        setEditor((prev) => ({ ...prev, id: data.theme.id }))
      }
      fetchThemes()
    } catch (err) {
      console.error('Save error:', err)
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan tema')
    } finally {
      setSaving(false)
    }
  }, [editor, editingId, token, fetchThemes])

  // ── Preview ──
  const handlePreview = useCallback(() => {
    prevStoreConfig.current = { ...storeConfig }
    const configOverride = buildMasjidConfigFromEditor(editor)
    storeSetConfig(configOverride)
    setPreviewOpen(true)
  }, [editor, storeConfig, storeSetConfig])

  const handleClosePreview = useCallback(() => {
    storeSetConfig(prevStoreConfig.current)
    setPreviewOpen(false)
  }, [storeSetConfig])

  // ── Fullscreen Preview ──
  const handleFullscreenPreview = useCallback(() => {
    prevStoreConfig.current = { ...storeConfig }
    const configOverride = buildMasjidConfigFromEditor(editor)
    storeSetConfig(configOverride)
    setPreviewOpen(true)
    setTimeout(() => {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen not supported
      })
    }, 100)
  }, [editor, storeConfig, storeSetConfig])

  // ── Editor update helper ──
  const updateEditor = useCallback(<K extends keyof ThemeEditorState>(key: K, value: ThemeEditorState[K]) => {
    setEditor((prev) => ({ ...prev, [key]: value }))
  }, [])

  // ── Currently editing theme for highlight ──
  const currentTheme = editingId ? themes.find(t => t.id === editingId) : null

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-950/95 px-4 backdrop-blur-sm">
        <Palette className="h-4 w-4 text-amber-400" />
        <h1 className="text-sm font-semibold text-zinc-200">Theme Designer</h1>
        <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px]">
          {editingId === 'new' ? 'Tema Baru' : editingId ? 'Mengedit' : 'Pilih Tema'}
        </Badge>
        {/* Mobile sidebar toggle */}
        <button
          type="button"
          onClick={() => setSidebarMobileOpen(!sidebarMobileOpen)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 lg:hidden"
        >
          <Layers className="h-4 w-4" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ─── LEFT SIDEBAR ─── */}
        {/* Mobile overlay */}
        {sidebarMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarMobileOpen(false)}
          />
        )}
        <aside
          className={`fixed bottom-0 left-0 top-12 z-50 flex w-72 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-300 lg:static lg:z-0 lg:translate-x-0 ${
            sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center gap-2 p-3">
            <Button
              onClick={handleNewTheme}
              className="flex-1 bg-amber-500 text-black hover:bg-amber-600"
              size="sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Buat Tema Baru
            </Button>
            <button
              type="button"
              onClick={() => setSidebarMobileOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 lg:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <Separator className="bg-zinc-800" />

          <ScrollArea className="flex-1">
            <div className="space-y-2 p-3">
              {loading ? (
                <div className="flex flex-col items-center gap-2 py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
                  <span className="text-xs text-zinc-500">Memuat tema...</span>
                </div>
              ) : themes.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Palette className="h-8 w-8 text-zinc-700" />
                  <p className="text-xs text-zinc-500">Belum ada tema tersimpan</p>
                  <p className="text-[10px] text-zinc-600">Klik &quot;Buat Tema Baru&quot; untuk memulai</p>
                </div>
              ) : (
                themes.map((theme) => {
                  const isEditing = editingId === theme.id
                  return (
                    <div
                      key={theme.id}
                      className={`group relative rounded-lg border p-3 transition-all ${
                        isEditing
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {/* Thumbnail */}
                        {theme.thumbnail_url ? (
                          <img
                            src={theme.thumbnail_url}
                            alt={theme.name}
                            className="h-10 w-14 shrink-0 rounded border border-zinc-700 object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded border border-zinc-700 bg-zinc-800">
                            <Palette className="h-4 w-4 text-zinc-600" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-zinc-200">{theme.name}</span>
                            {theme.is_active && (
                              <Badge className="shrink-0 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0">
                                Aktif
                              </Badge>
                            )}
                          </div>
                          {theme.description && (
                            <p className="mt-0.5 truncate text-[10px] text-zinc-500">{theme.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(theme)}
                          className={`h-6 gap-1 px-2 text-[10px] ${isEditing ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          <Edit3 className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(theme)}
                          className="h-6 gap-1 px-2 text-[10px] text-zinc-500 hover:text-zinc-300"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(theme.id)}
                          disabled={deletingId === theme.id}
                          className="h-6 gap-1 px-2 text-[10px] text-zinc-500 hover:text-red-400"
                        >
                          {deletingId === theme.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* ─── RIGHT PANEL ─── */}
        <main className="flex min-h-0 flex-1 flex-col">
          {editingId ? (
            <>
              {/* Editor header info */}
              <div className="shrink-0 border-b border-zinc-800 px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-400">Mengedit:</span>
                  <span className="text-sm font-semibold text-amber-400">
                    {editor.name || '(Belum bernama)'}
                  </span>
                  {currentTheme?.is_active && (
                    <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0">
                      Aktif
                    </Badge>
                  )}
                </div>
              </div>

              {/* Scrollable form */}
              <ScrollArea className="flex-1">
                <div className="mx-auto max-w-2xl p-4 pb-32">
                  <Accordion
                    type="multiple"
                    defaultValue={['info', 'background', 'accent', 'fonts', 'clock', 'cards']}
                    className="space-y-2"
                  >
                    {/* ── 1. INFO TEMA ── */}
                    <AccordionItem value="info" className="rounded-lg border border-zinc-800 bg-zinc-900 px-4">
                      <AccordionTrigger className="text-sm font-medium text-zinc-200 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-amber-400" />
                          Info Tema
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Nama Tema</Label>
                            <Input
                              value={editor.name}
                              onChange={(e) => updateEditor('name', e.target.value)}
                              placeholder="Masukkan nama tema..."
                              className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Deskripsi</Label>
                            <Textarea
                              value={editor.description}
                              onChange={(e) => updateEditor('description', e.target.value)}
                              placeholder="Deskripsi singkat tema..."
                              rows={3}
                              className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Thumbnail</Label>
                            <div className="flex items-start gap-3">
                              {editor.thumbnail_url ? (
                                <div className="relative">
                                  <img
                                    src={editor.thumbnail_url}
                                    alt="Thumbnail"
                                    className="h-20 w-28 rounded-lg border border-zinc-700 object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (editor.thumbnail_fileName) deleteImage(editor.thumbnail_fileName)
                                      updateEditor('thumbnail_url', '')
                                      updateEditor('thumbnail_fileName', '')
                                    }}
                                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex h-20 w-28 items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800/50">
                                  <Image className="h-6 w-6 text-zinc-600" />
                                </div>
                              )}
                              <div className="flex flex-col gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => thumbInputRef.current?.click()}
                                  disabled={uploadingThumb}
                                  className="h-8 gap-1.5 border-zinc-700 bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                                >
                                  {uploadingThumb ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Upload className="h-3 w-3" />
                                  )}
                                  {uploadingThumb ? 'Mengunggah...' : 'Pilih Gambar'}
                                </Button>
                                <span className="text-[10px] text-zinc-600">JPG, PNG, GIF, WebP (maks. 5MB)</span>
                              </div>
                              <input
                                ref={thumbInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailUpload}
                                className="hidden"
                              />
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* ── 2. LAYOUT TAMPILAN ── */}
                    <AccordionItem value="layout" className="rounded-lg border border-zinc-800 bg-zinc-900 px-4">
                      <AccordionTrigger className="text-sm font-medium text-zinc-200 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Layout className="h-4 w-4 text-amber-400" />
                          Layout Tampilan
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2">
                          <Label className="mb-3 block text-xs text-zinc-400">Pilih tata letak</Label>
                          <div className="flex flex-wrap gap-3">
                            {(['default', 'sidebar-right', 'bottom-bar', 'horizontal'] as const).map((l) => (
                              <LayoutPreviewThumb
                                key={l}
                                layout={l}
                                active={editor.layoutType === l}
                                onClick={() => updateEditor('layoutType', l)}
                              />
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* ── 3. BACKGROUND ── */}
                    <AccordionItem value="background" className="rounded-lg border border-zinc-800 bg-zinc-900 px-4">
                      <AccordionTrigger className="text-sm font-medium text-zinc-200 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-amber-400" />
                          Background
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {/* Background type selector */}
                          <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Tipe Background</Label>
                            <div className="flex gap-1.5">
                              {(['gradient', 'solid', 'image'] as const).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => updateEditor('bgType', t)}
                                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                    editor.bgType === t
                                      ? 'bg-amber-500 text-black'
                                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                  }`}
                                >
                                  {t === 'gradient' ? 'Gradien' : t === 'solid' ? 'Warna Solid' : 'Gambar'}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Solid color */}
                          {editor.bgType === 'solid' && (
                            <div className="space-y-2">
                              <Label className="text-xs text-zinc-400">Warna Background</Label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="color"
                                  value={editor.bgColor}
                                  onChange={(e) => updateEditor('bgColor', e.target.value)}
                                  className="h-9 w-14 cursor-pointer rounded-md border border-zinc-700 bg-zinc-800"
                                />
                                <Input
                                  value={editor.bgColor}
                                  onChange={(e) => updateEditor('bgColor', e.target.value)}
                                  className="flex-1 border-zinc-700 bg-zinc-800 text-xs text-zinc-200 font-mono"
                                />
                              </div>
                            </div>
                          )}

                          {/* Gradient */}
                          {editor.bgType === 'gradient' && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-zinc-400">Warna Awal</Label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="color"
                                    value={editor.bgGradientFrom}
                                    onChange={(e) => updateEditor('bgGradientFrom', e.target.value)}
                                    className="h-9 w-14 cursor-pointer rounded-md border border-zinc-700 bg-zinc-800"
                                  />
                                  <Input
                                    value={editor.bgGradientFrom}
                                    onChange={(e) => updateEditor('bgGradientFrom', e.target.value)}
                                    className="flex-1 border-zinc-700 bg-zinc-800 text-xs text-zinc-200 font-mono"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-zinc-400">Warna Akhir</Label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="color"
                                    value={editor.bgGradientTo}
                                    onChange={(e) => updateEditor('bgGradientTo', e.target.value)}
                                    className="h-9 w-14 cursor-pointer rounded-md border border-zinc-700 bg-zinc-800"
                                  />
                                  <Input
                                    value={editor.bgGradientTo}
                                    onChange={(e) => updateEditor('bgGradientTo', e.target.value)}
                                    className="flex-1 border-zinc-700 bg-zinc-800 text-xs text-zinc-200 font-mono"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-zinc-400">Arah Gradien</Label>
                                <Select
                                  value={editor.bgGradientDirection}
                                  onValueChange={(v) => updateEditor('bgGradientDirection', v)}
                                >
                                  <SelectTrigger className="w-full border-zinc-700 bg-zinc-800 text-zinc-200">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-60 overflow-y-auto border-zinc-700 bg-zinc-900">
                                    {GRADIENT_DIRECTIONS.map((d) => (
                                      <SelectItem key={d.value} value={d.value} className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                                        {d.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {/* Gradient preview */}
                              <div className="h-16 w-full rounded-lg border border-zinc-700" style={{ background: `linear-gradient(${editor.bgGradientDirection}, ${editor.bgGradientFrom}, ${editor.bgGradientTo})` }} />
                            </div>
                          )}

                          {/* Image */}
                          {editor.bgType === 'image' && (
                            <div className="space-y-3">
                              {editor.bgImageUrl ? (
                                <div className="relative">
                                  <img
                                    src={editor.bgImageUrl}
                                    alt="Background"
                                    className="h-32 w-full rounded-lg border border-zinc-700 object-cover"
                                  />
                                  <div className="absolute inset-0 rounded-lg" style={{ backgroundColor: `rgba(0,0,0,${editor.bgOverlayOpacity})` }} />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (editor.bgImageFileName) deleteImage(editor.bgImageFileName)
                                      updateEditor('bgImageUrl', '')
                                      updateEditor('bgImageFileName', '')
                                    }}
                                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800/50">
                                  <Image className="h-8 w-8 text-zinc-600" />
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => bgInputRef.current?.click()}
                                  disabled={uploadingBg}
                                  className="h-8 gap-1.5 border-zinc-700 bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700"
                                >
                                  {uploadingBg ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Upload className="h-3 w-3" />
                                  )}
                                  {uploadingBg ? 'Mengunggah...' : 'Pilih Gambar Latar'}
                                </Button>
                                <input
                                  ref={bgInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleBgImageUpload}
                                  className="hidden"
                                />
                              </div>
                            </div>
                          )}

                          {/* Overlay opacity (for image bg) */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-zinc-400">Transparansi Overlay</Label>
                              <span className="text-xs font-mono text-zinc-500">{editor.bgOverlayOpacity.toFixed(2)}</span>
                            </div>
                            <Slider
                              value={[editor.bgOverlayOpacity]}
                              onValueChange={([v]) => updateEditor('bgOverlayOpacity', v)}
                              min={0}
                              max={1}
                              step={0.01}
                              className="py-2"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* ── 4. WARNA AKSEN ── */}
                    <AccordionItem value="accent" className="rounded-lg border border-zinc-800 bg-zinc-900 px-4">
                      <AccordionTrigger className="text-sm font-medium text-zinc-200 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-amber-400" />
                          Warna Aksen
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Warna Utama (Accent)</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={editor.customThemeAccent}
                                onChange={(e) => updateEditor('customThemeAccent', e.target.value)}
                                className="h-9 w-14 cursor-pointer rounded-md border border-zinc-700 bg-zinc-800"
                              />
                              <Input
                                value={editor.customThemeAccent}
                                onChange={(e) => updateEditor('customThemeAccent', e.target.value)}
                                className="flex-1 border-zinc-700 bg-zinc-800 text-xs text-zinc-200 font-mono"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Warna Sekunder (Accent Light)</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={editor.customThemeAccentLight}
                                onChange={(e) => updateEditor('customThemeAccentLight', e.target.value)}
                                className="h-9 w-14 cursor-pointer rounded-md border border-zinc-700 bg-zinc-800"
                              />
                              <Input
                                value={editor.customThemeAccentLight}
                                onChange={(e) => updateEditor('customThemeAccentLight', e.target.value)}
                                className="flex-1 border-zinc-700 bg-zinc-800 text-xs text-zinc-200 font-mono"
                              />
                            </div>
                          </div>
                          {/* Preview swatch */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-md border border-zinc-700" style={{ backgroundColor: editor.customThemeAccent }} />
                              <span className="text-[10px] text-zinc-500">Utama</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-md border border-zinc-700" style={{ backgroundColor: editor.customThemeAccentLight }} />
                              <span className="text-[10px] text-zinc-500">Sekunder</span>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* ── 5. FONT & UKURAN ── */}
                    <AccordionItem value="fonts" className="rounded-lg border border-zinc-800 bg-zinc-900 px-4">
                      <AccordionTrigger className="text-sm font-medium text-zinc-200 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Type className="h-4 w-4 text-amber-400" />
                          Font &amp; Ukuran
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-5 pt-2">
                          {/* Mosque name font */}
                          <div className="space-y-3">
                            <Label className="text-xs font-medium text-zinc-300">Font Nama Masjid</Label>
                            <Select
                              value={editor.mosqueNameFontFamily}
                              onValueChange={(v) => updateEditor('mosqueNameFontFamily', v)}
                            >
                              <SelectTrigger className="w-full border-zinc-700 bg-zinc-800 text-zinc-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-60 overflow-y-auto border-zinc-700 bg-zinc-900">
                                {FONT_OPTIONS.mosqueName.map((f) => (
                                  <SelectItem key={f.value} value={f.value} className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                                    {f.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px] text-zinc-500">Ukuran</Label>
                              <span className="text-[10px] font-mono text-zinc-500">{editor.mosqueNameFontSize.toFixed(1)}x</span>
                            </div>
                            <Slider
                              value={[editor.mosqueNameFontSize]}
                              onValueChange={([v]) => updateEditor('mosqueNameFontSize', v)}
                              min={0.5}
                              max={3}
                              step={0.1}
                              className="py-2"
                            />
                          </div>

                          <Separator className="bg-zinc-800" />

                          {/* Digital clock font */}
                          <div className="space-y-3">
                            <Label className="text-xs font-medium text-zinc-300">Font Jam Digital</Label>
                            <Select
                              value={editor.digitalFontFamily}
                              onValueChange={(v) => updateEditor('digitalFontFamily', v)}
                            >
                              <SelectTrigger className="w-full border-zinc-700 bg-zinc-800 text-zinc-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-60 overflow-y-auto border-zinc-700 bg-zinc-900">
                                {FONT_OPTIONS.digitalClock.map((f) => (
                                  <SelectItem key={f.value} value={f.value} className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                                    {f.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px] text-zinc-500">Ukuran</Label>
                              <span className="text-[10px] font-mono text-zinc-500">{editor.digitalFontSize.toFixed(1)}</span>
                            </div>
                            <Slider
                              value={[editor.digitalFontSize]}
                              onValueChange={([v]) => updateEditor('digitalFontSize', v)}
                              min={2}
                              max={15}
                              step={0.5}
                              className="py-2"
                            />
                          </div>

                          <Separator className="bg-zinc-800" />

                          {/* Date font */}
                          <div className="space-y-3">
                            <Label className="text-xs font-medium text-zinc-300">Font Tanggal</Label>
                            <Select
                              value={editor.dateFontFamily}
                              onValueChange={(v) => updateEditor('dateFontFamily', v)}
                            >
                              <SelectTrigger className="w-full border-zinc-700 bg-zinc-800 text-zinc-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-60 overflow-y-auto border-zinc-700 bg-zinc-900">
                                {FONT_OPTIONS.date.map((f) => (
                                  <SelectItem key={f.value} value={f.value} className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                                    {f.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px] text-zinc-500">Ukuran</Label>
                              <span className="text-[10px] font-mono text-zinc-500">{editor.dateFontSize.toFixed(1)}x</span>
                            </div>
                            <Slider
                              value={[editor.dateFontSize]}
                              onValueChange={([v]) => updateEditor('dateFontSize', v)}
                              min={0.5}
                              max={2.5}
                              step={0.1}
                              className="py-2"
                            />
                          </div>

                          <Separator className="bg-zinc-800" />

                          {/* Running text font */}
                          <div className="space-y-3">
                            <Label className="text-xs font-medium text-zinc-300">Font Teks Berjalan</Label>
                            <Select
                              value={editor.runningFontFamily}
                              onValueChange={(v) => updateEditor('runningFontFamily', v)}
                            >
                              <SelectTrigger className="w-full border-zinc-700 bg-zinc-800 text-zinc-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-60 overflow-y-auto border-zinc-700 bg-zinc-900">
                                {FONT_OPTIONS.runningText.map((f) => (
                                  <SelectItem key={f.value} value={f.value} className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                                    {f.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px] text-zinc-500">Ukuran</Label>
                              <span className="text-[10px] font-mono text-zinc-500">{editor.runningFontSize.toFixed(1)}</span>
                            </div>
                            <Slider
                              value={[editor.runningFontSize]}
                              onValueChange={([v]) => updateEditor('runningFontSize', v)}
                              min={0.5}
                              max={2}
                              step={0.1}
                              className="py-2"
                            />
                          </div>

                          <Separator className="bg-zinc-800" />

                          {/* Iqomah font */}
                          <div className="space-y-3">
                            <Label className="text-xs font-medium text-zinc-300">Font Iqomah</Label>
                            <Select
                              value={editor.iqomahFontFamily}
                              onValueChange={(v) => updateEditor('iqomahFontFamily', v)}
                            >
                              <SelectTrigger className="w-full border-zinc-700 bg-zinc-800 text-zinc-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-60 overflow-y-auto border-zinc-700 bg-zinc-900">
                                {FONT_OPTIONS.iqomah.map((f) => (
                                  <SelectItem key={f.value} value={f.value} className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                                    {f.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px] text-zinc-500">Ukuran</Label>
                              <span className="text-[10px] font-mono text-zinc-500">{editor.iqomahFontSize.toFixed(0)}</span>
                            </div>
                            <Slider
                              value={[editor.iqomahFontSize]}
                              onValueChange={([v]) => updateEditor('iqomahFontSize', v)}
                              min={4}
                              max={20}
                              step={1}
                              className="py-2"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* ── 6. JAM / CLOCK ── */}
                    <AccordionItem value="clock" className="rounded-lg border border-zinc-800 bg-zinc-900 px-4">
                      <AccordionTrigger className="text-sm font-medium text-zinc-200 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-400" />
                          Jam / Clock
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {/* Clock type */}
                          <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Tipe Jam</Label>
                            <div className="flex gap-1.5">
                              {(['digital', 'analog'] as const).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => updateEditor('clockType', t)}
                                  className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                                    editor.clockType === t
                                      ? 'bg-amber-500 text-black'
                                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                  }`}
                                >
                                  {t === 'digital' ? 'Digital' : 'Analog'}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Digital clock style */}
                          {editor.clockType === 'digital' && (
                            <div className="space-y-2">
                              <Label className="text-xs text-zinc-400">Gaya Jam Digital</Label>
                              <div className="flex gap-1.5">
                                {(['default', 'retro', 'minimal'] as const).map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => updateEditor('clockStyle', s)}
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                      editor.clockStyle === s
                                        ? 'bg-amber-500 text-black'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                    }`}
                                  >
                                    {s === 'default' ? 'Default' : s === 'retro' ? 'Retro' : 'Minimal'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Show seconds */}
                          {editor.clockType === 'digital' && (
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-zinc-400">Tampilkan Detik</Label>
                              <Switch
                                checked={editor.showSeconds}
                                onCheckedChange={(v) => updateEditor('showSeconds', v)}
                              />
                            </div>
                          )}

                          {/* Analog number style */}
                          {editor.clockType === 'analog' && (
                            <div className="space-y-2">
                              <Label className="text-xs text-zinc-400">Gaya Angka Analog</Label>
                              <div className="flex gap-1.5">
                                {(['arabic', 'roman', 'hindi'] as const).map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => updateEditor('analogNumberStyle', s)}
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                      editor.analogNumberStyle === s
                                        ? 'bg-amber-500 text-black'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                    }`}
                                  >
                                    {s === 'arabic' ? 'Arab (1-12)' : s === 'roman' ? 'Romawi (I-XII)' : 'Hindi (١-١٢)'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Analog size */}
                          {editor.clockType === 'analog' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs text-zinc-400">Ukuran Analog (px)</Label>
                                <span className="text-xs font-mono text-zinc-500">{editor.analogSize}</span>
                              </div>
                              <Slider
                                value={[editor.analogSize]}
                                onValueChange={([v]) => updateEditor('analogSize', v)}
                                min={120}
                                max={850}
                                step={10}
                                className="py-2"
                              />
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* ── 7. CARD SHALAT ── */}
                    <AccordionItem value="cards" className="rounded-lg border border-zinc-800 bg-zinc-900 px-4">
                      <AccordionTrigger className="text-sm font-medium text-zinc-200 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-amber-400" />
                          Card Shalat
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {/* Card bg color */}
                          <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Warna Background Card</Label>
                            <div className="flex items-center gap-3">
                              <div
                                className="h-9 w-14 rounded-md border border-zinc-700"
                                style={{ backgroundColor: editor.cardBgColor }}
                              />
                              <Input
                                value={editor.cardBgColor}
                                onChange={(e) => updateEditor('cardBgColor', e.target.value)}
                                className="flex-1 border-zinc-700 bg-zinc-800 text-xs text-zinc-200 font-mono"
                                placeholder="rgba(R,G,B,A)"
                              />
                            </div>
                          </div>

                          {/* Card border color */}
                          <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Warna Border Card</Label>
                            <div className="flex items-center gap-3">
                              <div
                                className="h-9 w-14 rounded-md border border-zinc-700"
                                style={{ backgroundColor: editor.cardBorderColor }}
                              />
                              <Input
                                value={editor.cardBorderColor}
                                onChange={(e) => updateEditor('cardBorderColor', e.target.value)}
                                className="flex-1 border-zinc-700 bg-zinc-800 text-xs text-zinc-200 font-mono"
                                placeholder="rgba(R,G,B,A)"
                              />
                            </div>
                          </div>

                          {/* Card font size */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-zinc-400">Ukuran Font Card</Label>
                              <span className="text-xs font-mono text-zinc-500">{editor.prayerCardFontSize.toFixed(1)}x</span>
                            </div>
                            <Slider
                              value={[editor.prayerCardFontSize]}
                              onValueChange={([v]) => updateEditor('prayerCardFontSize', v)}
                              min={0.5}
                              max={2}
                              step={0.1}
                              className="py-2"
                            />
                          </div>

                          {/* Quick color presets */}
                          <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Preset Warna Cepat</Label>
                            <div className="flex flex-wrap gap-2">
                              {CARD_COLOR_PRESETS.map((preset) => {
                                const isActive = editor.cardBgColor === preset.bg && editor.cardBorderColor === preset.border
                                return (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => {
                                      updateEditor('cardBgColor', preset.bg)
                                      updateEditor('cardBorderColor', preset.border)
                                    }}
                                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors ${
                                      isActive
                                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                        : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                                    }`}
                                  >
                                    <div
                                      className="h-3 w-3 rounded-full border border-zinc-600"
                                      style={{
                                        background: `linear-gradient(135deg, ${preset.bg.replace('0.08', '0.4')}, ${preset.border.replace('0.2', '0.6')})`,
                                      }}
                                    />
                                    {preset.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* ── 8. TEKS BERJALAN ── */}
                    <AccordionItem value="running" className="rounded-lg border border-zinc-800 bg-zinc-900 px-4">
                      <AccordionTrigger className="text-sm font-medium text-zinc-200 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <MoveText className="h-4 w-4 text-amber-400" />
                          Teks Berjalan
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {/* Animation */}
                          <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Animasi</Label>
                            <div className="flex flex-wrap gap-1.5">
                              {([
                                { value: 'scroll-left', label: '← Kiri' },
                                { value: 'scroll-right', label: 'Kanan →' },
                                { value: 'alternate', label: '← → Bolak-balik' },
                                { value: 'fade', label: 'Fade' },
                              ] as const).map((a) => (
                                <button
                                  key={a.value}
                                  type="button"
                                  onClick={() => updateEditor('runningAnimation', a.value)}
                                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                    editor.runningAnimation === a.value
                                      ? 'bg-amber-500 text-black'
                                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                  }`}
                                >
                                  {a.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Speed */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-zinc-400">Kecepatan (detik)</Label>
                              <span className="text-xs font-mono text-zinc-500">{editor.runningSpeed} detik</span>
                            </div>
                            <Slider
                              value={[editor.runningSpeed]}
                              onValueChange={([v]) => updateEditor('runningSpeed', v)}
                              min={5}
                              max={60}
                              step={1}
                              className="py-2"
                            />
                          </div>

                          {/* Show announcement */}
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-zinc-400">Tampilkan Pengumuman</Label>
                            <Switch
                              checked={editor.showAnnouncement}
                              onCheckedChange={(v) => updateEditor('showAnnouncement', v)}
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* ── 9. ADZAN & IQOMAH ── */}
                    <AccordionItem value="adhan" className="rounded-lg border border-zinc-800 bg-zinc-900 px-4">
                      <AccordionTrigger className="text-sm font-medium text-zinc-200 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-amber-400" />
                          Adzan &amp; Iqomah
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {/* Adhan mode */}
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-zinc-400">Mode Adzan Aktif</Label>
                            <Switch
                              checked={editor.adhanModeEnabled}
                              onCheckedChange={(v) => updateEditor('adhanModeEnabled', v)}
                            />
                          </div>

                          {/* Adhan duration */}
                          {editor.adhanModeEnabled && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs text-zinc-400">Durasi Adzan (detik)</Label>
                                <span className="text-xs font-mono text-zinc-500">{editor.adhanDuration} detik</span>
                              </div>
                              <Slider
                                value={[editor.adhanDuration]}
                                onValueChange={([v]) => updateEditor('adhanDuration', v)}
                                min={60}
                                max={600}
                                step={10}
                                className="py-2"
                              />
                            </div>
                          )}

                          <Separator className="bg-zinc-800" />

                          {/* Iqomah mode */}
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-zinc-400">Mode Iqomah Aktif</Label>
                            <Switch
                              checked={editor.iqomahModeEnabled}
                              onCheckedChange={(v) => updateEditor('iqomahModeEnabled', v)}
                            />
                          </div>

                          {/* Iqomah duration */}
                          {editor.iqomahModeEnabled && (
                            <>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs text-zinc-400">Durasi Iqomah (menit)</Label>
                                  <span className="text-xs font-mono text-zinc-500">{editor.iqomahMinutes} menit</span>
                                </div>
                                <Slider
                                  value={[editor.iqomahMinutes]}
                                  onValueChange={([v]) => updateEditor('iqomahMinutes', v)}
                                  min={1}
                                  max={20}
                                  step={1}
                                  className="py-2"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label className="text-xs text-zinc-400">Beep Iqomah</Label>
                                <Switch
                                  checked={editor.iqomahBeepEnabled}
                                  onCheckedChange={(v) => updateEditor('iqomahBeepEnabled', v)}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* ── 10. TANGGAL & HIJRI ── */}
                    <AccordionItem value="date" className="rounded-lg border border-zinc-800 bg-zinc-900 px-4">
                      <AccordionTrigger className="text-sm font-medium text-zinc-200 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-amber-400" />
                          Tanggal &amp; Hijri
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {/* Show Hijri */}
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-zinc-400">Tampilkan Tanggal Hijri</Label>
                            <Switch
                              checked={editor.showHijri}
                              onCheckedChange={(v) => updateEditor('showHijri', v)}
                            />
                          </div>

                          {/* Show countdown */}
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-zinc-400">Tampilkan Countdown</Label>
                            <Switch
                              checked={editor.showCountdown}
                              onCheckedChange={(v) => updateEditor('showCountdown', v)}
                            />
                          </div>

                          {/* Date opacity */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-zinc-400">Transparansi Tanggal</Label>
                              <span className="text-xs font-mono text-zinc-500">{editor.dateOpacity.toFixed(2)}</span>
                            </div>
                            <Slider
                              value={[editor.dateOpacity]}
                              onValueChange={([v]) => updateEditor('dateOpacity', v)}
                              min={0.3}
                              max={1}
                              step={0.01}
                              className="py-2"
                            />
                          </div>

                          {/* Date color presets */}
                          <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Warna Tanggal</Label>
                            <div className="flex flex-wrap gap-1.5">
                              {DATE_COLOR_PRESETS.map((preset) => (
                                <button
                                  key={preset.value}
                                  type="button"
                                  onClick={() => updateEditor('dateColor', preset.value)}
                                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors ${
                                    editor.dateColor === preset.value
                                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                      : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                                  }`}
                                >
                                  <div
                                    className="h-3 w-3 rounded-full border border-zinc-600"
                                    style={{ backgroundColor: preset.value }}
                                  />
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </ScrollArea>

              {/* ── Sticky Action Bar ── */}
              <div className="sticky bottom-0 z-30 flex items-center gap-2 border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur-sm">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-amber-500 text-black hover:bg-amber-600"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Tema
                    </>
                  )}
                </Button>
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  className="gap-1.5 border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button
                  onClick={handleFullscreenPreview}
                  variant="outline"
                  className="gap-1.5 border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100"
                >
                  <Maximize2 className="h-4 w-4" />
                  Fullscreen
                </Button>
              </div>
            </>
          ) : (
            /* ── Empty state when no theme selected ── */
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900">
                <Palette className="h-10 w-10 text-zinc-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-300">Pilih atau Buat Tema</h2>
                <p className="mt-1 max-w-sm text-sm text-zinc-500">
                  Pilih tema dari daftar di sidebar untuk mengedit, atau buat tema baru dengan menekan tombol &quot;Buat Tema Baru&quot;.
                </p>
              </div>
              <Button
                onClick={handleNewTheme}
                className="bg-amber-500 text-black hover:bg-amber-600"
              >
                <Plus className="h-4 w-4" />
                Buat Tema Baru
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* ── Preview Dialog ── */}
      {previewOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black">
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-white">Preview Tema</span>
              <span className="text-xs text-white/40">— {editor.name || 'Tema Baru'}</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  document.documentElement.requestFullscreen().catch(() => {})
                }}
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 border-white/10 bg-white/5 text-xs text-white/70 hover:bg-white/10 hover:text-white"
              >
                <Maximize2 className="h-3 w-3" />
                Fullscreen
              </Button>
              <Button
                onClick={handleClosePreview}
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 border-white/10 bg-white/5 text-xs text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="h-3 w-3" />
                Tutup
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <MosqueDisplay />
          </div>
        </div>
      )}
    </div>
  )
}
