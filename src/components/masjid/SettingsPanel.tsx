'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useMasjidStore } from '@/store/masjid-store'
import { useDevice } from '@/components/masjid/hooks/useDevice'
import type { PrayerTime, MasjidConfig } from '@/types/masjid'
import type { InformationItem } from '@/types/masjid'
import dynamic from 'next/dynamic'

// Dynamic import MosqueDisplay to avoid SSR issues
const MosqueDisplay = dynamic(
  () => import('@/components/masjid/MosqueDisplay').then((m) => m.default),
  { ssr: false }
)

// shadcn/ui
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { toast } from 'sonner'

// Icons
import Link from 'next/link'
import {
  X,
  Settings,
  LogOut,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Monitor,
  Clock,
  CalendarDays,
  Volume2,
  MessageSquare,
  Palette,
  Minus,
  Plus,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Info,
  ImageUp,
  Trash2,
  FileImage,
  BookOpen,
  MapPin,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────
const FONT_OPTIONS_MOSQUE = [
  { value: "'Cormorant Garamond', serif", label: 'Cormorant Garamond' },
  { value: "'Cinzel', serif", label: 'Cinzel' },
  { value: "'Playfair Display', serif", label: 'Playfair Display' },
  { value: "'Tajawal', sans-serif", label: 'Tajawal' },
  { value: "'Rajdhani', sans-serif", label: 'Rajdhani' },
]

const FONT_OPTIONS_DATE = [
  { value: "'Cormorant Garamond', serif", label: 'Cormorant Garamond' },
  { value: "'Cinzel', serif", label: 'Cinzel' },
  { value: "'Playfair Display', serif", label: 'Playfair Display' },
  { value: "'Tajawal', sans-serif", label: 'Tajawal' },
  { value: "'Rajdhani', sans-serif", label: 'Rajdhani' },
  { value: "'Inter', sans-serif", label: 'Inter' },
]

const FONT_OPTIONS_DIGITAL = [
  { value: "'Orbitron', monospace", label: 'Orbitron' },
  { value: "'Rajdhani', sans-serif", label: 'Rajdhani' },
  { value: "'Teko', sans-serif", label: 'Teko' },
  { value: "'Monoton', cursive", label: 'Monoton' },
  { value: "'Cinzel', serif", label: 'Cinzel' },
]

const FONT_OPTIONS_IQOMAH = [
  { value: "'Orbitron', monospace", label: 'Orbitron' },
  { value: "'Rajdhani', sans-serif", label: 'Rajdhani' },
  { value: "'Teko', sans-serif", label: 'Teko' },
  { value: "'Cinzel', serif", label: 'Cinzel' },
]

const FONT_OPTIONS_RUNNING = [
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'Cormorant Garamond', serif", label: 'Cormorant Garamond' },
  { value: "'Cinzel', serif", label: 'Cinzel' },
  { value: "'Tajawal', sans-serif", label: 'Tajawal' },
  { value: "'Rajdhani', sans-serif", label: 'Rajdhani' },
  { value: "'Teko', sans-serif", label: 'Teko' },
  { value: "'Orbitron', monospace", label: 'Orbitron' },
  { value: "'Amiri', serif", label: 'Amiri' },
]

const DATE_COLORS = [
  { value: '#ffffff', label: 'Putih Terang' },
  { value: '#E8D48B', label: 'Emas Cerah' },
  { value: '#4EEAEA', label: 'Tosca Terang' },
  { value: '#6BA3D6', label: 'Biru Terang' },
  { value: '#F5D78A', label: 'Kuning Cerah' },
]

const CARD_COLORS = [
  { bg: 'rgba(201,168,76,0.08)', border: 'rgba(201,168,76,0.2)', label: 'Emas', dot: '#C9A84C' },
  { bg: 'rgba(100,149,237,0.08)', border: 'rgba(100,149,237,0.2)', label: 'Biru', dot: '#6495ED' },
  { bg: 'rgba(76,175,80,0.08)', border: 'rgba(76,175,80,0.2)', label: 'Hijau', dot: '#4CAF50' },
  { bg: 'rgba(156,100,210,0.08)', border: 'rgba(156,100,210,0.2)', label: 'Ungu', dot: '#9C64D2' },
]

const THEME_OPTIONS = [
  // Dark themes
  { value: 'haramain' as const, label: 'Haramain', accent: '#C9A84C', accentLight: '#E8D48B', isLight: false },
  { value: 'ottoman' as const, label: 'Ottoman', accent: '#08D9D6', accentLight: '#4EEAEA', isLight: false },
  { value: 'madinah' as const, label: 'Madinah Night', accent: '#A8C0D6', accentLight: '#D0E0F0', isLight: false },
  { value: 'nusantara' as const, label: 'Nusantara', accent: '#8DC06A', accentLight: '#B8DD9E', isLight: false },
  { value: 'ramadhan' as const, label: 'Ramadhan Special', accent: '#F5D78A', accentLight: '#FFF5DB', isLight: false },
  // Light / Bright elegant themes
  { value: 'istanbul-pearl' as const, label: 'Istanbul Pearl', accent: '#8B6914', accentLight: '#C9A84C', isLight: true, bg: '#FFFDF7' },
  { value: 'safavid-marble' as const, label: 'Safavid Marble', accent: '#0D7377', accentLight: '#14B8A6', isLight: true, bg: '#FAFCFE' },
  { value: 'andalusian-garden' as const, label: 'Andalusian Garden', accent: '#065F46', accentLight: '#059669', isLight: true, bg: '#FEFDFB' },
  { value: 'ottoman-rose' as const, label: 'Ottoman Rose', accent: '#9F1239', accentLight: '#E11D48', isLight: true, bg: '#FFF8FA' },
  { value: 'al-aqsa-gold' as const, label: 'Al-Aqsa Gold', accent: '#92400E', accentLight: '#B45309', isLight: true, bg: '#FFFBF3' },
  // Layout Variant Themes (different component positions)
  { value: 'nabawi' as const, label: 'Nabawi', accent: '#C9A84C', accentLight: '#E8D48B', isLight: false, bg: '#0d3a28', layout: 'nabawi', description: 'Sidebar kanan untuk jadwal shalat' },
  { value: 'makkah' as const, label: 'Makkah', accent: '#E8C547', accentLight: '#FFF2A8', isLight: false, bg: '#0d0a05', layout: 'makkah', description: 'Jadwal shalat di bar atas' },
  { value: 'cordoba' as const, label: 'Cordoba', accent: '#8B4513', accentLight: '#CD853F', isLight: true, bg: '#F5ECD7', layout: 'cordoba', description: 'Tampilan terpisah kiri-kanan' },
]

const ANALOG_SIZE_OPTIONS = [
  { value: 120, label: 'XS' },
  { value: 160, label: 'SM' },
  { value: 200, label: 'MD' },
  { value: 280, label: 'LG' },
  { value: 360, label: 'XL' },
  { value: 480, label: 'XXL' },
  { value: 600, label: '3XL' },
  { value: 720, label: '4XL' },
  { value: 850, label: '5XL' },
]

const IQOMAH_QUICK = [
  { label: "1'", value: 1 },
  { label: "3'", value: 3 },
  { label: "5'", value: 5 },
  { label: "10'", value: 10 },
  { label: "15'", value: 15 },
]

// ─── Helper: Button Group ────────────────────────────────────────────
function ButtonGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
            value === opt.value
              ? 'border-amber-500 bg-amber-500/20 text-amber-400'
              : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Helper: Add Hadith / Ayat Form ───────────────────────────────────
function AddHadithForm({ onAdd }: { onAdd: (item: { id: string; type: 'hadith' | 'ayat'; arabic: string; meaning: string; source: string; active: boolean }) => void }) {
  const [type, setType] = useState<'hadith' | 'ayat'>('hadith')
  const [arabic, setArabic] = useState('')
  const [meaning, setMeaning] = useState('')
  const [source, setSource] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = () => {
    if (!arabic.trim() || !meaning.trim() || !source.trim()) {
      toast.error('Lengkapi semua field (Arab, Arti, Sumber)')
      return
    }
    onAdd({
      id: `h_${Date.now()}`,
      type,
      arabic: arabic.trim(),
      meaning: meaning.trim(),
      source: source.trim(),
      active: true,
    })
    setArabic('')
    setMeaning('')
    setSource('')
    setIsAdding(false)
    toast.success(`${type === 'ayat' ? 'Ayat' : 'Hadits'} berhasil ditambahkan`)
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 py-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-400"
      >
        <Plus className="h-3.5 w-3.5" />
        Tambah Hadits / Ayat
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-300">Tambah {type === 'ayat' ? 'Ayat Al-Quran' : 'Hadits'}</span>
        <button
          onClick={() => setIsAdding(false)}
          className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Type selector */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-zinc-500">Tipe:</span>
        <div className="flex rounded-lg border border-zinc-700 overflow-hidden">
          <button
            onClick={() => setType('hadith')}
            className={`px-3 py-1 text-[10px] font-semibold transition-colors ${
              type === 'hadith'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Hadits
          </button>
          <button
            onClick={() => setType('ayat')}
            className={`px-3 py-1 text-[10px] font-semibold transition-colors ${
              type === 'ayat'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Ayat
          </button>
        </div>
      </div>

      {/* Arabic text */}
      <div>
        <label className="text-[10px] text-zinc-500 mb-1 block">Teks Arab</label>
        <textarea
          value={arabic}
          onChange={(e) => setArabic(e.target.value)}
          dir="rtl"
          placeholder="اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/25 font-amiri text-right leading-relaxed resize-none"
          rows={2}
        />
      </div>

      {/* Meaning */}
      <div>
        <label className="text-[10px] text-zinc-500 mb-1 block">Arti / Terjemahan</label>
        <textarea
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder="Segala puji bagi Allah, Tuhan seluruh alam."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/25 resize-none"
          rows={2}
        />
      </div>

      {/* Source */}
      <div>
        <label className="text-[10px] text-zinc-500 mb-1 block">Sumber</label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="HR. Bukhari / QS. Al-Fatihah: 1"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/25"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsAdding(false)}
          className="flex-1 rounded-lg border border-zinc-700 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800"
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 rounded-lg bg-amber-500/20 py-2 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/30"
        >
          <Plus className="mr-1 inline h-3 w-3" />
          Tambah
        </button>
      </div>
    </div>
  )
}

// ─── Helper: Section Label ───────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <div className="h-px flex-1 bg-zinc-800" />
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        {children}
      </span>
      <div className="h-px flex-1 bg-zinc-800" />
    </div>
  )
}

// ─── Helper: Slider with label ───────────────────────────────────────
function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  unit?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-zinc-400">{label}</Label>
        <span className="text-xs font-mono text-amber-400">
          {value}
          {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  )
}

// ─── Helper: Toggle Switch with clear ON/OFF visual ──────────────────
function ToggleSwitch({
  label,
  checked,
  onChange,
  description,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  description?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-xs text-zinc-300">{label}</div>
        {description && (
          <div className="text-[10px] text-zinc-500 mt-0.5">{description}</div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${
            checked
              ? 'bg-emerald-500'
              : 'bg-zinc-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span
          className={`text-[10px] font-bold w-6 text-right select-none ${
            checked ? 'text-emerald-400' : 'text-zinc-600'
          }`}
        >
          {checked ? 'ON' : 'OFF'}
        </span>
      </div>
    </div>
  )
}

// ─── Helper: Info Banner ─────────────────────────────────────────────
function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
      <span className="text-[11px] leading-relaxed text-amber-400/80">{children}</span>
    </div>
  )
}

// ─── Login Screen ────────────────────────────────────────────────────
function LoginScreen() {
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { authenticate } = useDevice()

  const handleLogin = useCallback(async () => {
    setError('')
    if (!otp || otp.length !== 4) {
      setError('Masukkan 4 digit Device ID')
      return
    }
    if (!password) {
      setError('Masukkan password')
      return
    }
    setLoading(true)
    try {
      await authenticate(otp, password)
      toast.success('Berhasil masuk!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Autentikasi gagal'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [otp, password, authenticate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
            <Sparkles className="h-8 w-8 text-amber-400" />
          </div>
          <CardTitle className="text-xl text-zinc-100">
            MasjidScreen Settings
          </CardTitle>
          <CardDescription className="text-zinc-500">
            Kelola tampilan jam masjid Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Device ID (4 digit)</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={otp}
                onChange={setOtp}
                containerClassName="gap-3"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="h-12 w-12 bg-zinc-800 border-zinc-700 text-lg text-amber-400" />
                  <InputOTPSlot index={1} className="h-12 w-12 bg-zinc-800 border-zinc-700 text-lg text-amber-400" />
                  <InputOTPSlot index={2} className="h-12 w-12 bg-zinc-800 border-zinc-700 text-lg text-amber-400" />
                  <InputOTPSlot index={3} className="h-12 w-12 bg-zinc-800 border-zinc-700 text-lg text-amber-400" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="bg-zinc-800 border-zinc-700 pr-10 text-zinc-200 placeholder:text-zinc-600"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin()
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-400">
              {error}
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-amber-500 text-black hover:bg-amber-600"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </Button>

          <Link href="/">
            <Button variant="ghost" className="w-full gap-2 text-zinc-400 hover:text-amber-400">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Tampilan
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Settings Dashboard ──────────────────────────────────────────────
function SettingsDashboard() {
  // Store references (read-only for display, write-only on save)
  const storeConfig = useMasjidStore((s) => s.config)
  const setStoreConfig = useMasjidStore((s) => s.setConfig)
  const isLoading = useMasjidStore((s) => s.isLoading)
  const deviceId = useMasjidStore((s) => s.deviceId)
  const lastSynced = useMasjidStore((s) => s.lastSynced)
  const setStoreLastSynced = useMasjidStore((s) => s.setLastSynced)
  const storeIsAuthenticated = useMasjidStore((s) => s.setIsAuthenticated)
  const previewMode = useMasjidStore((s) => s.previewMode)
  const setPreviewMode = useMasjidStore((s) => s.setPreviewMode)
  const { logout: deviceLogout } = useDevice()

  // ─── LOCAL STATE: form edits live here, never overwritten by store ─
  const [formState, setFormState] = useState<MasjidConfig>(() => storeConfig)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [imageUploading, setImageUploading] = useState<Record<number, boolean>>({})
  const [serverThemes, setServerThemes] = useState<Array<{ id: string; name: string; category: string; layout: string; isLight: boolean; accentGold: string; accentLight: string; bgGradient: string; bgSolidColor: string; bgType: string; description: string }>>([])
  const [loadingThemes, setLoadingThemes] = useState(false)
  const formStateRef = useRef(formState)
  formStateRef.current = formState

  // Stable helper to update local form state (never triggers store re-render)
  const updateForm = useCallback((partial: Partial<MasjidConfig>) => {
    setFormState((prev) => ({ ...prev, ...partial }))
  }, [])

  // ─── Unsaved changes detection ─────────────────────────────────────
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(storeConfig) !== JSON.stringify(formState)
  }, [storeConfig, formState])

  // ─── Save: push local state → store → server ──────────────────────
  const handleSave = useCallback(async () => {
    if (!deviceId) return
    const currentForm = formStateRef.current
    setSaving(true)
    try {
      // 1. Push to store so the main display updates live
      setStoreConfig(currentForm)

      // 2. Save to server directly (avoids stale closure issues)
      const res = await fetch(`/api/screens/${deviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: currentForm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan config')

      // 3. Update sync timestamp
      setStoreLastSynced(new Date().toLocaleTimeString('id-ID'))

      toast.success('Pengaturan berhasil disimpan!', {
        description: 'Tampilan akan diperbarui secara otomatis.',
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan'
      toast.error('Gagal menyimpan', { description: msg })
    } finally {
      setSaving(false)
    }
  }, [deviceId, setStoreConfig, setStoreLastSynced])

  // ─── Logout ────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    deviceLogout()
    toast.info('Anda telah keluar')
  }, [deviceLogout])

  // ─── Close Preview Overlay ────────────────────────────────────────
  const closePreview = useCallback(() => {
    setPreviewMode('none')
    setShowPreview(false)
  }, [setPreviewMode])

  // When MosqueDisplay's internal close button sets previewMode to 'none',
  // also close our overlay so the user returns to settings
  const justOpenedPreview = useRef(false)

  const openPreview = useCallback(() => {
    setPreviewMode('none')
    justOpenedPreview.current = true
    setShowPreview(true)
    // Reset the flag after a tick so the useEffect doesn't trigger
    setTimeout(() => { justOpenedPreview.current = false }, 100)
  }, [setPreviewMode])

  const openPreviewAdhan = useCallback(() => {
    setPreviewMode('adhan')
    justOpenedPreview.current = true
    setShowPreview(true)
    setTimeout(() => { justOpenedPreview.current = false }, 100)
  }, [setPreviewMode])

  const openPreviewIqomah = useCallback(() => {
    setPreviewMode('iqomah')
    justOpenedPreview.current = true
    setShowPreview(true)
    setTimeout(() => { justOpenedPreview.current = false }, 100)
  }, [setPreviewMode])

  const openPreviewInfo = useCallback(() => {
    setPreviewMode('info')
    justOpenedPreview.current = true
    setShowPreview(true)
    setTimeout(() => { justOpenedPreview.current = false }, 100)
  }, [setPreviewMode])

  const openPreviewPostIqomah = useCallback(() => {
    setPreviewMode('post-iqomah')
    justOpenedPreview.current = true
    setShowPreview(true)
    setTimeout(() => { justOpenedPreview.current = false }, 100)
  }, [setPreviewMode])

  useEffect(() => {
    if (showPreview && previewMode === 'none' && !justOpenedPreview.current) {
      const timer = setTimeout(() => {
        setShowPreview(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [previewMode, showPreview])

  // ─── Prayer times helpers (use local state) ──────────────────────
  const updatePrayerTime = useCallback(
    (index: number, field: keyof PrayerTime, value: string | boolean) => {
      setFormState((prev) => {
        const updated = [...prev.prayerTimesTemplate]
        if (field === 'isMain') {
          updated[index] = { ...updated[index], [field]: value as boolean }
        } else {
          updated[index] = { ...updated[index], [field]: value as string }
        }
        return { ...prev, prayerTimesTemplate: updated }
      })
    },
    []
  )

  const addPrayerTime = useCallback(() => {
    const id = `custom_${Date.now()}`
    const newPrayer: PrayerTime = {
      id,
      latin: 'Sholat Baru',
      arabic: 'صلاة',
      time: '12:00',
      isMain: false,
    }
    setFormState((prev) => ({
      ...prev,
      prayerTimesTemplate: [...prev.prayerTimesTemplate, newPrayer],
    }))
  }, [])

  const removePrayerTime = useCallback((index: number) => {
    setFormState((prev) => ({
      ...prev,
      prayerTimesTemplate: prev.prayerTimesTemplate.filter((_, i) => i !== index),
    }))
  }, [])

  // ─── Information items helpers (use local state) ──────────────────
  const addInformationItem = useCallback(() => {
    const newItem: InformationItem = {
      id: `info_${Date.now()}`,
      title: 'Pengajian',
      description: 'Keterangan pengajian',
      imageUrl: '',
      imageFileName: '',
      active: true,
      scheduleEnabled: false,
      displayStartTime: '08:00',
      displayEndTime: '17:00',
    }
    setFormState((prev) => ({
      ...prev,
      informationItems: [...(prev.informationItems || []), newItem],
    }))
  }, [])

  const updateInformationItem = useCallback((index: number, field: keyof InformationItem, value: string | boolean) => {
    setFormState((prev) => {
      const updated = [...(prev.informationItems || [])]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, informationItems: updated }
    })
  }, [])

  const removeInformationItem = useCallback((index: number) => {
    setFormState((prev) => ({
      ...prev,
      informationItems: (prev.informationItems || []).filter((_, i) => i !== index),
    }))
  }, [])

  const handleImageUpload = useCallback(async (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 2MB')
      return
    }

    setImageUploading((prev) => ({ ...prev, [index]: true }))
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload gagal')
      }

      // Update the information item with the URL and file name
      setFormState((prev) => {
        const updated = [...(prev.informationItems || [])]
        updated[index] = {
          ...updated[index],
          imageUrl: data.url,
          imageFileName: data.fileName,
        }
        return { ...prev, informationItems: updated }
      })

      toast.success('Gambar berhasil diupload ke cloud!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload gagal'
      toast.error(msg)
    } finally {
      setImageUploading((prev) => ({ ...prev, [index]: false }))
    }
  }, [])

  const handleImageDelete = useCallback(async (index: number, fileName: string) => {
    // Remove from local state immediately
    setFormState((prev) => {
      const updated = [...(prev.informationItems || [])]
      updated[index] = {
        ...updated[index],
        imageUrl: '',
        imageFileName: '',
      }
      return { ...prev, informationItems: updated }
    })

    // Try to delete from Supabase Storage in background
    if (fileName) {
      try {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName }),
        })
      } catch {
        // Silent fail - image already removed from config
      }
    }

    toast.success('Gambar berhasil dihapus')
  }, [])

  // ─── Fetch server themes (public) ─────────────────────────────
  const fetchServerThemes = useCallback(async () => {
    setLoadingThemes(true)
    try {
      const res = await fetch('/api/themes/public')
      const data = await res.json()
      if (res.ok && data.themes) {
        setServerThemes(data.themes.map((t: Record<string, unknown>) => ({
          id: t.id,
          name: t.name,
          category: t.category,
          layout: t.layout,
          isLight: t.isLight,
          accentGold: t.accentGold || '#C9A84C',
          accentLight: t.accentLight || '#E8D48B',
          bgGradient: t.bgGradient || '',
          bgSolidColor: t.bgSolidColor || '',
          bgType: t.bgType || 'gradient',
          description: t.description || '',
        })))
      }
    } catch {
      // Silently fail - themes are optional
    } finally {
      setLoadingThemes(false)
    }
  }, [])

  useEffect(() => {
    fetchServerThemes()
  }, [fetchServerThemes])

  // ─── Apply server theme to device config ──────────────────────
  const applyServerTheme = useCallback(async (themeId: string) => {
    try {
      const res = await fetch(`/api/themes/${themeId}`)
      const data = await res.json()
      if (!res.ok || !data.theme) {
        toast.error('Gagal memuat tema')
        return
      }
      const t = data.theme
      // Apply theme settings to the form state
      const updates: Partial<MasjidConfig> = {
        theme: 'custom' as MasjidConfig['theme'],
        customThemeAccent: t.accentGold || '#C9A84C',
        customThemeAccentLight: t.accentLight || '#E8D48B',
      }
      // Apply background
      if (t.bgType === 'image' && t.bgImageUrl) {
        updates.customBackgroundImage = t.bgImageUrl
        updates.customBackgroundOpacity = t.bgImageOpacity || 30
      } else {
        updates.customBackgroundImage = ''
      }
      // Apply clock settings
      if (t.clockType) updates.clockType = t.clockType
      if (t.clockFont) updates.digitalFontFamily = t.clockFont
      if (t.clockSize) updates.digitalFontSize = t.clockSize
      if (t.clockStyle) updates.clockStyle = t.clockStyle
      // Apply font settings
      if (t.mosqueNameFont) updates.mosqueNameFontFamily = t.mosqueNameFont
      if (t.mosqueNameSize) updates.mosqueNameFontSize = t.mosqueNameSize
      if (t.dateFont) updates.dateFontFamily = t.dateFont
      if (t.dateSize) updates.dateFontSize = t.dateSize
      if (t.dateColor) updates.dateColor = t.dateColor
      // Apply card settings
      if (t.cardBg) updates.cardBgColor = t.cardBg
      if (t.cardBorder) updates.cardBorderColor = t.cardBorder
      if (t.cardFontSize) updates.prayerCardFontSize = t.cardFontSize
      // Apply iqomah settings
      if (t.iqomahFont) updates.iqomahFontFamily = t.iqomahFont
      if (t.iqomahSize) updates.iqomahFontSize = t.iqomahSize

      updateForm(updates)
      toast.success(`Tema "${t.name}" diterapkan! Simpan untuk menyimpan perubahan.`)
    } catch {
      toast.error('Gagal memuat tema dari server')
    }
  }, [updateForm])

  // ─── Shorthand alias for readability ──────────────────────────────
  const c = formState

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* ─── Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-amber-400" />
            <h1 className="text-sm font-semibold text-zinc-200">
              MasjidScreen Settings
            </h1>
            {hasUnsavedChanges && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                Belum disimpan
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {deviceId && (
              <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px]">
                ID: {deviceId}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={openPreview}
              className="h-7 gap-1 text-[11px] text-zinc-400 hover:text-emerald-400"
            >
              <Eye className="h-3 w-3" />
              Preview
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-zinc-500 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-800/50 px-4 py-1.5">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-zinc-500">
              {lastSynced ? `Tersinkronisasi ${lastSynced}` : 'Tersinkronisasi'}
            </span>
          </div>
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-[11px] text-zinc-400 hover:text-amber-400"
            >
              <Monitor className="h-3 w-3" />
              Kembali ke Tampilan
            </Button>
          </Link>
        </div>
      </header>

      {/* ─── Scrollable Content ───────────────────────────────────── */}
      <ScrollArea className="flex-1 pb-24">
        <div className="mx-auto max-w-lg space-y-3 p-4">
          <Accordion
            type="multiple"
            defaultValue={['mosque', 'clock', 'prayer', 'adhan', 'running', 'info', 'theme']}
            className="space-y-3"
          >
            {/* ─── Section A: Nama Masjid & Tanggal ─────────────────── */}
            <AccordionItem value="mosque" className="rounded-xl border border-zinc-800 bg-zinc-900 px-4">
              <AccordionTrigger className="py-4 text-sm font-medium text-zinc-200 hover:no-underline">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-amber-400" />
                  Nama Masjid & Tanggal
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                {/* Mosque Name (Indonesian) */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Nama Masjid (Indonesia)</Label>
                  <Input
                    value={c.mosqueName}
                    onChange={(e) => updateForm({ mosqueName: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-sm text-zinc-200"
                    placeholder="Nama masjid"
                  />
                </div>

                {/* Mosque Name (Arabic) */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Nama Masjid (Arab)</Label>
                  <Input
                    value={c.mosqueNameArabic}
                    onChange={(e) => updateForm({ mosqueNameArabic: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-sm text-zinc-200"
                    dir="rtl"
                    style={{ fontFamily: "'Amiri', serif" }}
                    placeholder="مَسْجِد"
                  />
                </div>

                {/* Mosque Font */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Font Nama Masjid</Label>
                  <Select
                    value={c.mosqueNameFontFamily}
                    onValueChange={(v) => updateForm({ mosqueNameFontFamily: v })}
                  >
                    <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-sm text-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-800 bg-zinc-900">
                      {FONT_OPTIONS_MOSQUE.map((f) => (
                        <SelectItem key={f.value} value={f.value} className="text-zinc-300">
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mosque Name Size */}
                <SliderField
                  label="Ukuran Nama Masjid"
                  value={c.mosqueNameFontSize}
                  onChange={(v) => updateForm({ mosqueNameFontSize: v })}
                  min={0.5}
                  max={3}
                  step={0.1}
                  unit="rem"
                />

                <Separator className="bg-zinc-800" />

                {/* Date Font */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Font Tanggal / Hari</Label>
                  <Select
                    value={c.dateFontFamily}
                    onValueChange={(v) => updateForm({ dateFontFamily: v })}
                  >
                    <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-sm text-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-800 bg-zinc-900">
                      {FONT_OPTIONS_DATE.map((f) => (
                        <SelectItem key={f.value} value={f.value} className="text-zinc-300">
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Size */}
                <SliderField
                  label="Ukuran Tanggal"
                  value={c.dateFontSize}
                  onChange={(v) => updateForm({ dateFontSize: v })}
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  unit="rem"
                />

                {/* Date Opacity */}
                <SliderField
                  label="Transparansi Tanggal"
                  value={c.dateOpacity ?? 0.85}
                  onChange={(v) => updateForm({ dateOpacity: v })}
                  min={0.3}
                  max={1}
                  step={0.05}
                  unit=""
                />

                {/* Date Color */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Warna Tanggal</Label>
                  <div className="flex flex-wrap gap-2">
                    {DATE_COLORS.map((dc) => (
                      <button
                        key={dc.value}
                        type="button"
                        onClick={() => updateForm({ dateColor: dc.value })}
                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all ${
                          c.dateColor === dc.value
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600'
                        }`}
                      >
                        <div
                          className="h-3 w-3 rounded-full border border-zinc-600"
                          style={{ backgroundColor: dc.value }}
                        />
                        {dc.label}
                      </button>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ─── Section: Pengaturan Waktu ────────────────────── */}
            <AccordionItem value="timezone" className="rounded-xl border border-zinc-800 bg-zinc-900 px-4">
              <AccordionTrigger className="py-4 text-sm font-medium text-zinc-200 hover:no-underline">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-400" />
                  Pengaturan Waktu
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                {/* Auto / Manual toggle */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Mode Waktu</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateForm({ timezoneMode: 'auto' })}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        c.timezoneMode === 'auto'
                          ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                          : 'border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600'
                      }`}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Otomatis (GPS)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateForm({ timezoneMode: 'manual' })}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        c.timezoneMode === 'manual'
                          ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                          : 'border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Manual
                    </button>
                  </div>
                </div>

                {c.timezoneMode === 'auto' && (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5">
                    <p className="text-[10px] text-zinc-500">
                      Deteksi zona waktu perangkat:
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-amber-400">
                      {typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'N/A'}
                    </p>
                    <p className="mt-0.5 text-[10px] text-zinc-600">
                      Waktu saat ini: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                )}

                {c.timezoneMode === 'manual' && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-zinc-500">
                      Atur koreksi waktu secara manual (tambah/kurangi jam, menit, detik dari waktu perangkat)
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Hours */}
                      <div className="space-y-1">
                        <Label className="text-[10px] text-zinc-500">Jam</Label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateForm({ timeCorrectionHours: Math.min(c.timeCorrectionHours + 1, 12) })}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                          >
                            +
                          </button>
                          <Input
                            type="number"
                            min={-12}
                            max={12}
                            value={c.timeCorrectionHours}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 0
                              updateForm({ timeCorrectionHours: Math.max(-12, Math.min(12, v)) })
                            }}
                            className="h-8 bg-zinc-800 border-zinc-700 text-center text-sm text-zinc-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateForm({ timeCorrectionHours: Math.max(c.timeCorrectionHours - 1, -12) })}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                          >
                            −
                          </button>
                        </div>
                      </div>
                      {/* Minutes */}
                      <div className="space-y-1">
                        <Label className="text-[10px] text-zinc-500">Menit</Label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateForm({ timeCorrectionMinutes: Math.min(c.timeCorrectionMinutes + 1, 59) })}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                          >
                            +
                          </button>
                          <Input
                            type="number"
                            min={-59}
                            max={59}
                            value={c.timeCorrectionMinutes}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 0
                              updateForm({ timeCorrectionMinutes: Math.max(-59, Math.min(59, v)) })
                            }}
                            className="h-8 bg-zinc-800 border-zinc-700 text-center text-sm text-zinc-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateForm({ timeCorrectionMinutes: Math.max(c.timeCorrectionMinutes - 1, -59) })}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                          >
                            −
                          </button>
                        </div>
                      </div>
                      {/* Seconds */}
                      <div className="space-y-1">
                        <Label className="text-[10px] text-zinc-500">Detik</Label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateForm({ timeCorrectionSeconds: Math.min(c.timeCorrectionSeconds + 1, 59) })}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                          >
                            +
                          </button>
                          <Input
                            type="number"
                            min={-59}
                            max={59}
                            value={c.timeCorrectionSeconds}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 0
                              updateForm({ timeCorrectionSeconds: Math.max(-59, Math.min(59, v)) })
                            }}
                            className="h-8 bg-zinc-800 border-zinc-700 text-center text-sm text-zinc-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateForm({ timeCorrectionSeconds: Math.max(c.timeCorrectionSeconds - 1, -59) })}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                          >
                            −
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Preview corrected time */}
                    <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5">
                      <p className="text-[10px] text-zinc-500">Preview waktu setelah koreksi:</p>
                      <p className="mt-0.5 text-sm font-mono font-bold text-amber-400">
                        {(() => {
                          const now = new Date()
                          const correctionSec = (c.timeCorrectionHours * 3600) + (c.timeCorrectionMinutes * 60) + c.timeCorrectionSeconds
                          const corrected = new Date(now.getTime() + correctionSec * 1000)
                          return corrected.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        })()}
                      </p>
                    </div>
                    <p className="text-[10px] text-zinc-600">
                      Gunakan minus (−) jika waktu perangkat lebih cepat dari waktu sebenarnya
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* ─── Section B: Jam Utama ────────────────────────────── */}
            <AccordionItem value="clock" className="rounded-xl border border-zinc-800 bg-zinc-900 px-4">
              <AccordionTrigger className="py-4 text-sm font-medium text-zinc-200 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  Jam Utama
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                {/* Clock Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Tipe Jam</Label>
                  <ButtonGroup
                    options={[
                      { value: 'digital', label: 'Digital' },
                      { value: 'analog', label: 'Analog' },
                    ]}
                    value={c.clockType}
                    onChange={(v) => updateForm({ clockType: v as 'digital' | 'analog' })}
                  />
                </div>

                {c.clockType === 'digital' ? (
                  <>
                    {/* Digital Clock Style */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-400">Gaya Jam Digital</Label>
                      <ButtonGroup
                        options={[
                          { value: 'default', label: 'Default' },
                          { value: 'retro', label: 'Retro' },
                          { value: 'minimal', label: 'Minimal' },
                        ]}
                        value={c.clockStyle || 'default'}
                        onChange={(v) => updateForm({ clockStyle: v as 'default' | 'retro' | 'minimal' })}
                      />
                    </div>

                    {/* Digital Font */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-400">Font Jam Digital</Label>
                      <Select
                        value={c.digitalFontFamily}
                        onValueChange={(v) => updateForm({ digitalFontFamily: v })}
                      >
                        <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-sm text-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-800 bg-zinc-900">
                          {FONT_OPTIONS_DIGITAL.map((f) => (
                            <SelectItem key={f.value} value={f.value} className="text-zinc-300">
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Digital Clock Size */}
                    <SliderField
                      label="Ukuran Jam Digital"
                      value={c.digitalFontSize}
                      onChange={(v) => updateForm({ digitalFontSize: v })}
                      min={2}
                      max={40}
                      step={0.5}
                      unit="rem"
                    />
                  </>
                ) : (
                  <>
                    {/* Analog Number Style */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-400">Gaya Angka Analog</Label>
                      <ButtonGroup
                        options={[
                          { value: 'arabic', label: 'Arab' },
                          { value: 'roman', label: 'Romawi' },
                          { value: 'hindi', label: 'Hijriyah' },
                        ]}
                        value={c.analogNumberStyle}
                        onChange={(v) =>
                          updateForm({
                            analogNumberStyle: v as 'arabic' | 'roman' | 'hindi',
                          })
                        }
                      />
                    </div>

                    {/* Analog Size */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-400">Ukuran Analog</Label>
                      <div className="flex flex-wrap gap-2">
                        {ANALOG_SIZE_OPTIONS.map((s) => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => updateForm({ analogSize: s.value })}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                              c.analogSize === s.value
                                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                                : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Show Seconds */}
                <ToggleSwitch
                  label="Tampilkan Detik"
                  checked={c.showSeconds}
                  onChange={(v) => updateForm({ showSeconds: v })}
                />

                {/* Clock Animation */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Animasi Jam</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'none', label: 'Tanpa Animasi' },
                      { value: 'glow', label: 'Glow' },
                      { value: 'pulse', label: 'Pulse' },
                      { value: 'retro-blink', label: 'Retro Blink' },
                      { value: 'fade-breathe', label: 'Fade Breathe' },
                    ].map((a) => (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() => updateForm({ clockAnimation: a.value as MasjidConfig['clockAnimation'] })}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${
                          (c.clockAnimation || 'none') === a.value
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600'
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ─── Section C: Jadwal Sholat & Sidebar ──────────────── */}
            <AccordionItem value="prayer" className="rounded-xl border border-zinc-800 bg-zinc-900 px-4">
              <AccordionTrigger className="py-4 text-sm font-medium text-zinc-200 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  Jadwal Sholat & Sidebar
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                {/* Source Mode */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Mode Sumber Jadwal</Label>
                  <ButtonGroup
                    options={[
                      { value: 'auto', label: 'Otomatis' },
                      { value: 'manual', label: 'Manual' },
                    ]}
                    value={c.prayerSourceMode}
                    onChange={(v) =>
                      updateForm({ prayerSourceMode: v as 'auto' | 'manual' })
                    }
                  />
                </div>

                {/* Manual Prayer Times */}
                {c.prayerSourceMode === 'manual' && (
                  <div className="space-y-2">
                    <SectionLabel>Jadwal Sholat Manual</SectionLabel>
                    <div className="max-h-72 space-y-2 overflow-y-auto">
                      {c.prayerTimesTemplate.map((prayer, idx) => (
                        <div
                          key={prayer.id}
                          className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-800/50 p-2"
                        >
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-500" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
                                {prayer.arabic}
                              </span>
                              <Input
                                value={prayer.latin}
                                onChange={(e) =>
                                  updatePrayerTime(idx, 'latin', e.target.value)
                                }
                                className="h-7 flex-1 border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-300"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={prayer.time}
                                onChange={(e) =>
                                  updatePrayerTime(idx, 'time', e.target.value)
                                }
                                className="h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-300 [color-scheme:dark]"
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePrayerTime(idx)}
                            className="h-7 w-7 shrink-0 text-zinc-600 hover:text-red-400"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      onClick={addPrayerTime}
                      className="w-full border border-dashed border-zinc-700 text-xs text-zinc-500 hover:border-amber-500/50 hover:text-amber-400"
                    >
                      <Plus className="h-3 w-3" />
                      Tambah Sholat
                    </Button>
                  </div>
                )}

                {/* Prayer Card Font Size */}
                <SliderField
                  label="Ukuran Font Kartu Sholat"
                  value={c.prayerCardFontSize}
                  onChange={(v) => updateForm({ prayerCardFontSize: v })}
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  unit="x"
                />

                <Separator className="bg-zinc-800" />

                {/* Card Color */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Warna Kartu Sholat</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {CARD_COLORS.map((cc) => (
                      <button
                        key={cc.label}
                        type="button"
                        onClick={() =>
                          updateForm({
                            cardBgColor: cc.bg,
                            cardBorderColor: cc.border,
                          })
                        }
                        className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] transition-all ${
                          c.cardBgColor === cc.bg
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600'
                        }`}
                      >
                        <div
                          className="h-5 w-5 rounded-full border border-zinc-600"
                          style={{ backgroundColor: cc.dot }}
                        />
                        {cc.label}
                      </button>
                    ))}
                  </div>
                </div>

              </AccordionContent>
            </AccordionItem>

            {/* ─── Section D: Mode Adhan & Iqomah ──────────────────── */}
            <AccordionItem value="adhan" className="rounded-xl border border-zinc-800 bg-zinc-900 px-4">
              <AccordionTrigger className="py-4 text-sm font-medium text-zinc-200 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-amber-400" />
                  Mode Adhan & Iqomah
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                {/* Info banner: 5 main prayers only */}
                <InfoBanner>
                  Mode Adhan &amp; Iqomah hanya berlaku untuk sholat 5 waktu (Subuh, Dzuhur, Ashar, Maghrib, Isya). Sholat sunnah seperti Dhuha &amp; Tahajud tidak memicu Adhan/Iqomah.
                </InfoBanner>

                {/* Adhan Enable */}
                <ToggleSwitch
                  label="Aktifkan Mode Adhan"
                  checked={c.adhanModeEnabled}
                  onChange={(v) => updateForm({ adhanModeEnabled: v })}
                  description="Tampilan layar penuh saat waktu adhan tiba"
                />

                {c.adhanModeEnabled && (
                  <>
                    {/* Adhan Duration */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-400">Durasi Adhan</Label>
                      <ButtonGroup
                        options={[
                          { value: '120', label: '2 menit' },
                          { value: '180', label: '3 menit' },
                          { value: '300', label: '5 menit' },
                        ]}
                        value={String(c.adhanDuration)}
                        onChange={(v) => updateForm({ adhanDuration: Number(v) })}
                      />
                    </div>

                    {/* Adhan Countdown Animation */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-400">Animasi Hitung Mundur Adhan</Label>
                      <ButtonGroup
                        options={[
                          { value: 'pulse', label: 'Pulse' },
                          { value: 'glow', label: 'Glow' },
                          { value: 'blink', label: 'Blink' },
                          { value: 'scale', label: 'Scale' },
                          { value: 'none', label: 'Tanpa Animasi' },
                        ]}
                        value={c.adhanCountdownAnimation || 'pulse'}
                        onChange={(v) => updateForm({ adhanCountdownAnimation: v as 'pulse' | 'glow' | 'blink' | 'scale' | 'none' })}
                      />
                    </div>
                  </>
                )}

                <Separator className="bg-zinc-800" />

                {/* Iqomah Enable */}
                <ToggleSwitch
                  label="Aktifkan Mode Iqomah"
                  checked={c.iqomahModeEnabled}
                  onChange={(v) => updateForm({ iqomahModeEnabled: v })}
                  description="Hitung mundur iqomah setelah adhan selesai"
                />

                {c.iqomahModeEnabled && (
                  <>
                    {/* Iqomah Font */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-400">Font Iqomah</Label>
                      <Select
                        value={c.iqomahFontFamily}
                        onValueChange={(v) => updateForm({ iqomahFontFamily: v })}
                      >
                        <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-sm text-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-800 bg-zinc-900">
                          {FONT_OPTIONS_IQOMAH.map((f) => (
                            <SelectItem key={f.value} value={f.value} className="text-zinc-300">
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Iqomah Font Size */}
                    <SliderField
                      label="Ukuran Font Iqomah"
                      value={c.iqomahFontSize}
                      onChange={(v) => updateForm({ iqomahFontSize: v })}
                      min={4}
                      max={20}
                      step={0.5}
                      unit="rem"
                    />

                    {/* Iqomah Beep */}
                    <ToggleSwitch
                      label="Suara Beep Iqomah"
                      checked={c.iqomahBeepEnabled}
                      onChange={(v) => updateForm({ iqomahBeepEnabled: v })}
                      description="Bunyi beep pendek saat iqomah dimulai"
                    />

                    {/* Iqomah Minutes */}
                    <div className="space-y-2">
                      <SliderField
                        label="Menit Iqomah (setelah Adhan)"
                        value={c.iqomahMinutes}
                        onChange={(v) => updateForm({ iqomahMinutes: v })}
                        min={1}
                        max={20}
                        step={1}
                        unit=" menit"
                      />
                      <div className="flex flex-wrap gap-2">
                        {IQOMAH_QUICK.map((q) => (
                          <button
                            key={q.value}
                            type="button"
                            onClick={() => updateForm({ iqomahMinutes: q.value })}
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                              c.iqomahMinutes === q.value
                                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                                : 'border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600'
                            }`}
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Iqomah Countdown Animation */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-400">Animasi Hitung Mundur Iqomah</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'pulse', label: 'Pulse' },
                          { value: 'led-jadul', label: 'LED Jadul' },
                          { value: 'glow', label: 'Glow' },
                          { value: 'blink', label: 'Blink' },
                          { value: 'scale', label: 'Scale' },
                          { value: 'none', label: 'Tanpa Animasi' },
                        ].map((a) => (
                          <button
                            key={a.value}
                            type="button"
                            onClick={() => updateForm({ iqomahCountdownAnimation: a.value as MasjidConfig['iqomahCountdownAnimation'] })}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${
                              (c.iqomahCountdownAnimation || 'pulse') === a.value
                                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                : 'border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600'
                            }`}
                          >
                            {a.value === 'led-jadul' && <span className="text-sm">📺</span>}
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Post-Iqomah Message */}
                {c.iqomahModeEnabled && (
                  <ToggleSwitch
                    label="Tampilkan Pesan Setelah Iqomah"
                    checked={c.postIqomahEnabled}
                    onChange={(v) => updateForm({ postIqomahEnabled: v })}
                    description='Tampilkan "Selamat Menunaikan Ibadah Shalat" selama 2 menit setelah iqomah'
                  />
                )}

                {/* Hadith / Ayat Collection Management */}
                {c.postIqomahEnabled && (
                  <>
                    <Separator className="bg-zinc-800" />
                    <SectionLabel>Koleksi Hadits & Ayat Al-Quran</SectionLabel>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Hadits dan ayat akan ditampilkan bergantian pada layar shalat (setelah iqomah). Tambahkan koleksi Anda di bawah ini.
                    </p>

                    {/* Existing hadith list */}
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                      {(c.hadithCollection || []).map((item, idx) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                  item.type === 'ayat'
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : 'bg-amber-500/15 text-amber-400'
                                }`}
                              >
                                {item.type === 'ayat' ? 'Ayat' : 'Hadits'}
                              </span>
                              <span className="text-[10px] text-zinc-500">#{idx + 1}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  const updated = [...(c.hadithCollection || [])]
                                  updated[idx] = { ...updated[idx], active: !updated[idx].active }
                                  updateForm({ hadithCollection: updated })
                                }}
                                className={`flex h-6 w-10 items-center rounded-full px-0.5 transition-colors ${
                                  item.active ? 'bg-amber-500' : 'bg-zinc-700'
                                }`}
                              >
                                <div
                                  className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                    item.active ? 'translate-x-4' : ''
                                  }`}
                                />
                              </button>
                              <button
                                onClick={() => {
                                  const updated = (c.hadithCollection || []).filter((_, i) => i !== idx)
                                  updateForm({ hadithCollection: updated })
                                }}
                                className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          {/* Arabic text */}
                          <div className="rounded bg-zinc-800/50 px-2.5 py-1.5">
                            <p className="text-right text-sm leading-relaxed text-zinc-200 font-amiri" dir="rtl">
                              {item.arabic}
                            </p>
                          </div>
                          {/* Meaning */}
                          <p className="text-xs text-zinc-400 italic pl-3 border-l-2 border-zinc-700">
                            {item.meaning}
                          </p>
                          {/* Source */}
                          <p className="text-[10px] text-zinc-600 font-semibold tracking-wide">
                            {item.source}
                          </p>
                        </div>
                      ))}
                      {(c.hadithCollection || []).length === 0 && (
                        <div className="rounded-lg border border-dashed border-zinc-800 py-6 text-center">
                          <BookOpen className="mx-auto mb-2 h-6 w-6 text-zinc-600" />
                          <p className="text-xs text-zinc-500">Belum ada hadits atau ayat</p>
                        </div>
                      )}
                    </div>

                    {/* Add new hadith/ayat */}
                    <AddHadithForm
                      onAdd={(item) => {
                        const collection = c.hadithCollection || []
                        updateForm({ hadithCollection: [...collection, item] })
                      }}
                    />
                  </>
                )}

                {/* Preview Buttons */}
                <Separator className="bg-zinc-800" />
                <SectionLabel>Preview Tampilan</SectionLabel>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={openPreviewAdhan}
                    className="w-full border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/10"
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    <span className="text-[10px]">Adhan</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openPreviewIqomah}
                    className="w-full border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    <span className="text-[10px]">Iqomah</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openPreviewPostIqomah}
                    className="w-full border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    <span className="text-[10px]">Shalat</span>
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ─── Section E: Teks Berjalan ─────────────────────────── */}
            <AccordionItem value="running" className="rounded-xl border border-zinc-800 bg-zinc-900 px-4">
              <AccordionTrigger className="py-4 text-sm font-medium text-zinc-200 hover:no-underline">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-amber-400" />
                  Teks Berjalan
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                {/* Show Running Text */}
                <ToggleSwitch
                  label="Tampilkan Teks Berjalan"
                  checked={c.showAnnouncement}
                  onChange={(v) => updateForm({ showAnnouncement: v })}
                  description="Teks pengumuman muncul di bagian bawah layar"
                />

                {/* Animation Style */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Gaya Animasi</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'scroll-left', label: 'Geser Kiri', icon: '←' },
                      { value: 'scroll-right', label: 'Geser Kanan', icon: '→' },
                      { value: 'alternate', label: 'Bolak-balik', icon: '↔' },
                      { value: 'fade', label: 'Fade', icon: '○' },
                    ].map((a) => (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() =>
                          updateForm({
                            runningAnimation: a.value as MasjidConfig['runningAnimation'],
                          })
                        }
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${
                          c.runningAnimation === a.value
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600'
                        }`}
                      >
                        <span className="text-sm">{a.icon}</span>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed */}
                <SliderField
                  label="Kecepatan Animasi"
                  value={c.runningSpeed}
                  onChange={(v) => updateForm({ runningSpeed: v })}
                  min={5}
                  max={60}
                  step={1}
                  unit="s"
                />

                {/* Running Text Font */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Font Teks Berjalan</Label>
                  <Select
                    value={c.runningFontFamily}
                    onValueChange={(v) => updateForm({ runningFontFamily: v })}
                  >
                    <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-sm text-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-800 bg-zinc-900">
                      {FONT_OPTIONS_RUNNING.map((f) => (
                        <SelectItem key={f.value} value={f.value} className="text-zinc-300">
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Running Text Font Size */}
                <SliderField
                  label="Ukuran Font Teks Berjalan"
                  value={c.runningFontSize}
                  onChange={(v) => updateForm({ runningFontSize: v })}
                  min={0.5}
                  max={3}
                  step={0.1}
                  unit="rem"
                />

                {/* Announcement Text */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Teks Pengumuman</Label>
                  <Textarea
                    value={c.announcement}
                    onChange={(e) => updateForm({ announcement: e.target.value })}
                    className="min-h-20 resize-none bg-zinc-800 border-zinc-700 text-sm text-zinc-200"
                    placeholder="Masukkan teks pengumuman..."
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ─── Section F: Informasi Pengajian ──────────────────── */}
            <AccordionItem value="info" className="rounded-xl border border-zinc-800 bg-zinc-900 px-4">
              <AccordionTrigger className="py-4 text-sm font-medium text-zinc-200 hover:no-underline">
                <div className="flex items-center gap-2">
                  <FileImage className="h-4 w-4 text-amber-400" />
                  Informasi & Pengajian
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <InfoBanner>
                  Tambahkan informasi pengajian, kajian, atau acara masjid. Gambar disimpan di cloud Supabase. Atur jadwal tampil masing-masing informasi.
                </InfoBanner>

                <ToggleSwitch
                  label="Tampilkan Informasi di Layar Utama"
                  checked={c.informationEnabled}
                  onChange={(v) => updateForm({ informationEnabled: v })}
                  description="Informasi aktif akan ditampilkan bergantian di layar"
                />

                {c.informationEnabled && (
                  <>
                    <Separator className="bg-zinc-800" />
                    <SectionLabel>Pengaturan Tampilan Informasi</SectionLabel>

                    {/* Info Title Position */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-400">Posisi Judul & Deskripsi</Label>
                      <ButtonGroup
                        options={[
                          { value: 'top-left', label: 'Atas Kiri (dalam gambar)' },
                          { value: 'top-right', label: 'Atas Kanan (dalam gambar)' },
                          { value: 'inside-image', label: 'Bawah Tengah (dalam gambar)' },
                        ]}
                        value={c.infoTitlePosition || 'top-left'}
                        onChange={(v) => updateForm({ infoTitlePosition: v as 'top-left' | 'top-right' | 'inside-image' })}
                      />
                    </div>

                    {/* Info Title Font Color */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-400">Warna Font Judul</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={c.infoTitleFontColor || '#ffffff'}
                          onChange={(e) => updateForm({ infoTitleFontColor: e.target.value })}
                          className="h-8 w-12 cursor-pointer rounded border border-zinc-700 bg-transparent"
                        />
                        <Input
                          value={c.infoTitleFontColor || '#ffffff'}
                          onChange={(e) => updateForm({ infoTitleFontColor: e.target.value })}
                          className="flex-1 bg-zinc-800 border-zinc-700 text-xs text-zinc-200 font-mono"
                          maxLength={7}
                        />
                      </div>
                    </div>

                    {/* Info Title Font Family */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-400">Font Judul</Label>
                      <Select
                        value={c.infoTitleFontFamily || "'Amiri', serif"}
                        onValueChange={(v) => updateForm({ infoTitleFontFamily: v })}
                      >
                        <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-sm text-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-800 bg-zinc-900">
                          {FONT_OPTIONS_RUNNING.map((f) => (
                            <SelectItem key={f.value} value={f.value} className="text-zinc-300">
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Info Title Font Size */}
                    <SliderField
                      label="Ukuran Font Judul"
                      value={c.infoTitleFontSize || 2.5}
                      onChange={(v) => updateForm({ infoTitleFontSize: v })}
                      min={0.5}
                      max={5}
                      step={0.1}
                      unit="rem"
                    />

                    {/* Info Description Font Family */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-400">Font Deskripsi</Label>
                      <Select
                        value={c.infoDescriptionFontFamily || "'Inter', sans-serif"}
                        onValueChange={(v) => updateForm({ infoDescriptionFontFamily: v })}
                      >
                        <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-sm text-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-800 bg-zinc-900">
                          {FONT_OPTIONS_RUNNING.map((f) => (
                            <SelectItem key={f.value} value={f.value} className="text-zinc-300">
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Info Description Font Size */}
                    <SliderField
                      label="Ukuran Font Deskripsi"
                      value={c.infoDescriptionFontSize || 1.2}
                      onChange={(v) => updateForm({ infoDescriptionFontSize: v })}
                      min={0.5}
                      max={3}
                      step={0.1}
                      unit="rem"
                    />

                    {/* Info Image Size */}
                    <SliderField
                      label="Ukuran Gambar Informasi"
                      value={c.infoImageSize || 85}
                      onChange={(v) => updateForm({ infoImageSize: v })}
                      min={30}
                      max={100}
                      step={5}
                      unit="%"
                    />
                  </>
                )}

                {c.informationItems?.length > 0 && (
                  <div className="space-y-3">
                    <SectionLabel>Daftar Informasi</SectionLabel>
                    <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
                      {c.informationItems.map((item, idx) => (
                        <div
                          key={item.id}
                          className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-800/50 p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <ToggleSwitch
                              label={item.title || 'Tanpa Judul'}
                              checked={item.active}
                              onChange={(v) => updateInformationItem(idx, 'active', v)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeInformationItem(idx)}
                              className="h-7 w-7 shrink-0 text-zinc-600 hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <Input
                            value={item.title}
                            onChange={(e) => updateInformationItem(idx, 'title', e.target.value)}
                            className="h-8 border-zinc-700 bg-zinc-900 text-xs text-zinc-300"
                            placeholder="Judul (contoh: Pengajian Minggu)"
                          />
                          <Textarea
                            value={item.description}
                            onChange={(e) => updateInformationItem(idx, 'description', e.target.value)}
                            className="min-h-16 resize-none border-zinc-700 bg-zinc-900 text-xs text-zinc-300"
                            placeholder="Keterangan detail..."
                          />

                          {/* Image Upload to Supabase */}
                          <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-500">Gambar (opsional, max 2MB)</Label>
                            {item.imageUrl ? (
                              <div className="relative">
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="h-32 w-full rounded-lg border border-zinc-700 object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleImageDelete(idx, item.imageFileName)}
                                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-white hover:bg-red-500"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-4 transition-colors hover:border-amber-500/50 hover:bg-zinc-800">
                                {imageUploading[idx] ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                                    <span className="text-xs text-amber-400">Mengupload...</span>
                                  </>
                                ) : (
                                  <>
                                    <ImageUp className="h-4 w-4 text-zinc-500" />
                                    <span className="text-xs text-zinc-500">Upload Gambar</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/gif,image/webp"
                                  className="hidden"
                                  disabled={imageUploading[idx]}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleImageUpload(idx, file)
                                  }}
                                />
                              </label>
                            )}
                          </div>

                          {/* Schedule Settings */}
                          <div className="space-y-2 rounded-lg border border-zinc-700/50 bg-zinc-900/50 p-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-zinc-400">Atur Jadwal Tampil</Label>
                              <ToggleSwitch
                                label=""
                                checked={!!item.scheduleEnabled}
                                onChange={(v) => updateInformationItem(idx, 'scheduleEnabled', v)}
                              />
                            </div>
                            {item.scheduleEnabled && (
                              <div className="space-y-2">
                                <InfoBanner>
                                  Informasi tidak akan tampil saat jam sholat dan iqomah. Setelah iqomah selesai, tampilan akan kembali aktif.
                                </InfoBanner>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-[10px] text-zinc-500">Mulai Jam</Label>
                                    <input
                                      type="time"
                                      value={item.displayStartTime || '08:00'}
                                      onChange={(e) => updateInformationItem(idx, 'displayStartTime', e.target.value)}
                                      className="h-8 w-full rounded border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-300 [color-scheme:dark]"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[10px] text-zinc-500">Sampai Jam</Label>
                                    <input
                                      type="time"
                                      value={item.displayEndTime || '17:00'}
                                      onChange={(e) => updateInformationItem(idx, 'displayEndTime', e.target.value)}
                                      className="h-8 w-full rounded border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-300 [color-scheme:dark]"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="ghost"
                  onClick={addInformationItem}
                  className="w-full border border-dashed border-zinc-700 text-xs text-zinc-500 hover:border-amber-500/50 hover:text-amber-400"
                >
                  <Plus className="h-3 w-3" />
                  Tambah Informasi
                </Button>

                {/* Preview Button */}
                <Separator className="bg-zinc-800" />
                <SectionLabel>Preview Tampilan</SectionLabel>
                <Button
                  variant="outline"
                  onClick={openPreviewInfo}
                  className="w-full border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Informasi & Pengajian
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* ─── Section G: Tema & Tampilan ──────────────────────── */}
            <AccordionItem value="theme" className="rounded-xl border border-zinc-800 bg-zinc-900 px-4">
              <AccordionTrigger className="py-4 text-sm font-medium text-zinc-200 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-amber-400" />
                  Tema & Tampilan
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                {/* Theme Selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Pilih Tema</Label>
                  {/* Dark themes section */}
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Gelap (Dark)</p>
                  <div className="grid grid-cols-1 gap-2">
                    {THEME_OPTIONS.filter((t) => !t.isLight && !('layout' in t)).map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => updateForm({ theme: t.value })}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                          c.theme === t.value
                            ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30'
                            : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex gap-1">
                          <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: t.accent }} />
                          <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: t.accentLight, opacity: 0.5 }} />
                        </div>
                        <span className={`text-sm font-medium ${c.theme === t.value ? 'text-amber-400' : 'text-zinc-300'}`}>
                          {t.label}
                        </span>
                        {c.theme === t.value && <ChevronRight className="ml-auto h-4 w-4 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                  {/* Light themes section */}
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Terang (Light)</p>
                  <div className="grid grid-cols-1 gap-2">
                    {THEME_OPTIONS.filter((t) => t.isLight && !('layout' in t)).map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => updateForm({ theme: t.value })}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                          c.theme === t.value
                            ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30'
                            : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                        }`}
                      >
                        <div className="relative flex gap-1 overflow-hidden rounded-lg">
                          <div className="h-8 w-8 rounded-l-lg border border-zinc-600/50" style={{ backgroundColor: t.bg || '#FAFAFA' }} />
                          <div className="h-8 w-4 rounded-r-lg border border-zinc-600/50" style={{ backgroundColor: t.accent }} />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${c.theme === t.value ? 'text-amber-400' : 'text-zinc-300'}`}>
                            {t.label}
                          </span>
                          <span className="text-[9px] text-zinc-500">Tema Terang</span>
                        </div>
                        {c.theme === t.value && <ChevronRight className="ml-auto h-4 w-4 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                  {/* Layout Variant themes section */}
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Tampilan Berbeda (Layout Variant)</p>
                  <InfoBanner>
                    Tema ini memiliki posisi tata letak yang berbeda, bukan hanya warna. Coba untuk pengalaman tampilan yang baru!
                  </InfoBanner>
                  <div className="grid grid-cols-1 gap-2">
                    {THEME_OPTIONS.filter((t) => 'layout' in t).map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => updateForm({ theme: t.value as MasjidConfig['theme'] })}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                          c.theme === t.value
                            ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30'
                            : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                        }`}
                      >
                        {/* Mini layout preview */}
                        <div className="relative flex h-10 w-10 shrink-0 flex-col gap-0.5 overflow-hidden rounded-lg border border-zinc-600/50" style={{ backgroundColor: t.bg || '#111' }}>
                          {/* Mini layout visualization */}
                          {t.layout === 'nabawi' ? (
                            <>
                              <div className="flex flex-1 gap-px">
                                <div className="flex-1 flex items-center justify-center">
                                  <div className="h-1 w-2 rounded-sm" style={{ backgroundColor: t.accent, opacity: 0.6 }} />
                                </div>
                                <div className="w-2.5 border-l border-zinc-600/30" style={{ backgroundColor: t.accent, opacity: 0.15 }} />
                              </div>
                              <div className="h-0.5" style={{ backgroundColor: t.accent, opacity: 0.3 }} />
                            </>
                          ) : t.layout === 'makkah' ? (
                            <>
                              <div className="flex gap-px px-0.5 py-0.5" style={{ backgroundColor: t.accent, opacity: 0.15 }}>
                                {[1,2,3,4,5].map(i => (
                                  <div key={i} className="flex-1 rounded-sm" style={{ backgroundColor: t.accent, opacity: 0.3 }} />
                                ))}
                              </div>
                              <div className="flex-1 flex items-center justify-center">
                                <div className="h-1 w-2 rounded-sm" style={{ backgroundColor: t.accent, opacity: 0.6 }} />
                              </div>
                              <div className="h-0.5" style={{ backgroundColor: t.accent, opacity: 0.3 }} />
                            </>
                          ) : (
                            <>
                              <div className="flex flex-1 gap-px">
                                <div className="flex-1 flex items-center justify-center">
                                  <div className="h-1 w-1.5 rounded-sm" style={{ backgroundColor: t.accent, opacity: 0.6 }} />
                                </div>
                                <div className="w-px" style={{ backgroundColor: t.accent, opacity: 0.2 }} />
                                <div className="flex-1 flex flex-col gap-px p-0.5">
                                  {[1,2,3,4].map(i => (
                                    <div key={i} className="h-0.5 w-full rounded-sm" style={{ backgroundColor: t.accent, opacity: 0.2 }} />
                                  ))}
                                </div>
                              </div>
                              <div className="h-0.5" style={{ backgroundColor: t.accent, opacity: 0.3 }} />
                            </>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`text-sm font-medium ${c.theme === t.value ? 'text-amber-400' : 'text-zinc-300'}`}>
                            {t.label}
                          </span>
                          <span className="text-[9px] text-zinc-500 truncate">
                            {t.description}
                          </span>
                        </div>
                        {c.theme === t.value && <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Server Themes (from Theme Designer) */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Tema dari Server</p>
                      <Sparkles className="h-3 w-3 text-purple-400" />
                    </div>
                    <button
                      onClick={fetchServerThemes}
                      disabled={loadingThemes}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {loadingThemes ? 'Memuat...' : 'Refresh'}
                    </button>
                  </div>
                  <InfoBanner>
                    Tema buatan superadmin yang tersimpan di server. Klik untuk menerapkan ke perangkat ini.
                  </InfoBanner>
                  {serverThemes.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-800 py-4 text-center">
                      <p className="text-xs text-zinc-600">Belum ada tema yang tersedia</p>
                      <Link href="/superadmin/themes" className="text-[10px] text-purple-400 hover:text-purple-300">
                        Buat tema di Theme Designer →
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {serverThemes.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => applyServerTheme(t.id)}
                          className="flex items-center gap-3 rounded-lg border p-3 text-left transition-all border-zinc-700 bg-zinc-800/50 hover:border-purple-500/40 hover:bg-purple-500/5"
                        >
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-zinc-600/50" style={{ background: t.bgType === 'solid' ? t.bgSolidColor : (t.bgGradient || '#111') }}>
                            <div className="absolute bottom-0 left-0 right-0 h-2" style={{ backgroundColor: t.accentGold, opacity: 0.6 }} />
                            <div className="absolute top-1 left-1 h-1 w-1 rounded-full" style={{ backgroundColor: t.accentGold }} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-zinc-300 truncate">{t.name}</span>
                            <div className="flex items-center gap-1.5">
                              <Badge className="border-zinc-700 bg-zinc-800 text-[9px] text-zinc-400 px-1.5 py-0">
                                {t.category}
                              </Badge>
                              {t.layout && t.layout !== 'default' && (
                                <Badge className="border-purple-500/30 bg-purple-500/10 text-[9px] text-purple-400 px-1.5 py-0">
                                  {t.layout}
                                </Badge>
                              )}
                              {t.isLight && (
                                <Badge className="border-amber-500/30 bg-amber-500/10 text-[9px] text-amber-400 px-1.5 py-0">
                                  light
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-zinc-600" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Theme */}
                <div className="mt-2 space-y-3 rounded-lg border border-zinc-700 bg-zinc-800/30 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div
                          className="h-4 w-4 rounded border border-zinc-600"
                          style={{ backgroundColor: c.customThemeAccent }}
                        />
                        <div
                          className="h-4 w-4 rounded border border-zinc-600"
                          style={{ backgroundColor: c.customThemeAccentLight, opacity: 0.5 }}
                        />
                      </div>
                      <span className="text-xs font-medium text-zinc-300">Tema Custom</span>
                    </div>
                    <Button
                      size="sm"
                      variant={c.theme === 'custom' ? 'default' : 'outline'}
                      onClick={() => updateForm({ theme: 'custom' })}
                      className={c.theme === 'custom' ? 'bg-amber-500 text-black hover:bg-amber-600 h-7 text-xs' : 'h-7 text-xs border-zinc-700 text-zinc-400'}
                    >
                      {c.theme === 'custom' ? 'Aktif' : 'Gunakan'}
                    </Button>
                  </div>

                  {c.theme === 'custom' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-400">Warna Aksen Utama</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={c.customThemeAccent}
                            onChange={(e) => updateForm({ customThemeAccent: e.target.value })}
                            className="h-8 w-12 cursor-pointer rounded border border-zinc-700 bg-transparent"
                          />
                          <Input
                            value={c.customThemeAccent}
                            onChange={(e) => updateForm({ customThemeAccent: e.target.value })}
                            className="flex-1 bg-zinc-800 border-zinc-700 text-xs text-zinc-200 font-mono"
                            maxLength={7}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-400">Warna Aksen Terang</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={c.customThemeAccentLight}
                            onChange={(e) => updateForm({ customThemeAccentLight: e.target.value })}
                            className="h-8 w-12 cursor-pointer rounded border border-zinc-700 bg-transparent"
                          />
                          <Input
                            value={c.customThemeAccentLight}
                            onChange={(e) => updateForm({ customThemeAccentLight: e.target.value })}
                            className="flex-1 bg-zinc-800 border-zinc-700 text-xs text-zinc-200 font-mono"
                            maxLength={7}
                          />
                        </div>
                      </div>

                      {/* Background Image */}
                      <Separator className="bg-zinc-700/50" />
                      <div className="space-y-2">
                        <Label className="text-xs text-zinc-400">Gambar Latar Belakang</Label>
                        {c.customBackgroundImage ? (
                          <div className="relative rounded-lg overflow-hidden border border-zinc-700">
                            <img
                              src={c.customBackgroundImage}
                              alt="Background"
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <button
                              onClick={() => updateForm({ customBackgroundImage: '', customBackgroundOpacity: 30 })}
                              className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/70 hover:bg-red-500/80 hover:text-white transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-700 py-4 text-zinc-500 transition-colors hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-400">
                            <ImageUp className="h-5 w-5" />
                            <span className="text-[10px] font-medium">Upload Gambar</span>
                            <span className="text-[9px] text-zinc-600">JPG, PNG, WebP (maks 2MB)</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                if (file.size > 2 * 1024 * 1024) {
                                  toast.error('Ukuran file maksimal 2MB')
                                  return
                                }
                                try {
                                  const formData = new FormData()
                                  formData.append('file', file)
                                  formData.append('folder', 'mosque-images')
                                  const res = await fetch('/api/upload', {
                                    method: 'POST',
                                    body: formData,
                                  })
                                  if (!res.ok) throw new Error('Upload gagal')
                                  const data = await res.json()
                                  updateForm({ customBackgroundImage: data.url })
                                  toast.success('Gambar berhasil diupload')
                                } catch {
                                  // Convert to base64 as fallback
                                  const reader = new FileReader()
                                  reader.onload = () => {
                                    updateForm({ customBackgroundImage: reader.result as string })
                                    toast.success('Gambar berhasil diupload')
                                  }
                                  reader.readAsDataURL(file)
                                }
                                e.target.value = ''
                              }}
                            />
                          </label>
                        )}
                      </div>

                      {/* Background Opacity */}
                      {c.customBackgroundImage && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-zinc-400">Opacity Gambar</Label>
                            <span className="text-xs font-mono text-zinc-500">{c.customBackgroundOpacity || 30}%</span>
                          </div>
                          <Slider
                            value={[c.customBackgroundOpacity || 30]}
                            onValueChange={([v]) => updateForm({ customBackgroundOpacity: v })}
                            min={5}
                            max={100}
                            step={5}
                            className="py-1"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Separator className="bg-zinc-800" />

                {/* Display Toggles */}
                <div className="space-y-3">
                  <SectionLabel>Opsi Tampilan</SectionLabel>
                  <ToggleSwitch
                    label="Tanggal Hijriyah"
                    checked={c.showHijri}
                    onChange={(v) => updateForm({ showHijri: v })}
                    description="Tampilkan tanggal Hijriyah di bawah tanggal Masehi"
                  />
                  <ToggleSwitch
                    label="Hitung Mundur Sholat"
                    checked={c.showCountdown}
                    onChange={(v) => updateForm({ showCountdown: v })}
                    description="Tampilkan sisa waktu menuju sholat berikutnya"
                  />
                  <ToggleSwitch
                    label="Suara Alarm"
                    checked={c.soundEnabled}
                    onChange={(v) => updateForm({ soundEnabled: v })}
                    description="Aktifkan suara notifikasi saat waktu sholat"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>

      {/* ─── Sticky Save Button ─────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur-sm">
        <div className="mx-auto max-w-lg">
          <Button
            onClick={handleSave}
            disabled={saving || isLoading}
            className="h-11 w-full bg-gradient-to-r from-amber-600 to-amber-500 text-sm font-semibold text-black hover:from-amber-500 hover:to-amber-400 disabled:opacity-50"
          >
            {saving || isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {hasUnsavedChanges ? 'Simpan Pengaturan' : 'Pengaturan Tersimpan'}
              </>
            )}
          </Button>
          {hasUnsavedChanges && (
            <p className="mt-1.5 text-center text-[10px] text-zinc-500">
              Anda memiliki perubahan yang belum disimpan
            </p>
          )}
        </div>
      </div>

      {/* ─── Preview Overlay ────────────────────────────────────── */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black">
          {/* Close button bar */}
          <div className="absolute top-0 left-0 right-0 z-[110] flex items-center justify-between px-4 py-2 bg-black/60 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-white/70">Preview Mode</span>
              {previewMode !== 'none' && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                  {previewMode === 'adhan' ? 'Adhan' : previewMode === 'iqomah' ? 'Iqomah' : previewMode === 'post-iqomah' ? 'Shalat' : 'Informasi'}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closePreview}
              className="h-8 gap-1.5 text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
              <span className="text-xs">Kembali ke Settings</span>
            </Button>
          </div>
          {/* Mosque Display */}
          <div className="flex-1">
            <MosqueDisplay />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main SettingsPanel Component ────────────────────────────────────
export default function SettingsPanel() {
  const isAuthenticated = useMasjidStore((s) => s.isAuthenticated)
  const { checkSavedAuth } = useDevice()

  useEffect(() => {
    checkSavedAuth()
  }, [checkSavedAuth])

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <SettingsDashboard />
}
