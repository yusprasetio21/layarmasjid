'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMasjidStore } from '@/store/masjid-store'
import { useDevice } from '@/components/masjid/hooks/useDevice'
import type { PrayerTime, MasjidConfig } from '@/types/masjid'

// shadcn/ui
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  { value: 'haramain' as const, label: 'Haramain', accent: '#C9A84C', accentLight: '#E8D48B' },
  { value: 'ottoman' as const, label: 'Ottoman', accent: '#08D9D6', accentLight: '#4EEAEA' },
  { value: 'madinah' as const, label: 'Madinah Night', accent: '#A8C0D6', accentLight: '#D0E0F0' },
  { value: 'nusantara' as const, label: 'Nusantara', accent: '#8DC06A', accentLight: '#B8DD9E' },
  { value: 'ramadhan' as const, label: 'Ramadhan Special', accent: '#F5D78A', accentLight: '#FFF5DB' },
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

const DEFAULT_PRAYER_TIMES: PrayerTime[] = [
  { id: 'subuh', latin: 'Subuh', arabic: 'الفَجْر', time: '04:32', isMain: true },
  { id: 'dzuhur', latin: 'Dzuhur', arabic: 'الظُّهْر', time: '11:58', isMain: true },
  { id: 'ashar', latin: 'Ashar', arabic: 'العَصْر', time: '15:15', isMain: true },
  { id: 'maghrib', latin: 'Maghrib', arabic: 'المَغْرِب', time: '17:58', isMain: true },
  { id: 'isya', latin: 'Isya', arabic: 'العِشَاء', time: '19:08', isMain: true },
  { id: 'dhuha', latin: 'Dhuha', arabic: 'الضُّحَى', time: '07:00', isMain: false },
  { id: 'tahajjud', latin: 'Tahajud', arabic: 'تَهَجُّد', time: '03:30', isMain: false },
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
  const config = useMasjidStore((s) => s.config)
  const setConfig = useMasjidStore((s) => s.setConfig)
  const isLoading = useMasjidStore((s) => s.isLoading)
  const deviceId = useMasjidStore((s) => s.deviceId)
  const lastSynced = useMasjidStore((s) => s.lastSynced)
  const { saveConfig, logout } = useDevice()
  const [saving, setSaving] = useState(false)

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await saveConfig()
      toast.success('Pengaturan berhasil disimpan!', {
        description: 'Tampilan akan diperbarui secara otomatis.',
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan'
      toast.error('Gagal menyimpan', { description: msg })
    } finally {
      setSaving(false)
    }
  }, [saveConfig])

  const handleLogout = useCallback(() => {
    logout()
    toast.info('Anda telah keluar')
  }, [logout])

  // ─── Prayer times helpers ────────────────────────────────────────
  const updatePrayerTime = useCallback(
    (index: number, field: keyof PrayerTime, value: string | boolean) => {
      const updated = [...config.prayerTimesTemplate]
      if (field === 'isMain') {
        updated[index] = { ...updated[index], [field]: value as boolean }
      } else {
        updated[index] = { ...updated[index], [field]: value as string }
      }
      setConfig({ prayerTimesTemplate: updated })
    },
    [config.prayerTimesTemplate, setConfig]
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
    setConfig({ prayerTimesTemplate: [...config.prayerTimesTemplate, newPrayer] })
  }, [config.prayerTimesTemplate, setConfig])

  const removePrayerTime = useCallback(
    (index: number) => {
      const updated = config.prayerTimesTemplate.filter((_, i) => i !== index)
      setConfig({ prayerTimesTemplate: updated })
    },
    [config.prayerTimesTemplate, setConfig]
  )

  // ─── Iqomah quick buttons ────────────────────────────────────────
  const IQOMAH_QUICK = [
    { label: "1'", value: 1 },
    { label: "3'", value: 3 },
    { label: "5'", value: 5 },
    { label: "10'", value: 10 },
    { label: "15'", value: 15 },
  ]

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
          </div>
          <div className="flex items-center gap-2">
            {deviceId && (
              <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px]">
                ID: {deviceId}
              </Badge>
            )}
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
            defaultValue={['mosque', 'clock', 'prayer', 'adhan', 'running', 'theme']}
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
                    value={config.mosqueName}
                    onChange={(e) => setConfig({ mosqueName: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-sm text-zinc-200"
                    placeholder="Nama masjid"
                  />
                </div>

                {/* Mosque Name (Arabic) */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Nama Masjid (Arab)</Label>
                  <Input
                    value={config.mosqueNameArabic}
                    onChange={(e) => setConfig({ mosqueNameArabic: e.target.value })}
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
                    value={config.mosqueNameFontFamily}
                    onValueChange={(v) => setConfig({ mosqueNameFontFamily: v })}
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
                  value={config.mosqueNameFontSize}
                  onChange={(v) => setConfig({ mosqueNameFontSize: v })}
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
                    value={config.dateFontFamily}
                    onValueChange={(v) => setConfig({ dateFontFamily: v })}
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
                  value={config.dateFontSize}
                  onChange={(v) => setConfig({ dateFontSize: v })}
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  unit="rem"
                />

                {/* Date Opacity */}
                <SliderField
                  label="Transparansi Tanggal"
                  value={config.dateOpacity ?? 0.85}
                  onChange={(v) => setConfig({ dateOpacity: v })}
                  min={0.3}
                  max={1}
                  step={0.05}
                  unit=""
                />

                {/* Date Color */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Warna Tanggal</Label>
                  <div className="flex flex-wrap gap-2">
                    {DATE_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setConfig({ dateColor: c.value })}
                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all ${
                          config.dateColor === c.value
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600'
                        }`}
                      >
                        <div
                          className="h-3 w-3 rounded-full border border-zinc-600"
                          style={{ backgroundColor: c.value }}
                        />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
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
                    value={config.clockType}
                    onChange={(v) => setConfig({ clockType: v as 'digital' | 'analog' })}
                  />
                </div>

                {config.clockType === 'digital' ? (
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
                        value={config.clockStyle || 'default'}
                        onChange={(v) => setConfig({ clockStyle: v as 'default' | 'retro' | 'minimal' })}
                      />
                    </div>

                    {/* Digital Font */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-400">Font Jam Digital</Label>
                      <Select
                        value={config.digitalFontFamily}
                        onValueChange={(v) => setConfig({ digitalFontFamily: v })}
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
                      value={config.digitalFontSize}
                      onChange={(v) => setConfig({ digitalFontSize: v })}
                      min={2}
                      max={15}
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
                        value={config.analogNumberStyle}
                        onChange={(v) =>
                          setConfig({
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
                            onClick={() => setConfig({ analogSize: s.value })}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                              config.analogSize === s.value
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
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-zinc-400">Tampilkan Detik</Label>
                  <Switch
                    checked={config.showSeconds}
                    onCheckedChange={(v) => setConfig({ showSeconds: v })}
                  />
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
                    value={config.prayerSourceMode}
                    onChange={(v) =>
                      setConfig({ prayerSourceMode: v as 'auto' | 'manual' })
                    }
                  />
                </div>

                {/* Manual Prayer Times */}
                {config.prayerSourceMode === 'manual' && (
                  <div className="space-y-2">
                    <SectionLabel>Jadwal Sholat Manual</SectionLabel>
                    <div className="max-h-72 space-y-2 overflow-y-auto">
                      {config.prayerTimesTemplate.map((prayer, idx) => (
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

                <Separator className="bg-zinc-800" />

                {/* Card Color */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Warna Kartu Sholat</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {CARD_COLORS.map((c) => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() =>
                          setConfig({
                            cardBgColor: c.bg,
                            cardBorderColor: c.border,
                          })
                        }
                        className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] transition-all ${
                          config.cardBgColor === c.bg
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600'
                        }`}
                      >
                        <div
                          className="h-5 w-5 rounded-full border border-zinc-600"
                          style={{ backgroundColor: c.dot }}
                        />
                        {c.label}
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
                {/* Adhan Enable */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-zinc-400">Aktifkan Mode Adhan</Label>
                  <Switch
                    checked={config.adhanModeEnabled}
                    onCheckedChange={(v) => setConfig({ adhanModeEnabled: v })}
                  />
                </div>

                {/* Adhan Duration */}
                {config.adhanModeEnabled && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">Durasi Adhan</Label>
                    <ButtonGroup
                      options={[
                        { value: '120', label: '2 menit' },
                        { value: '180', label: '3 menit' },
                        { value: '300', label: '5 menit' },
                      ]}
                      value={String(config.adhanDuration)}
                      onChange={(v) => setConfig({ adhanDuration: Number(v) })}
                    />
                  </div>
                )}

                <Separator className="bg-zinc-800" />

                {/* Iqomah Enable */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-zinc-400">Aktifkan Mode Iqomah</Label>
                  <Switch
                    checked={config.iqomahModeEnabled}
                    onCheckedChange={(v) => setConfig({ iqomahModeEnabled: v })}
                  />
                </div>

                {config.iqomahModeEnabled && (
                  <>
                    {/* Iqomah Font */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-400">Font Iqomah</Label>
                      <Select
                        value={config.iqomahFontFamily}
                        onValueChange={(v) => setConfig({ iqomahFontFamily: v })}
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
                      value={config.iqomahFontSize}
                      onChange={(v) => setConfig({ iqomahFontSize: v })}
                      min={4}
                      max={20}
                      step={0.5}
                      unit="rem"
                    />

                    {/* Iqomah Beep */}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-zinc-400">Suara Beep Iqomah</Label>
                      <Switch
                        checked={config.iqomahBeepEnabled}
                        onCheckedChange={(v) => setConfig({ iqomahBeepEnabled: v })}
                      />
                    </div>

                    {/* Iqomah Minutes */}
                    <div className="space-y-2">
                      <SliderField
                        label="Menit Iqomah (setelah Adhan)"
                        value={config.iqomahMinutes}
                        onChange={(v) => setConfig({ iqomahMinutes: v })}
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
                            onClick={() => setConfig({ iqomahMinutes: q.value })}
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                              config.iqomahMinutes === q.value
                                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                                : 'border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600'
                            }`}
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Preview Buttons */}
                <Separator className="bg-zinc-800" />
                <SectionLabel>Preview Tampilan</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/?preview=adhan">
                    <Button
                      variant="outline"
                      className="w-full border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/10"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Adhan
                    </Button>
                  </Link>
                  <Link href="/?preview=iqomah">
                    <Button
                      variant="outline"
                      className="w-full border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Iqomah
                    </Button>
                  </Link>
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
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-zinc-400">Tampilkan Teks Berjalan</Label>
                  <Switch
                    checked={config.showAnnouncement}
                    onCheckedChange={(v) => setConfig({ showAnnouncement: v })}
                  />
                </div>

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
                          setConfig({
                            runningAnimation: a.value as MasjidConfig['runningAnimation'],
                          })
                        }
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${
                          config.runningAnimation === a.value
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
                  value={config.runningSpeed}
                  onChange={(v) => setConfig({ runningSpeed: v })}
                  min={5}
                  max={60}
                  step={1}
                  unit="s"
                />

                {/* Running Text Font */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Font Teks Berjalan</Label>
                  <Select
                    value={config.runningFontFamily}
                    onValueChange={(v) => setConfig({ runningFontFamily: v })}
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
                  value={config.runningFontSize}
                  onChange={(v) => setConfig({ runningFontSize: v })}
                  min={0.5}
                  max={3}
                  step={0.1}
                  unit="rem"
                />

                {/* Announcement Text */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Teks Pengumuman</Label>
                  <Textarea
                    value={config.announcement}
                    onChange={(e) => setConfig({ announcement: e.target.value })}
                    className="min-h-20 resize-none bg-zinc-800 border-zinc-700 text-sm text-zinc-200"
                    placeholder="Masukkan teks pengumuman..."
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ─── Section F: Tema & Tampilan ──────────────────────── */}
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
                  <div className="grid grid-cols-1 gap-2">
                    {THEME_OPTIONS.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setConfig({ theme: t.value })}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                          config.theme === t.value
                            ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30'
                            : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex gap-1">
                          <div
                            className="h-8 w-8 rounded-lg"
                            style={{ backgroundColor: t.accent }}
                          />
                          <div
                            className="h-8 w-8 rounded-lg"
                            style={{ backgroundColor: t.accentLight, opacity: 0.5 }}
                          />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            config.theme === t.value ? 'text-amber-400' : 'text-zinc-300'
                          }`}
                        >
                          {t.label}
                        </span>
                        {config.theme === t.value && (
                          <ChevronRight className="ml-auto h-4 w-4 text-amber-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Theme */}
                <div className="mt-2 space-y-3 rounded-lg border border-zinc-700 bg-zinc-800/30 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div
                          className="h-4 w-4 rounded border border-zinc-600"
                          style={{ backgroundColor: config.customThemeAccent }}
                        />
                        <div
                          className="h-4 w-4 rounded border border-zinc-600"
                          style={{ backgroundColor: config.customThemeAccentLight, opacity: 0.5 }}
                        />
                      </div>
                      <span className="text-xs font-medium text-zinc-300">Tema Custom</span>
                    </div>
                    <Button
                      size="sm"
                      variant={config.theme === 'custom' ? 'default' : 'outline'}
                      onClick={() => setConfig({ theme: 'custom' })}
                      className={config.theme === 'custom' ? 'bg-amber-500 text-black hover:bg-amber-600 h-7 text-xs' : 'h-7 text-xs border-zinc-700 text-zinc-400'}
                    >
                      {config.theme === 'custom' ? 'Aktif' : 'Gunakan'}
                    </Button>
                  </div>

                  {config.theme === 'custom' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-400">Warna Aksen Utama</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={config.customThemeAccent}
                            onChange={(e) => setConfig({ customThemeAccent: e.target.value })}
                            className="h-8 w-12 cursor-pointer rounded border border-zinc-700 bg-transparent"
                          />
                          <Input
                            value={config.customThemeAccent}
                            onChange={(e) => setConfig({ customThemeAccent: e.target.value })}
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
                            value={config.customThemeAccentLight}
                            onChange={(e) => setConfig({ customThemeAccentLight: e.target.value })}
                            className="h-8 w-12 cursor-pointer rounded border border-zinc-700 bg-transparent"
                          />
                          <Input
                            value={config.customThemeAccentLight}
                            onChange={(e) => setConfig({ customThemeAccentLight: e.target.value })}
                            className="flex-1 bg-zinc-800 border-zinc-700 text-xs text-zinc-200 font-mono"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="bg-zinc-800" />

                {/* Display Toggles */}
                <div className="space-y-3">
                  <SectionLabel>Opsi Tampilan</SectionLabel>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-zinc-400">Tanggal Hijriyah</Label>
                    <Switch
                      checked={config.showHijri}
                      onCheckedChange={(v) => setConfig({ showHijri: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-zinc-400">Hitung Mundur Sholat</Label>
                    <Switch
                      checked={config.showCountdown}
                      onCheckedChange={(v) => setConfig({ showCountdown: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-zinc-400">Suara Alarm</Label>
                    <Switch
                      checked={config.soundEnabled}
                      onCheckedChange={(v) => setConfig({ soundEnabled: v })}
                    />
                  </div>
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
                Simpan Pengaturan
              </>
            )}
          </Button>
        </div>
      </div>
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
