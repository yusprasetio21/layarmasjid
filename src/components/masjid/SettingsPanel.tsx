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
  Moon,
  Sun,
  ChevronDown,
} from 'lucide-react'

// ─── iOS 18 Styles & Animations (Enhanced for Mobile) ──────────────────
const ios18Styles = `
  /* Base smoothness */
  * {
    -webkit-tap-highlight-color: transparent;
  }
  
  @keyframes ios-card-enter {
    0% {
      opacity: 0;
      transform: translateY(30px) scale(0.96);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes ios-card-hover {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(1.01);
    }
  }
  
  @keyframes ios-spring-pop {
    0% {
      transform: scale(0.92);
      opacity: 0;
    }
    50% {
      transform: scale(1.02);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes ios-pulse-glow {
    0%, 100% {
      opacity: 0.4;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.02);
    }
  }
  
  @keyframes ios-fade-in-up {
    from {
      opacity: 0;
      transform: translateY(15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes ios-ripple {
    0% {
      transform: scale(0);
      opacity: 0.5;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  /* Card animations */
  .ios-card {
    animation: ios-card-enter 0.45s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
    transition: all 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    -webkit-backdrop-filter: blur(25px);
    backdrop-filter: blur(25px);
    will-change: transform;
  }
  
  .ios-card:active {
    transform: scale(0.985);
    transition: transform 0.08s ease;
  }
  
  /* iOS 18 Glassmorphism */
  .glass-strong {
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
  
  .glass-strong-dark {
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  
  .glass-light {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.4);
  }
  
  .glass-light-dark {
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  /* Smooth scrolling */
  .ios-smooth-scroll {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  
  /* Haptic feedback simulation */
  .ios-haptic {
    transition: all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    cursor: pointer;
  }
  
  .ios-haptic:active {
    transform: scale(0.97);
    transition: transform 0.05s ease;
  }
  
  /* Ripple effect */
  .ripple-container {
    position: relative;
    overflow: hidden;
  }
  
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ios-ripple 0.5s ease-out;
    pointer-events: none;
  }
  
  /* Custom scrollbar - thinner for iOS */
  ::-webkit-scrollbar {
    width: 3px;
    height: 3px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.25);
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
  
  /* Mobile optimized inputs */
  input, textarea, select, button {
    font-size: 16px !important;
  }
  
  @media (max-width: 640px) {
    input, textarea, select {
      font-size: 16px !important;
    }
  }
  
  /* Smooth transitions */
  .transition-ios {
    transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  }
  
  /* Sticky header blur */
  .sticky-header {
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
  }
`

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = ios18Styles
  document.head.appendChild(styleSheet)
}

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
  { bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.2)', label: 'Emas', dot: '#C9A84C' },
  { bg: 'rgba(100,149,237,0.1)', border: 'rgba(100,149,237,0.2)', label: 'Biru', dot: '#6495ED' },
  { bg: 'rgba(76,175,80,0.1)', border: 'rgba(76,175,80,0.2)', label: 'Hijau', dot: '#4CAF50' },
  { bg: 'rgba(156,100,210,0.1)', border: 'rgba(156,100,210,0.2)', label: 'Ungu', dot: '#9C64D2' },
]

const THEME_OPTIONS = [
  { value: 'haramain' as const, label: 'Haramain', accent: '#C9A84C', accentLight: '#E8D48B', isLight: false },
  { value: 'ottoman' as const, label: 'Ottoman', accent: '#08D9D6', accentLight: '#4EEAEA', isLight: false },
  { value: 'madinah' as const, label: 'Madinah Night', accent: '#A8C0D6', accentLight: '#D0E0F0', isLight: false },
  { value: 'nusantara' as const, label: 'Nusantara', accent: '#8DC06A', accentLight: '#B8DD9E', isLight: false },
  { value: 'ramadhan' as const, label: 'Ramadhan Special', accent: '#F5D78A', accentLight: '#FFF5DB', isLight: false },
  { value: 'istanbul-pearl' as const, label: 'Istanbul Pearl', accent: '#8B6914', accentLight: '#C9A84C', isLight: true, bg: '#FFFDF7' },
  { value: 'safavid-marble' as const, label: 'Safavid Marble', accent: '#0D7377', accentLight: '#14B8A6', isLight: true, bg: '#FAFCFE' },
  { value: 'andalusian-garden' as const, label: 'Andalusian Garden', accent: '#065F46', accentLight: '#059669', isLight: true, bg: '#FEFDFB' },
  { value: 'ottoman-rose' as const, label: 'Ottoman Rose', accent: '#9F1239', accentLight: '#E11D48', isLight: true, bg: '#FFF8FA' },
  { value: 'al-aqsa-gold' as const, label: 'Al-Aqsa Gold', accent: '#92400E', accentLight: '#B45309', isLight: true, bg: '#FFFBF3' },
  { value: 'nabawi' as const, label: 'Nabawi', accent: '#C9A84C', accentLight: '#E8D48B', isLight: false, bg: '#0d3a28', layout: 'nabawi', description: 'Sidebar kanan untuk jadwal shalat' },
  { value: 'makkah' as const, label: 'Makkah', accent: '#E8C547', accentLight: '#FFF2A8', isLight: false, bg: '#0d0a05', layout: 'makkah', description: 'Jadwal shalat di bar atas' },
  { value: 'cordoba' as const, label: 'Cordoba', accent: '#8B4513', accentLight: '#CD853F', isLight: true, bg: '#F5ECD7', layout: 'cordoba', description: 'Tampilan terpisah kiri-kanan' },
]

const ANALOG_SIZE_OPTIONS = [
  { value: 140, label: 'XS' },
  { value: 180, label: 'SM' },
  { value: 220, label: 'MD' },
  { value: 280, label: 'LG' },
  { value: 340, label: 'XL' },
  { value: 420, label: 'XXL' },
  { value: 500, label: '3XL' },
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
  isDarkMode = true,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  isDarkMode?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`ios-haptic rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
            value === opt.value
              ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
              : isDarkMode
                ? 'border-zinc-700/50 bg-zinc-800/40 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/60'
                : 'border-gray-300 bg-white/60 text-gray-600 hover:border-gray-300 hover:text-gray-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Helper: Add Hadith / Ayat Form ───────────────────────────────────
function AddHadithForm({ onAdd, isDarkMode = true }: { onAdd: (item: { id: string; type: 'hadith' | 'ayat'; arabic: string; meaning: string; source: string; active: boolean }) => void; isDarkMode?: boolean }) {
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
        className={`ios-haptic flex w-full items-center justify-center gap-2.5 rounded-xl border border-dashed py-3.5 text-sm font-medium transition-colors ${
          isDarkMode
            ? 'border-zinc-700/50 text-zinc-400 hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-400'
            : 'border-gray-300 text-gray-500 hover:border-amber-500/40 hover:bg-amber-50 hover:text-amber-600'
        }`}
      >
        <Plus className="h-4 w-4" />
        Tambah Hadits / Ayat
      </button>
    )
  }

  return (
    <div className={`rounded-xl border p-4 space-y-4 ${isDarkMode ? 'border-zinc-700/50 bg-zinc-900/80 glass-strong-dark' : 'border-gray-300 bg-white/80 glass-light'}`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>
          Tambah {type === 'ayat' ? 'Ayat Al-Quran' : 'Hadits'}
        </span>
        <button
          onClick={() => setIsAdding(false)}
          className={`ios-haptic flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
            isDarkMode ? 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Tipe:</span>
        <div className={`flex rounded-xl border overflow-hidden ${isDarkMode ? 'border-zinc-700' : 'border-gray-300'}`}>
          <button
            onClick={() => setType('hadith')}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              type === 'hadith'
                ? 'bg-amber-500/20 text-amber-400'
                : isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Hadits
          </button>
          <button
            onClick={() => setType('ayat')}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              type === 'ayat'
                ? 'bg-emerald-500/20 text-emerald-400'
                : isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Ayat
          </button>
        </div>
      </div>

      <div>
        <label className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'} mb-2 block`}>Teks Arab</label>
        <textarea
          value={arabic}
          onChange={(e) => setArabic(e.target.value)}
          dir="rtl"
          placeholder="اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ"
          className={`w-full rounded-xl border px-4 py-3 text-base placeholder:text-sm focus:outline-none focus:ring-2 font-amiri text-right leading-relaxed resize-none ${
            isDarkMode
              ? 'border-zinc-700 bg-zinc-800/60 text-zinc-200 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/25'
              : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-amber-500/50 focus:ring-amber-500/25'
          }`}
          rows={2}
        />
      </div>

      <div>
        <label className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'} mb-2 block`}>Arti / Terjemahan</label>
        <textarea
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder="Segala puji bagi Allah, Tuhan seluruh alam."
          className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none ${
            isDarkMode
              ? 'border-zinc-700 bg-zinc-800/60 text-zinc-200 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/25'
              : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-amber-500/50 focus:ring-amber-500/25'
          }`}
          rows={2}
        />
      </div>

      <div>
        <label className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'} mb-2 block`}>Sumber</label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="HR. Bukhari / QS. Al-Fatihah: 1"
          className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
            isDarkMode
              ? 'border-zinc-700 bg-zinc-800/60 text-zinc-200 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/25'
              : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-amber-500/50 focus:ring-amber-500/25'
          }`}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setIsAdding(false)}
          className={`ios-haptic flex-1 rounded-xl border py-3 text-sm font-medium transition-colors ${
            isDarkMode
              ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          className="ios-haptic flex-1 rounded-xl bg-amber-500/20 py-3 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/30"
        >
          <Plus className="mr-1.5 inline h-4 w-4" />
          Tambah
        </button>
      </div>
    </div>
  )
}

// ─── Helper: Section Label ───────────────────────────────────────────
function SectionLabel({ children, isDarkMode = true }: { children: React.ReactNode; isDarkMode?: boolean }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <div className={`h-px flex-1 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'}`} />
      <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
        {children}
      </span>
      <div className={`h-px flex-1 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'}`} />
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
  isDarkMode = true,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  unit?: string
  isDarkMode?: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className={`text-sm ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>{label}</Label>
        <span className="text-sm font-mono text-amber-400">
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
  isDarkMode = true,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  description?: string
  isDarkMode?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>{label}</div>
        {description && (
          <div className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>{description}</div>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`ios-haptic relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
            isDarkMode ? 'focus-visible:ring-offset-zinc-900' : 'focus-visible:ring-offset-white'
          } ${
            checked
              ? 'bg-emerald-500'
              : isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span
          className={`text-xs font-bold w-7 text-right select-none ${
            checked ? 'text-emerald-400' : isDarkMode ? 'text-zinc-600' : 'text-gray-400'
          }`}
        >
          {checked ? 'ON' : 'OFF'}
        </span>
      </div>
    </div>
  )
}

// ─── Helper: Info Banner ─────────────────────────────────────────────
function InfoBanner({ children, isDarkMode = true }: { children: React.ReactNode; isDarkMode?: boolean }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <span className={`text-xs leading-relaxed ${isDarkMode ? 'text-amber-400/80' : 'text-amber-700'}`}>{children}</span>
    </div>
  )
}

// ─── Login Screen ────────────────────────────────────────────────────
function LoginScreen({ isDarkMode, onToggleDarkMode }: { isDarkMode: boolean; onToggleDarkMode: () => void }) {
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
    <div className={`flex min-h-screen items-center justify-center px-5 transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      <button
        onClick={onToggleDarkMode}
        className={`ios-haptic fixed top-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-xl ${isDarkMode ? 'bg-zinc-800 text-yellow-500' : 'bg-white text-gray-700'}`}
      >
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <Card className={`w-full max-w-md transition-colors duration-300 ${isDarkMode ? 'border-zinc-800 bg-zinc-900/90 glass-strong-dark' : 'border-gray-300 bg-white/90 glass-light'}`}>
        <CardHeader className="items-center text-center pt-8">
          <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-2xl ${isDarkMode ? 'bg-amber-500/15' : 'bg-amber-100'}`}>
            <Sparkles className={`h-10 w-10 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
          </div>
          <CardTitle className={`text-2xl ${isDarkMode ? 'text-zinc-100' : 'text-gray-900'}`}>
            MasjidScreen
          </CardTitle>
          <CardDescription className={`text-sm ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
            Kelola tampilan jam masjid Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <div className="space-y-3">
            <Label className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>Device ID (4 digit)</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={otp}
                onChange={setOtp}
                containerClassName="gap-4"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className={`h-14 w-14 text-xl font-bold rounded-xl ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-amber-400' : 'bg-gray-100 border-gray-300 text-amber-600'}`} />
                  <InputOTPSlot index={1} className={`h-14 w-14 text-xl font-bold rounded-xl ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-amber-400' : 'bg-gray-100 border-gray-300 text-amber-600'}`} />
                  <InputOTPSlot index={2} className={`h-14 w-14 text-xl font-bold rounded-xl ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-amber-400' : 'bg-gray-100 border-gray-300 text-amber-600'}`} />
                  <InputOTPSlot index={3} className={`h-14 w-14 text-xl font-bold rounded-xl ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-amber-400' : 'bg-gray-100 border-gray-300 text-amber-600'}`} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="space-y-3">
            <Label className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className={`pr-12 py-3 text-base rounded-xl ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-600' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin()
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="ios-haptic w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold py-6 text-base rounded-xl hover:from-amber-400 hover:to-amber-500"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </Button>

          <Link href="/">
            <Button variant="ghost" className={`ios-haptic w-full gap-2 py-3 text-base ${isDarkMode ? 'text-zinc-400 hover:text-amber-400' : 'text-gray-600 hover:text-amber-600'}`}>
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
function SettingsDashboard({ isDarkMode, onToggleDarkMode }: { isDarkMode: boolean; onToggleDarkMode: () => void }) {
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

  const [formState, setFormState] = useState<MasjidConfig>(() => storeConfig)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [imageUploading, setImageUploading] = useState<Record<number, boolean>>({})
  const [serverThemes, setServerThemes] = useState<Array<{ id: string; name: string; category: string; layout: string; isLight: boolean; accentGold: string; accentLight: string; bgGradient: string; bgSolidColor: string; bgType: string; description: string }>>([])
  const [loadingThemes, setLoadingThemes] = useState(false)
  const formStateRef = useRef(formState)
  formStateRef.current = formState

  const updateForm = useCallback((partial: Partial<MasjidConfig>) => {
    setFormState((prev) => ({ ...prev, ...partial }))
  }, [])

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(storeConfig) !== JSON.stringify(formState)
  }, [storeConfig, formState])

  const handleSave = useCallback(async () => {
    if (!deviceId) return
    const currentForm = formStateRef.current
    setSaving(true)
    try {
      setStoreConfig(currentForm)
      const res = await fetch(`/api/screens/${deviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: currentForm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan config')
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

  const handleLogout = useCallback(() => {
    deviceLogout()
    toast.info('Anda telah keluar')
  }, [deviceLogout])

  const closePreview = useCallback(() => {
    setPreviewMode('none')
    setShowPreview(false)
  }, [setPreviewMode])

  const justOpenedPreview = useRef(false)

  const openPreview = useCallback(() => {
    setPreviewMode('none')
    justOpenedPreview.current = true
    setShowPreview(true)
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
    setFormState((prev) => {
      const updated = [...(prev.informationItems || [])]
      updated[index] = {
        ...updated[index],
        imageUrl: '',
        imageFileName: '',
      }
      return { ...prev, informationItems: updated }
    })

    if (fileName) {
      try {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName }),
        })
      } catch {
        // Silent fail
      }
    }

    toast.success('Gambar berhasil dihapus')
  }, [])

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
      // Silently fail
    } finally {
      setLoadingThemes(false)
    }
  }, [])

  useEffect(() => {
    fetchServerThemes()
  }, [fetchServerThemes])

  const applyServerTheme = useCallback(async (themeId: string) => {
    try {
      const res = await fetch(`/api/themes/${themeId}`)
      const data = await res.json()
      if (!res.ok || !data.theme) {
        toast.error('Gagal memuat tema')
        return
      }
      const t = data.theme
      const updates: Partial<MasjidConfig> = {
        theme: 'custom' as MasjidConfig['theme'],
        customThemeAccent: t.accentGold || '#C9A84C',
        customThemeAccentLight: t.accentLight || '#E8D48B',
      }
      if (t.bgType === 'image' && t.bgImageUrl) {
        updates.customBackgroundImage = t.bgImageUrl
        updates.customBackgroundOpacity = t.bgImageOpacity || 30
      } else {
        updates.customBackgroundImage = ''
      }
      if (t.clockType) updates.clockType = t.clockType
      if (t.clockFont) updates.digitalFontFamily = t.clockFont
      if (t.clockSize) updates.digitalFontSize = t.clockSize
      if (t.clockStyle) updates.clockStyle = t.clockStyle
      if (t.mosqueNameFont) updates.mosqueNameFontFamily = t.mosqueNameFont
      if (t.mosqueNameSize) updates.mosqueNameFontSize = t.mosqueNameSize
      if (t.dateFont) updates.dateFontFamily = t.dateFont
      if (t.dateSize) updates.dateFontSize = t.dateSize
      if (t.dateColor) updates.dateColor = t.dateColor
      if (t.cardBg) updates.cardBgColor = t.cardBg
      if (t.cardBorder) updates.cardBorderColor = t.cardBorder
      if (t.cardFontSize) updates.prayerCardFontSize = t.cardFontSize
      if (t.iqomahFont) updates.iqomahFontFamily = t.iqomahFont
      if (t.iqomahSize) updates.iqomahFontSize = t.iqomahSize

      updateForm(updates)
      toast.success(`Tema "${t.name}" diterapkan! Simpan untuk menyimpan perubahan.`)
    } catch {
      toast.error('Gagal memuat tema dari server')
    }
  }, [updateForm])

  const c = formState

  const bgClass = isDarkMode ? 'bg-zinc-950' : 'bg-gray-50'
  const headerBgClass = isDarkMode ? 'bg-zinc-950/90' : 'bg-white/90'
  const borderClass = isDarkMode ? 'border-zinc-800' : 'border-gray-300'
  const textClass = isDarkMode ? 'text-zinc-100' : 'text-gray-900'
  const textSecondaryClass = isDarkMode ? 'text-zinc-400' : 'text-gray-600'

  return (
    <div className={`flex min-h-screen flex-col transition-colors duration-300 ${bgClass}`}>
      {/* iOS Style Header */}
      <header className={`sticky top-0 z-40 border-b ${borderClass} ${headerBgClass} sticky-header`}>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
              <Settings className={`h-5 w-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <div>
              <h1 className={`text-lg font-semibold ${textClass}`}>
                MasjidScreen
              </h1>
              <p className={`text-xs ${textSecondaryClass}`}>Kelola Tampilan</p>
            </div>
            {hasUnsavedChanges && (
              <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-semibold text-amber-400 ml-2">
                Belum disimpan
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDarkMode}
              className={`ios-haptic flex h-10 w-10 items-center justify-center rounded-full transition-all ${isDarkMode ? 'bg-zinc-800 text-yellow-500' : 'bg-gray-100 text-gray-700'}`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {deviceId && (
              <Badge className={`${isDarkMode ? 'border-amber-500/30 bg-amber-500/15 text-amber-400' : 'border-amber-500/30 bg-amber-100 text-amber-700'} text-xs px-2.5 py-1 rounded-full`}>
                ID: {deviceId}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={openPreview}
              className={`ios-haptic h-10 gap-1.5 text-sm rounded-xl ${isDarkMode ? 'text-zinc-400 hover:text-emerald-400' : 'text-gray-500 hover:text-emerald-600'}`}
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className={`ios-haptic h-10 w-10 rounded-xl ${isDarkMode ? 'text-zinc-500 hover:text-red-400' : 'text-gray-500 hover:text-red-600'}`}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className={`flex items-center justify-between border-t ${borderClass} px-5 py-2`}>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className={`text-xs ${textSecondaryClass}`}>
              {lastSynced ? `Tersinkronisasi ${lastSynced}` : 'Tersinkronisasi'}
            </span>
          </div>
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className={`ios-haptic h-8 gap-1.5 text-xs rounded-lg ${isDarkMode ? 'text-zinc-400 hover:text-amber-400' : 'text-gray-500 hover:text-amber-600'}`}
            >
              <Monitor className="h-3.5 w-3.5" />
              Kembali ke Tampilan
            </Button>
          </Link>
        </div>
      </header>

      <ScrollArea className="flex-1 pb-28 ios-smooth-scroll">
        <div className="mx-auto max-w-2xl space-y-4 p-5">
          <Accordion
            type="multiple"
            defaultValue={[]}
            className="space-y-4"
          >
            {/* Section A: Nama Masjid & Tanggal */}
            <AccordionItem value="mosque" className={`rounded-2xl border ${borderClass} ${isDarkMode ? 'bg-zinc-900/80 glass-strong-dark' : 'bg-white/80 glass-light'} ios-card overflow-hidden`}>
              <AccordionTrigger className={`py-5 text-base font-semibold ${textClass} hover:no-underline px-5`}>
                <div className="flex items-center gap-3">
                  <CalendarDays className={`h-5 w-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  Nama Masjid & Tanggal
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-5 pb-5 px-5">
                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${textSecondaryClass}`}>Nama Masjid (Indonesia)</Label>
                  <Input
                    value={c.mosqueName}
                    onChange={(e) => updateForm({ mosqueName: e.target.value })}
                    className={`ios-haptic py-3 text-base rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'}`}
                    placeholder="Nama masjid"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${textSecondaryClass}`}>Nama Masjid (Arab)</Label>
                  <Input
                    value={c.mosqueNameArabic}
                    onChange={(e) => updateForm({ mosqueNameArabic: e.target.value })}
                    className={`ios-haptic py-3 text-base rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'}`}
                    dir="rtl"
                    style={{ fontFamily: "'Amiri', serif" }}
                    placeholder="مَسْجِد"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${textSecondaryClass}`}>Font Nama Masjid</Label>
                  <Select
                    value={c.mosqueNameFontFamily}
                    onValueChange={(v) => updateForm({ mosqueNameFontFamily: v })}
                  >
                    <SelectTrigger className={`w-full py-3 text-base rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-gray-300 bg-white'}>
                      {FONT_OPTIONS_MOSQUE.map((f) => (
                        <SelectItem key={f.value} value={f.value} className={isDarkMode ? 'text-zinc-300' : 'text-gray-700'}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <SliderField
                  label="Ukuran Nama Masjid"
                  value={c.mosqueNameFontSize}
                  onChange={(v) => updateForm({ mosqueNameFontSize: v })}
                  min={0.5}
                  max={5}
                  step={0.1}
                  unit="rem"
                  isDarkMode={isDarkMode}
                />

                <Separator className={isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} />

                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${textSecondaryClass}`}>Font Tanggal / Hari</Label>
                  <Select
                    value={c.dateFontFamily}
                    onValueChange={(v) => updateForm({ dateFontFamily: v })}
                  >
                    <SelectTrigger className={`w-full py-3 text-base rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-gray-300 bg-white'}>
                      {FONT_OPTIONS_DATE.map((f) => (
                        <SelectItem key={f.value} value={f.value} className={isDarkMode ? 'text-zinc-300' : 'text-gray-700'}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <SliderField
                  label="Ukuran Tanggal"
                  value={c.dateFontSize}
                  onChange={(v) => updateForm({ dateFontSize: v })}
                  min={0.5}
                  max={5.5}
                  step={0.1}
                  unit="rem"
                  isDarkMode={isDarkMode}
                />

                <SliderField
                  label="Transparansi Tanggal"
                  value={c.dateOpacity ?? 0.85}
                  onChange={(v) => updateForm({ dateOpacity: v })}
                  min={0.3}
                  max={1}
                  step={0.05}
                  unit=""
                  isDarkMode={isDarkMode}
                />

                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${textSecondaryClass}`}>Warna Tanggal</Label>
                  <div className="flex flex-wrap gap-2.5">
                    {DATE_COLORS.map((dc) => (
                      <button
                        key={dc.value}
                        type="button"
                        onClick={() => updateForm({ dateColor: dc.value })}
                        className={`ios-haptic flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition-all ${
                          c.dateColor === dc.value
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : isDarkMode ? 'border-zinc-700 bg-zinc-800/40 text-zinc-500 hover:border-zinc-600' : 'border-gray-300 bg-gray-100/60 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                        }`}
                      >
                        <div
                          className="h-4 w-4 rounded-full border border-zinc-600"
                          style={{ backgroundColor: dc.value }}
                        />
                        <span className={isDarkMode ? 'text-zinc-300' : 'text-gray-700'}>{dc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section: Pengaturan Waktu */}
            <AccordionItem value="timezone" className={`rounded-2xl border ${borderClass} ${isDarkMode ? 'bg-zinc-900/80 glass-strong-dark' : 'bg-white/80 glass-light'} ios-card overflow-hidden`}>
              <AccordionTrigger className={`py-5 text-base font-semibold ${textClass} hover:no-underline px-5`}>
                <div className="flex items-center gap-3">
                  <MapPin className={`h-5 w-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  Pengaturan Waktu
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-5 pb-5 px-5">
                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${textSecondaryClass}`}>Mode Waktu</Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => updateForm({ timezoneMode: 'auto' })}
                      className={`ios-haptic flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                        c.timezoneMode === 'auto'
                          ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                          : isDarkMode ? 'border-zinc-700 bg-zinc-800/40 text-zinc-300 hover:border-zinc-600' : 'border-gray-300 bg-gray-100/60 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <MapPin className="h-4 w-4" />
                      Otomatis (GPS)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateForm({ timezoneMode: 'manual' })}
                      className={`ios-haptic flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                        c.timezoneMode === 'manual'
                          ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                          : isDarkMode ? 'border-zinc-700 bg-zinc-800/40 text-zinc-300 hover:border-zinc-600' : 'border-gray-300 bg-gray-100/60 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      Manual
                    </button>
                  </div>
                </div>

                {c.timezoneMode === 'auto' && (
                  <div className={`rounded-xl border ${isDarkMode ? 'border-zinc-800 bg-zinc-800/40' : 'border-gray-300 bg-gray-100/60'} px-4 py-3.5`}>
                    <p className={`text-xs ${textSecondaryClass}`}>
                      Deteksi zona waktu perangkat:
                    </p>
                    <p className="mt-1 text-base font-semibold text-amber-400">
                      {typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'N/A'}
                    </p>
                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-zinc-600' : 'text-gray-500'}`}>
                      Waktu saat ini: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                )}

                {c.timezoneMode === 'manual' && (
                  <div className="space-y-4">
                    <p className={`text-xs ${textSecondaryClass}`}>
                      Atur koreksi waktu secara manual (tambah/kurangi jam, menit, detik dari waktu perangkat)
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className={`text-xs ${textSecondaryClass}`}>Jam</Label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateForm({ timeCorrectionHours: Math.min(c.timeCorrectionHours + 1, 12) })}
                            className={`ios-haptic flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isDarkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
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
                            className={`h-10 text-center text-base rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                          />
                          <button
                            type="button"
                            onClick={() => updateForm({ timeCorrectionHours: Math.max(c.timeCorrectionHours - 1, -12) })}
                            className={`ios-haptic flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isDarkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            −
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className={`text-xs ${textSecondaryClass}`}>Menit</Label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateForm({ timeCorrectionMinutes: Math.min(c.timeCorrectionMinutes + 1, 59) })}
                            className={`ios-haptic flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isDarkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
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
                            className={`h-10 text-center text-base rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                          />
                          <button
                            type="button"
                            onClick={() => updateForm({ timeCorrectionMinutes: Math.max(c.timeCorrectionMinutes - 1, -59) })}
                            className={`ios-haptic flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isDarkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            −
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className={`text-xs ${textSecondaryClass}`}>Detik</Label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateForm({ timeCorrectionSeconds: Math.min(c.timeCorrectionSeconds + 1, 59) })}
                            className={`ios-haptic flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isDarkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
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
                            className={`h-10 text-center text-base rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                          />
                          <button
                            type="button"
                            onClick={() => updateForm({ timeCorrectionSeconds: Math.max(c.timeCorrectionSeconds - 1, -59) })}
                            className={`ios-haptic flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isDarkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            −
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className={`rounded-xl border ${isDarkMode ? 'border-zinc-800 bg-zinc-800/40' : 'border-gray-300 bg-gray-100/60'} px-4 py-3.5`}>
                      <p className={`text-xs ${textSecondaryClass}`}>Preview waktu setelah koreksi:</p>
                      <p className="mt-1 text-lg font-mono font-bold text-amber-400">
                        {(() => {
                          const now = new Date()
                          const correctionSec = (c.timeCorrectionHours * 3600) + (c.timeCorrectionMinutes * 60) + c.timeCorrectionSeconds
                          const corrected = new Date(now.getTime() + correctionSec * 1000)
                          return corrected.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        })()}
                      </p>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-zinc-600' : 'text-gray-500'}`}>
                      Gunakan minus (−) jika waktu perangkat lebih cepat dari waktu sebenarnya
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Section B: Jam Utama */}
            <AccordionItem value="clock" className={`rounded-2xl border ${borderClass} ${isDarkMode ? 'bg-zinc-900/80 glass-strong-dark' : 'bg-white/80 glass-light'} ios-card overflow-hidden`}>
              <AccordionTrigger className={`py-5 text-base font-semibold ${textClass} hover:no-underline px-5`}>
                <div className="flex items-center gap-3">
                  <Clock className={`h-5 w-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  Jam Utama
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-5 pb-5 px-5">
                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${textSecondaryClass}`}>Tipe Jam</Label>
                  <ButtonGroup
                    options={[
                      { value: 'digital', label: 'Digital' },
                      { value: 'analog', label: 'Analog' },
                    ]}
                    value={c.clockType}
                    onChange={(v) => updateForm({ clockType: v as 'digital' | 'analog' })}
                    isDarkMode={isDarkMode}
                  />
                </div>

                {c.clockType === 'digital' ? (
                  <>
                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${textSecondaryClass}`}>Gaya Jam Digital</Label>
                      <ButtonGroup
                        options={[
                          { value: 'default', label: 'Default' },
                          { value: 'retro', label: 'Retro' },
                          { value: 'minimal', label: 'Minimal' },
                        ]}
                        value={c.clockStyle || 'default'}
                        onChange={(v) => updateForm({ clockStyle: v as 'default' | 'retro' | 'minimal' })}
                        isDarkMode={isDarkMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${textSecondaryClass}`}>Font Jam Digital</Label>
                      <Select
                        value={c.digitalFontFamily}
                        onValueChange={(v) => updateForm({ digitalFontFamily: v })}
                      >
                        <SelectTrigger className={`w-full py-3 text-base rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-gray-300 bg-white'}>
                          {FONT_OPTIONS_DIGITAL.map((f) => (
                            <SelectItem key={f.value} value={f.value} className={isDarkMode ? 'text-zinc-300' : 'text-gray-700'}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <SliderField
                      label="Ukuran Jam Digital"
                      value={c.digitalFontSize}
                      onChange={(v) => updateForm({ digitalFontSize: v })}
                      min={2}
                      max={40}
                      step={0.5}
                      unit="rem"
                      isDarkMode={isDarkMode}
                    />
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${textSecondaryClass}`}>Gaya Angka Analog</Label>
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
                        isDarkMode={isDarkMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${textSecondaryClass}`}>Ukuran Analog</Label>
                      <div className="flex flex-wrap gap-2.5">
                        {ANALOG_SIZE_OPTIONS.map((s) => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => updateForm({ analogSize: s.value })}
                            className={`ios-haptic rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                              c.analogSize === s.value
                                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                                : isDarkMode ? 'border-zinc-700 bg-zinc-800/40 text-zinc-400 hover:border-zinc-600' : 'border-gray-300 bg-gray-100/60 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <ToggleSwitch
                  label="Tampilkan Detik"
                  checked={c.showSeconds}
                  onChange={(v) => updateForm({ showSeconds: v })}
                  isDarkMode={isDarkMode}
                />

                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${textSecondaryClass}`}>Animasi Jam</Label>
                  <div className="grid grid-cols-2 gap-2.5">
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
                        className={`ios-haptic flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${
                          (c.clockAnimation || 'none') === a.value
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : isDarkMode ? 'border-zinc-700 bg-zinc-800/40 text-zinc-500 hover:border-zinc-600' : 'border-gray-300 bg-gray-100/60 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section C: Jadwal Sholat & Sidebar */}
            <AccordionItem value="prayer" className={`rounded-2xl border ${borderClass} ${isDarkMode ? 'bg-zinc-900/80 glass-strong-dark' : 'bg-white/80 glass-light'} ios-card overflow-hidden`}>
              <AccordionTrigger className={`py-5 text-base font-semibold ${textClass} hover:no-underline px-5`}>
                <div className="flex items-center gap-3">
                  <Clock className={`h-5 w-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  Jadwal Sholat & Sidebar
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-5 pb-5 px-5">
                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${textSecondaryClass}`}>Mode Sumber Jadwal</Label>
                  <ButtonGroup
                    options={[
                      { value: 'auto', label: 'Otomatis' },
                      { value: 'manual', label: 'Manual' },
                    ]}
                    value={c.prayerSourceMode}
                    onChange={(v) =>
                      updateForm({ prayerSourceMode: v as 'auto' | 'manual' })
                    }
                    isDarkMode={isDarkMode}
                  />
                </div>

                {c.prayerSourceMode === 'manual' && (
                  <div className="space-y-3">
                    <SectionLabel isDarkMode={isDarkMode}>Jadwal Sholat Manual</SectionLabel>
                    <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                      {c.prayerTimesTemplate.map((prayer, idx) => (
                        <div
                          key={prayer.id}
                          className={`flex items-center gap-3 rounded-xl border ${isDarkMode ? 'border-zinc-800 bg-zinc-800/40' : 'border-gray-300 bg-gray-100/60'} p-3`}
                        >
                          <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`} dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
                                {prayer.arabic}
                              </span>
                              <Input
                                value={prayer.latin}
                                onChange={(e) =>
                                  updatePrayerTime(idx, 'latin', e.target.value)
                                }
                                className={`h-9 flex-1 text-sm rounded-lg ${isDarkMode ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-gray-300 bg-white text-gray-900'}`}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={prayer.time}
                                onChange={(e) =>
                                  updatePrayerTime(idx, 'time', e.target.value)
                                }
                                className={`h-9 rounded-lg border ${isDarkMode ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-gray-300 bg-white text-gray-900'} px-3 text-sm [color-scheme:${isDarkMode ? 'dark' : 'light'}]`}
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePrayerTime(idx)}
                            className="ios-haptic h-9 w-9 shrink-0 text-zinc-600 hover:text-red-400 rounded-xl"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      onClick={addPrayerTime}
                      className={`ios-haptic w-full border border-dashed py-3.5 text-sm rounded-xl ${isDarkMode ? 'border-zinc-700 text-zinc-500 hover:border-amber-500/50 hover:text-amber-400' : 'border-gray-300 text-gray-600 hover:border-amber-500/50 hover:text-amber-600'}`}
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Tambah Sholat
                    </Button>
                  </div>
                )}

                <SliderField
                  label="Ukuran Font Kartu Sholat"
                  value={c.prayerCardFontSize}
                  onChange={(v) => updateForm({ prayerCardFontSize: v })}
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  unit="x"
                  isDarkMode={isDarkMode}
                />

                <Separator className={isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} />

                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${textSecondaryClass}`}>Warna Kartu Sholat</Label>
                  <div className="grid grid-cols-4 gap-2.5">
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
                        className={`ios-haptic flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-all ${
                          c.cardBgColor === cc.bg
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : isDarkMode ? 'border-zinc-700 bg-zinc-800/40 text-zinc-500 hover:border-zinc-600' : 'border-gray-300 bg-gray-100/60 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                        }`}
                      >
                        <div
                          className="h-6 w-6 rounded-full border border-zinc-600"
                          style={{ backgroundColor: cc.dot }}
                        />
                        <span className={isDarkMode ? 'text-zinc-400' : 'text-gray-700'}>{cc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section D: Mode Adhan & Iqomah */}
            <AccordionItem value="adhan" className={`rounded-2xl border ${borderClass} ${isDarkMode ? 'bg-zinc-900/80 glass-strong-dark' : 'bg-white/80 glass-light'} ios-card overflow-hidden`}>
              <AccordionTrigger className={`py-5 text-base font-semibold ${textClass} hover:no-underline px-5`}>
                <div className="flex items-center gap-3">
                  <Volume2 className={`h-5 w-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  Mode Adhan & Iqomah
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-5 pb-5 px-5">
                <InfoBanner isDarkMode={isDarkMode}>
                  Mode Adhan &amp; Iqomah hanya berlaku untuk sholat 5 waktu (Subuh, Dzuhur, Ashar, Maghrib, Isya). Sholat sunnah seperti Dhuha &amp; Tahajud tidak memicu Adhan/Iqomah.
                </InfoBanner>

                <ToggleSwitch
                  label="Aktifkan Mode Adhan"
                  checked={c.adhanModeEnabled}
                  onChange={(v) => updateForm({ adhanModeEnabled: v })}
                  description="Tampilan layar penuh saat waktu adhan tiba"
                  isDarkMode={isDarkMode}
                />

                {c.adhanModeEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${textSecondaryClass}`}>Durasi Adhan</Label>
                      <ButtonGroup
                        options={[
                          { value: '120', label: '2 menit' },
                          { value: '180', label: '3 menit' },
                          { value: '300', label: '5 menit' },
                        ]}
                        value={String(c.adhanDuration)}
                        onChange={(v) => updateForm({ adhanDuration: Number(v) })}
                        isDarkMode={isDarkMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${textSecondaryClass}`}>Animasi Hitung Mundur Adhan</Label>
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
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  </>
                )}

                <Separator className={isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} />

                <ToggleSwitch
                  label="Aktifkan Mode Iqomah"
                  checked={c.iqomahModeEnabled}
                  onChange={(v) => updateForm({ iqomahModeEnabled: v })}
                  description="Hitung mundur iqomah setelah adhan selesai"
                  isDarkMode={isDarkMode}
                />

                {c.iqomahModeEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${textSecondaryClass}`}>Font Iqomah</Label>
                      <Select
                        value={c.iqomahFontFamily}
                        onValueChange={(v) => updateForm({ iqomahFontFamily: v })}
                      >
                        <SelectTrigger className={`w-full py-3 text-base rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-gray-300 bg-white'}>
                          {FONT_OPTIONS_IQOMAH.map((f) => (
                            <SelectItem key={f.value} value={f.value} className={isDarkMode ? 'text-zinc-300' : 'text-gray-700'}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <SliderField
                      label="Ukuran Font Iqomah"
                      value={c.iqomahFontSize}
                      onChange={(v) => updateForm({ iqomahFontSize: v })}
                      min={4}
                      max={20}
                      step={0.5}
                      unit="rem"
                      isDarkMode={isDarkMode}
                    />

                    <ToggleSwitch
                      label="Suara Beep Iqomah"
                      checked={c.iqomahBeepEnabled}
                      onChange={(v) => updateForm({ iqomahBeepEnabled: v })}
                      description="Bunyi beep pendek saat iqomah dimulai"
                      isDarkMode={isDarkMode}
                    />

                    <div className="space-y-3">
                      <SliderField
                        label="Menit Iqomah (setelah Adhan)"
                        value={c.iqomahMinutes}
                        onChange={(v) => updateForm({ iqomahMinutes: v })}
                        min={1}
                        max={20}
                        step={1}
                        unit=" menit"
                        isDarkMode={isDarkMode}
                      />
                      <div className="flex flex-wrap gap-2.5">
                        {IQOMAH_QUICK.map((q) => (
                          <button
                            key={q.value}
                            type="button"
                            onClick={() => updateForm({ iqomahMinutes: q.value })}
                            className={`ios-haptic rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
                              c.iqomahMinutes === q.value
                                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                                : isDarkMode ? 'border-zinc-700 bg-zinc-800/40 text-zinc-500 hover:border-zinc-600' : 'border-gray-300 bg-gray-100/60 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                            }`}
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${textSecondaryClass}`}>Animasi Hitung Mundur Iqomah</Label>
                      <div className="grid grid-cols-2 gap-2.5">
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
                            className={`ios-haptic flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${
                              (c.iqomahCountdownAnimation || 'pulse') === a.value
                                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                : isDarkMode ? 'border-zinc-700 bg-zinc-800/40 text-zinc-500 hover:border-zinc-600' : 'border-gray-300 bg-gray-100/60 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                            }`}
                          >
                            {a.value === 'led-jadul' && <span className="text-base">📺</span>}
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {c.iqomahModeEnabled && (
                  <ToggleSwitch
                    label="Tampilkan Pesan Setelah Iqomah"
                    checked={c.postIqomahEnabled}
                    onChange={(v) => updateForm({ postIqomahEnabled: v })}
                    description='Tampilkan "Selamat Menunaikan Ibadah Shalat" selama 2 menit setelah iqomah'
                    isDarkMode={isDarkMode}
                  />
                )}

                {c.postIqomahEnabled && (
                  <>
                    <Separator className={isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} />
                    <SectionLabel isDarkMode={isDarkMode}>Koleksi Hadits & Ayat Al-Quran</SectionLabel>
                    <p className={`text-sm ${textSecondaryClass} leading-relaxed`}>
                      Hadits dan ayat akan ditampilkan bergantian pada layar shalat (setelah iqomah). Tambahkan koleksi Anda di bawah ini.
                    </p>

                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                      {(c.hadithCollection || []).map((item, idx) => (
                        <div
                          key={item.id}
                          className={`rounded-xl border ${
                            isDarkMode 
                              ? 'border-zinc-800 bg-zinc-900/60' 
                              : 'border-gray-300 bg-white/80'
                          } p-4 space-y-3`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold ${
                                  item.type === 'ayat'
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : 'bg-amber-500/15 text-amber-400'
                                }`}
                              >
                                {item.type === 'ayat' ? 'Ayat' : 'Hadits'}
                              </span>
                              <span className={`text-xs ${textSecondaryClass}`}>#{idx + 1}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const updated = [...(c.hadithCollection || [])]
                                  updated[idx] = { ...updated[idx], active: !updated[idx].active }
                                  updateForm({ hadithCollection: updated })
                                }}
                                className={`ios-haptic flex h-7 w-12 items-center rounded-full px-0.5 transition-colors ${
                                  item.active ? 'bg-amber-500' : isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'
                                }`}
                              >
                                <div
                                  className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                    item.active ? 'translate-x-5' : ''
                                  }`}
                                />
                              </button>
                              <button
                                onClick={() => {
                                  const updated = (c.hadithCollection || []).filter((_, i) => i !== idx)
                                  updateForm({ hadithCollection: updated })
                                }}
                                className="ios-haptic flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          
                          <div className={`rounded-xl ${
                            isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-100'
                          } px-3 py-2.5`}>
                            <p className={`text-right text-base leading-relaxed font-amiri ${
                              isDarkMode ? 'text-zinc-200' : 'text-gray-800'
                            }`} dir="rtl">
                              {item.arabic}
                            </p>
                          </div>
                          
                          <p className={`text-sm italic pl-3 border-l-2 ${
                            isDarkMode 
                              ? 'text-zinc-400 border-zinc-700' 
                              : 'text-gray-700 border-gray-300'
                          }`}>
                            {item.meaning}
                          </p>
                          
                          <p className={`text-xs font-semibold tracking-wide ${
                            isDarkMode ? 'text-zinc-500' : 'text-gray-600'
                          }`}>
                            {item.source}
                          </p>
                        </div>
                      ))}
                      
                      {(c.hadithCollection || []).length === 0 && (
                        <div className={`rounded-xl border border-dashed ${
                          isDarkMode ? 'border-zinc-800' : 'border-gray-300'
                        } py-8 text-center`}>
                          <BookOpen className={`mx-auto mb-3 h-8 w-8 ${
                            isDarkMode ? 'text-zinc-600' : 'text-gray-400'
                          }`} />
                          <p className={`text-sm ${textSecondaryClass}`}>Belum ada hadits atau ayat</p>
                        </div>
                      )}
                    </div>

                    <AddHadithForm
                      onAdd={(item) => {
                        const collection = c.hadithCollection || []
                        updateForm({ hadithCollection: [...collection, item] })
                      }}
                      isDarkMode={isDarkMode}
                    />
                  </>
                )}

                <Separator className={isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} />
                <SectionLabel isDarkMode={isDarkMode}>Preview Tampilan</SectionLabel>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={openPreviewAdhan}
                    className={`ios-haptic w-full py-3 rounded-xl ${isDarkMode ? 'border-zinc-700 bg-zinc-800/40 text-zinc-300 hover:border-amber-500/50 hover:text-amber-400' : 'border-gray-300 bg-gray-100/60 text-gray-700 hover:border-amber-500/50 hover:text-amber-600'}`}
                  >
                    <Eye className="mr-1.5 h-4 w-4" />
                    <span className="text-sm">Adhan</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openPreviewIqomah}
                    className={`ios-haptic w-full py-3 rounded-xl ${isDarkMode ? 'border-zinc-700 bg-zinc-800/40 text-zinc-300 hover:border-red-500/50 hover:text-red-400' : 'border-gray-300 bg-gray-100/60 text-gray-700 hover:border-red-500/50 hover:text-red-600'}`}
                  >
                    <Eye className="mr-1.5 h-4 w-4" />
                    <span className="text-sm">Iqomah</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openPreviewPostIqomah}
                    className={`ios-haptic w-full py-3 rounded-xl ${isDarkMode ? 'border-zinc-700 bg-zinc-800/40 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400' : 'border-gray-300 bg-gray-100/60 text-gray-700 hover:border-emerald-500/50 hover:text-emerald-600'}`}
                  >
                    <Eye className="mr-1.5 h-4 w-4" />
                    <span className="text-sm">Shalat</span>
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section E: Teks Berjalan */}
            <AccordionItem value="running" className={`rounded-2xl border ${borderClass} ${isDarkMode ? 'bg-zinc-900/80 glass-strong-dark' : 'bg-white/80 glass-light'} ios-card overflow-hidden`}>
              <AccordionTrigger className={`py-5 text-base font-semibold ${textClass} hover:no-underline px-5`}>
                <div className="flex items-center gap-3">
                  <MessageSquare className={`h-5 w-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  Teks Berjalan
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-5 pb-5 px-5">
                <ToggleSwitch
                  label="Tampilkan Teks Berjalan"
                  checked={c.showAnnouncement}
                  onChange={(v) => updateForm({ showAnnouncement: v })}
                  description="Teks pengumuman muncul di bagian bawah layar"
                  isDarkMode={isDarkMode}
                />

                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${textSecondaryClass}`}>Gaya Animasi</Label>
                  <div className="grid grid-cols-2 gap-2.5">
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
                        className={`ios-haptic flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${
                          c.runningAnimation === a.value
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : isDarkMode ? 'border-zinc-700 bg-zinc-800/40 text-zinc-500 hover:border-zinc-600' : 'border-gray-300 bg-gray-100/60 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                        }`}
                      >
                        <span className="text-base">{a.icon}</span>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <SliderField
                  label="Kecepatan Animasi"
                  value={c.runningSpeed}
                  onChange={(v) => updateForm({ runningSpeed: v })}
                  min={5}
                  max={60}
                  step={1}
                  unit="s"
                  isDarkMode={isDarkMode}
                />

                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${textSecondaryClass}`}>Font Teks Berjalan</Label>
                  <Select
                    value={c.runningFontFamily}
                    onValueChange={(v) => updateForm({ runningFontFamily: v })}
                  >
                    <SelectTrigger className={`w-full py-3 text-base rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-gray-300 bg-white'}>
                      {FONT_OPTIONS_RUNNING.map((f) => (
                        <SelectItem key={f.value} value={f.value} className={isDarkMode ? 'text-zinc-300' : 'text-gray-700'}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <SliderField
                  label="Ukuran Font Teks Berjalan"
                  value={c.runningFontSize}
                  onChange={(v) => updateForm({ runningFontSize: v })}
                  min={0.5}
                  max={3}
                  step={0.1}
                  unit="rem"
                  isDarkMode={isDarkMode}
                />

                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${textSecondaryClass}`}>Teks Pengumuman</Label>
                  <Textarea
                    value={c.announcement}
                    onChange={(e) => updateForm({ announcement: e.target.value })}
                    className={`min-h-24 resize-none py-3 text-base rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'}`}
                    placeholder="Masukkan teks pengumuman..."
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section F: Informasi Pengajian */}
            <AccordionItem value="info" className={`rounded-2xl border ${borderClass} ${isDarkMode ? 'bg-zinc-900/80 glass-strong-dark' : 'bg-white/80 glass-light'} ios-card overflow-hidden`}>
              <AccordionTrigger className={`py-5 text-base font-semibold ${textClass} hover:no-underline px-5`}>
                <div className="flex items-center gap-3">
                  <FileImage className={`h-5 w-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  Informasi & Pengajian
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-5 pb-5 px-5">
                <InfoBanner isDarkMode={isDarkMode}>
                  Tambahkan informasi pengajian, kajian, atau acara masjid. Gambar disimpan di cloud Supabase. Atur jadwal tampil masing-masing informasi.
                </InfoBanner>

                <ToggleSwitch
                  label="Tampilkan Informasi di Layar Utama"
                  checked={c.informationEnabled}
                  onChange={(v) => updateForm({ informationEnabled: v })}
                  description="Informasi aktif akan ditampilkan bergantian di layar"
                  isDarkMode={isDarkMode}
                />

                {c.informationEnabled && (
                  <>
                    <Separator className={isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} />
                    <SectionLabel isDarkMode={isDarkMode}>Pengaturan Tampilan Informasi</SectionLabel>

                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${textSecondaryClass}`}>Posisi Judul & Deskripsi</Label>
                      <ButtonGroup
                        options={[
                          { value: 'top-left', label: 'Atas Kiri (dalam gambar)' },
                          { value: 'top-right', label: 'Atas Kanan (dalam gambar)' },
                          { value: 'inside-image', label: 'Bawah Tengah (dalam gambar)' },
                        ]}
                        value={c.infoTitlePosition || 'top-left'}
                        onChange={(v) => updateForm({ infoTitlePosition: v as 'top-left' | 'top-right' | 'inside-image' })}
                        isDarkMode={isDarkMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${textSecondaryClass}`}>Warna Font Judul</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={c.infoTitleFontColor || '#ffffff'}
                          onChange={(e) => updateForm({ infoTitleFontColor: e.target.value })}
                          className="h-10 w-12 cursor-pointer rounded-xl border border-zinc-700 bg-transparent"
                        />
                        <Input
                          value={c.infoTitleFontColor || '#ffffff'}
                          onChange={(e) => updateForm({ infoTitleFontColor: e.target.value })}
                          className={`flex-1 py-3 text-sm font-mono rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'}`}
                          maxLength={7}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${textSecondaryClass}`}>Font Judul</Label>
                      <Select
                        value={c.infoTitleFontFamily || "'Amiri', serif"}
                        onValueChange={(v) => updateForm({ infoTitleFontFamily: v })}
                      >
                        <SelectTrigger className={`w-full py-3 text-base rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-gray-300 bg-white'}>
                          {FONT_OPTIONS_RUNNING.map((f) => (
                            <SelectItem key={f.value} value={f.value} className={isDarkMode ? 'text-zinc-300' : 'text-gray-700'}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <SliderField
                      label="Ukuran Font Judul"
                      value={c.infoTitleFontSize || 2.5}
                      onChange={(v) => updateForm({ infoTitleFontSize: v })}
                      min={0.5}
                      max={5}
                      step={0.1}
                      unit="rem"
                      isDarkMode={isDarkMode}
                    />

                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${textSecondaryClass}`}>Font Deskripsi</Label>
                      <Select
                        value={c.infoDescriptionFontFamily || "'Inter', sans-serif"}
                        onValueChange={(v) => updateForm({ infoDescriptionFontFamily: v })}
                      >
                        <SelectTrigger className={`w-full py-3 text-base rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-gray-300 bg-white'}>
                          {FONT_OPTIONS_RUNNING.map((f) => (
                            <SelectItem key={f.value} value={f.value} className={isDarkMode ? 'text-zinc-300' : 'text-gray-700'}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <SliderField
                      label="Ukuran Font Deskripsi"
                      value={c.infoDescriptionFontSize || 1.2}
                      onChange={(v) => updateForm({ infoDescriptionFontSize: v })}
                      min={0.5}
                      max={3}
                      step={0.1}
                      unit="rem"
                      isDarkMode={isDarkMode}
                    />

                    <SliderField
                      label="Ukuran Gambar Informasi"
                      value={c.infoImageSize || 85}
                      onChange={(v) => updateForm({ infoImageSize: v })}
                      min={30}
                      max={100}
                      step={5}
                      unit="%"
                      isDarkMode={isDarkMode}
                    />
                  </>
                )}

                {c.informationItems?.length > 0 && (
                  <div className="space-y-3">
                    <SectionLabel isDarkMode={isDarkMode}>Daftar Informasi</SectionLabel>
                    <div className="max-h-[550px] space-y-3 overflow-y-auto pr-1">
                      {c.informationItems.map((item, idx) => (
                        <div
                          key={item.id}
                          className={`space-y-3 rounded-xl border ${isDarkMode ? 'border-zinc-800 bg-zinc-800/40' : 'border-gray-300 bg-gray-100/60'} p-4`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <ToggleSwitch
                              label={item.title || 'Tanpa Judul'}
                              checked={item.active}
                              onChange={(v) => updateInformationItem(idx, 'active', v)}
                              isDarkMode={isDarkMode}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeInformationItem(idx)}
                              className="ios-haptic h-8 w-8 shrink-0 text-zinc-600 hover:text-red-400 rounded-xl"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            value={item.title}
                            onChange={(e) => updateInformationItem(idx, 'title', e.target.value)}
                            className={`h-10 text-base rounded-xl ${isDarkMode ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-gray-300 bg-white text-gray-900'}`}
                            placeholder="Judul (contoh: Pengajian Minggu)"
                          />
                          <Textarea
                            value={item.description}
                            onChange={(e) => updateInformationItem(idx, 'description', e.target.value)}
                            className={`min-h-20 resize-none py-3 text-base rounded-xl ${isDarkMode ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-gray-300 bg-white text-gray-900'}`}
                            placeholder="Keterangan detail..."
                          />

                          <div className="space-y-2">
                            <Label className={`text-sm font-medium ${textSecondaryClass}`}>Gambar (opsional, max 2MB)</Label>
                            {item.imageUrl ? (
                              <div className="relative">
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className={`h-36 w-full rounded-xl border ${isDarkMode ? 'border-zinc-700' : 'border-gray-300'} object-cover`}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleImageDelete(idx, item.imageFileName)}
                                  className="absolute top-2 right-2 ios-haptic flex h-8 w-8 items-center justify-center rounded-full bg-red-500/80 text-white hover:bg-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <label className={`ios-haptic flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed ${isDarkMode ? 'border-zinc-700 bg-zinc-900/50 hover:border-amber-500/50 hover:bg-zinc-800' : 'border-gray-300 bg-gray-100 hover:border-amber-500/50 hover:bg-gray-200'} py-5 transition-colors`}>
                                {imageUploading[idx] ? (
                                  <>
                                    <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                                    <span className="text-sm text-amber-400">Mengupload...</span>
                                  </>
                                ) : (
                                  <>
                                    <ImageUp className={`h-5 w-5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`} />
                                    <span className={`text-sm ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Upload Gambar</span>
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

                          <div className={`space-y-3 rounded-xl border ${isDarkMode ? 'border-zinc-700/50 bg-zinc-900/50' : 'border-gray-300 bg-gray-200/50'} p-4`}>
                            <div className="flex items-center justify-between">
                              <Label className={`text-sm font-medium ${textSecondaryClass}`}>Atur Jadwal Tampil</Label>
                              <ToggleSwitch
                                label=""
                                checked={!!item.scheduleEnabled}
                                onChange={(v) => updateInformationItem(idx, 'scheduleEnabled', v)}
                                isDarkMode={isDarkMode}
                              />
                            </div>
                            {item.scheduleEnabled && (
                              <div className="space-y-3">
                                <InfoBanner isDarkMode={isDarkMode}>
                                  Informasi tidak akan tampil saat jam sholat dan iqomah. Setelah iqomah selesai, tampilan akan kembali aktif.
                                </InfoBanner>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <Label className={`text-xs ${textSecondaryClass}`}>Mulai Jam</Label>
                                    <input
                                      type="time"
                                      value={item.displayStartTime || '08:00'}
                                      onChange={(e) => updateInformationItem(idx, 'displayStartTime', e.target.value)}
                                      className={`h-10 w-full rounded-xl border ${isDarkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-300' : 'border-gray-300 bg-white text-gray-900'} px-3 text-sm [color-scheme:${isDarkMode ? 'dark' : 'light'}]`}
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className={`text-xs ${textSecondaryClass}`}>Sampai Jam</Label>
                                    <input
                                      type="time"
                                      value={item.displayEndTime || '17:00'}
                                      onChange={(e) => updateInformationItem(idx, 'displayEndTime', e.target.value)}
                                      className={`h-10 w-full rounded-xl border ${isDarkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-300' : 'border-gray-300 bg-white text-gray-900'} px-3 text-sm [color-scheme:${isDarkMode ? 'dark' : 'light'}]`}
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
                  className={`ios-haptic w-full border border-dashed py-3.5 text-sm rounded-xl ${isDarkMode ? 'border-zinc-700 text-zinc-500 hover:border-amber-500/50 hover:text-amber-400' : 'border-gray-300 text-gray-600 hover:border-amber-500/50 hover:text-amber-600'}`}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Tambah Informasi
                </Button>

                <Separator className={isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} />
                <SectionLabel isDarkMode={isDarkMode}>Preview Tampilan</SectionLabel>
                <Button
                  variant="outline"
                  onClick={openPreviewInfo}
                  className={`ios-haptic w-full py-3 rounded-xl ${isDarkMode ? 'border-zinc-700 bg-zinc-800/40 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400' : 'border-gray-300 bg-gray-100/60 text-gray-700 hover:border-emerald-500/50 hover:text-emerald-600'}`}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Informasi & Pengajian
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* Section G: Tema & Tampilan */}
            <AccordionItem value="theme" className={`rounded-2xl border ${borderClass} ${isDarkMode ? 'bg-zinc-900/80 glass-strong-dark' : 'bg-white/80 glass-light'} ios-card overflow-hidden`}>
              <AccordionTrigger className={`py-5 text-base font-semibold ${textClass} hover:no-underline px-5`}>
                <div className="flex items-center gap-3">
                  <Palette className={`h-5 w-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  Tema & Tampilan
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-5 pb-5 px-5">
                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${textSecondaryClass}`}>Pilih Tema</Label>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondaryClass}`}>Gelap (Dark)</p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {THEME_OPTIONS.filter((t) => !t.isLight && !('layout' in t)).map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => updateForm({ theme: t.value })}
                        className={`ios-haptic flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                          c.theme === t.value
                            ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30'
                            : isDarkMode ? 'border-zinc-700 bg-zinc-800/40 hover:border-zinc-600' : 'border-gray-300 bg-gray-100/60 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex gap-1.5">
                          <div className="h-9 w-9 rounded-xl" style={{ backgroundColor: t.accent }} />
                          <div className="h-9 w-9 rounded-xl" style={{ backgroundColor: t.accentLight, opacity: 0.5 }} />
                        </div>
                        <span className={`text-base font-medium ${c.theme === t.value ? 'text-amber-400' : textClass}`}>
                          {t.label}
                        </span>
                        {c.theme === t.value && <ChevronRight className="ml-auto h-5 w-5 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                  
                  <p className={`mt-3 text-xs font-semibold uppercase tracking-wider ${textSecondaryClass}`}>Terang (Light)</p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {THEME_OPTIONS.filter((t) => t.isLight && !('layout' in t)).map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => updateForm({ theme: t.value })}
                        className={`ios-haptic flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                          c.theme === t.value
                            ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30'
                            : isDarkMode ? 'border-zinc-700 bg-zinc-800/40 hover:border-zinc-600' : 'border-gray-300 bg-gray-100/60 hover:border-gray-300'
                        }`}
                      >
                        <div className="relative flex gap-1 overflow-hidden rounded-xl">
                          <div className={`h-9 w-9 rounded-l-xl border ${isDarkMode ? 'border-zinc-600/50' : 'border-gray-300'}`} style={{ backgroundColor: t.bg || '#FAFAFA' }} />
                          <div className={`h-9 w-5 rounded-r-xl border ${isDarkMode ? 'border-zinc-600/50' : 'border-gray-300'}`} style={{ backgroundColor: t.accent }} />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-base font-medium ${c.theme === t.value ? 'text-amber-400' : textClass}`}>
                            {t.label}
                          </span>
                          <span className={`text-xs ${textSecondaryClass}`}>Tema Terang</span>
                        </div>
                        {c.theme === t.value && <ChevronRight className="ml-auto h-5 w-5 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                  
                  <p className={`mt-3 text-xs font-semibold uppercase tracking-wider ${textSecondaryClass}`}>Tampilan Berbeda (Layout Variant)</p>
                  <InfoBanner isDarkMode={isDarkMode}>
                    Tema ini memiliki posisi tata letak yang berbeda, bukan hanya warna. Coba untuk pengalaman tampilan yang baru!
                  </InfoBanner>
                  <div className="grid grid-cols-1 gap-2.5">
                    {THEME_OPTIONS.filter((t) => 'layout' in t).map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => updateForm({ theme: t.value as MasjidConfig['theme'] })}
                        className={`ios-haptic flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                          c.theme === t.value
                            ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30'
                            : isDarkMode ? 'border-zinc-700 bg-zinc-800/40 hover:border-zinc-600' : 'border-gray-300 bg-gray-100/60 hover:border-gray-300'
                        }`}
                      >
                        <div className="relative flex h-12 w-12 shrink-0 flex-col gap-0.5 overflow-hidden rounded-xl border border-zinc-600/50" style={{ backgroundColor: t.bg || '#111' }}>
                          {t.layout === 'nabawi' ? (
                            <>
                              <div className="flex flex-1 gap-px">
                                <div className="flex-1 flex items-center justify-center">
                                  <div className="h-1.5 w-3 rounded-sm" style={{ backgroundColor: t.accent, opacity: 0.6 }} />
                                </div>
                                <div className="w-3 border-l border-zinc-600/30" style={{ backgroundColor: t.accent, opacity: 0.15 }} />
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
                                <div className="h-1.5 w-3 rounded-sm" style={{ backgroundColor: t.accent, opacity: 0.6 }} />
                              </div>
                              <div className="h-0.5" style={{ backgroundColor: t.accent, opacity: 0.3 }} />
                            </>
                          ) : (
                            <>
                              <div className="flex flex-1 gap-px">
                                <div className="flex-1 flex items-center justify-center">
                                  <div className="h-1.5 w-2 rounded-sm" style={{ backgroundColor: t.accent, opacity: 0.6 }} />
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
                          <span className={`text-base font-medium ${c.theme === t.value ? 'text-amber-400' : textClass}`}>
                            {t.label}
                          </span>
                          <span className={`text-xs ${textSecondaryClass} truncate`}>
                            {t.description}
                          </span>
                        </div>
                        {c.theme === t.value && <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondaryClass}`}>Tema dari Server</p>
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    </div>
                    <button
                      onClick={fetchServerThemes}
                      disabled={loadingThemes}
                      className={`text-xs ${textSecondaryClass} hover:${isDarkMode ? 'text-zinc-300' : 'text-gray-700'} transition-colors`}
                    >
                      {loadingThemes ? 'Memuat...' : 'Refresh'}
                    </button>
                  </div>
                  <InfoBanner isDarkMode={isDarkMode}>
                    Tema buatan superadmin yang tersimpan di server. Klik untuk menerapkan ke perangkat ini.
                  </InfoBanner>
                  {serverThemes.length === 0 ? (
                    <div className={`rounded-xl border border-dashed ${isDarkMode ? 'border-zinc-800' : 'border-gray-300'} py-6 text-center mt-3`}>
                      <p className={`text-sm ${textSecondaryClass}`}>Belum ada tema yang tersedia</p>
                      <Link href="/superadmin/themes" className="text-xs text-purple-400 hover:text-purple-300 mt-1 inline-block">
                        Buat tema di Theme Designer →
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2.5">
                      {serverThemes.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => applyServerTheme(t.id)}
                          className={`ios-haptic flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${isDarkMode ? 'border-zinc-700 bg-zinc-800/40 hover:border-purple-500/40 hover:bg-purple-500/5' : 'border-gray-300 bg-gray-100/60 hover:border-purple-500/40 hover:bg-purple-50'}`}
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-zinc-600/50" style={{ background: t.bgType === 'solid' ? t.bgSolidColor : (t.bgGradient || '#111') }}>
                            <div className="absolute bottom-0 left-0 right-0 h-2.5" style={{ backgroundColor: t.accentGold, opacity: 0.6 }} />
                            <div className="absolute top-1.5 left-1.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.accentGold }} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className={`text-base font-medium ${textClass} truncate`}>{t.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`${isDarkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-400' : 'border-gray-300 bg-gray-200 text-gray-600'} text-[10px] px-2 py-0.5 rounded-full`}>
                                {t.category}
                              </Badge>
                              {t.layout && t.layout !== 'default' && (
                                <Badge className="border-purple-500/30 bg-purple-500/10 text-[10px] text-purple-400 px-2 py-0.5 rounded-full">
                                  {t.layout}
                                </Badge>
                              )}
                              {t.isLight && (
                                <Badge className="border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-400 px-2 py-0.5 rounded-full">
                                  light
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className={`ml-auto h-5 w-5 shrink-0 ${isDarkMode ? 'text-zinc-600' : 'text-gray-400'}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`mt-2 space-y-4 rounded-xl border ${isDarkMode ? 'border-zinc-700 bg-zinc-800/30' : 'border-gray-300 bg-gray-100/60'} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div
                          className="h-5 w-5 rounded border border-zinc-600"
                          style={{ backgroundColor: c.customThemeAccent }}
                        />
                        <div
                          className="h-5 w-5 rounded border border-zinc-600"
                          style={{ backgroundColor: c.customThemeAccentLight, opacity: 0.5 }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${textClass}`}>Tema Custom</span>
                    </div>
                    <Button
                      size="sm"
                      variant={c.theme === 'custom' ? 'default' : 'outline'}
                      onClick={() => updateForm({ theme: 'custom' })}
                      className={c.theme === 'custom' ? 'bg-amber-500 text-black hover:bg-amber-600 h-9 text-sm rounded-xl' : `h-9 text-sm rounded-xl ${isDarkMode ? 'border-zinc-700 text-zinc-400' : 'border-gray-300 text-gray-600'}`}
                    >
                      {c.theme === 'custom' ? 'Aktif' : 'Gunakan'}
                    </Button>
                  </div>

                  {c.theme === 'custom' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className={`text-sm font-medium ${textSecondaryClass}`}>Warna Aksen Utama</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={c.customThemeAccent}
                            onChange={(e) => updateForm({ customThemeAccent: e.target.value })}
                            className="h-10 w-12 cursor-pointer rounded-xl border border-zinc-700 bg-transparent"
                          />
                          <Input
                            value={c.customThemeAccent}
                            onChange={(e) => updateForm({ customThemeAccent: e.target.value })}
                            className={`flex-1 py-3 text-sm font-mono rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'}`}
                            maxLength={7}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className={`text-sm font-medium ${textSecondaryClass}`}>Warna Aksen Terang</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={c.customThemeAccentLight}
                            onChange={(e) => updateForm({ customThemeAccentLight: e.target.value })}
                            className="h-10 w-12 cursor-pointer rounded-xl border border-zinc-700 bg-transparent"
                          />
                          <Input
                            value={c.customThemeAccentLight}
                            onChange={(e) => updateForm({ customThemeAccentLight: e.target.value })}
                            className={`flex-1 py-3 text-sm font-mono rounded-xl ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-gray-100/80 border-gray-300 text-gray-900'}`}
                            maxLength={7}
                          />
                        </div>
                      </div>

                      <Separator className={isDarkMode ? 'bg-zinc-700/50' : 'bg-gray-300/50'} />
                      
                      <div className="space-y-3">
                        <Label className={`text-sm font-medium ${textSecondaryClass}`}>Gambar Latar Belakang</Label>
                        {c.customBackgroundImage ? (
                          <div className={`relative rounded-xl overflow-hidden border ${isDarkMode ? 'border-zinc-700' : 'border-gray-300'}`}>
                            <img
                              src={c.customBackgroundImage}
                              alt="Background"
                              className="w-full h-28 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <button
                              onClick={() => updateForm({ customBackgroundImage: '', customBackgroundOpacity: 30 })}
                              className="absolute top-2 right-2 ios-haptic flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/70 hover:bg-red-500/80 hover:text-white transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className={`ios-haptic flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed ${isDarkMode ? 'border-zinc-700 hover:border-amber-500/40 hover:bg-amber-500/5' : 'border-gray-300 hover:border-amber-500/40 hover:bg-amber-50'} py-5 transition-colors`}>
                            <ImageUp className={`h-6 w-6 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`} />
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-zinc-500' : 'text-gray-600'}`}>Upload Gambar</span>
                            <span className={`text-xs ${isDarkMode ? 'text-zinc-600' : 'text-gray-500'}`}>JPG, PNG, WebP (maks 2MB)</span>
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

                      {c.customBackgroundImage && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className={`text-sm font-medium ${textSecondaryClass}`}>Opacity Gambar</Label>
                            <span className={`text-sm font-mono ${textSecondaryClass}`}>{c.customBackgroundOpacity || 30}%</span>
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

                <Separator className={isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} />

                <div className="space-y-4">
                  <SectionLabel isDarkMode={isDarkMode}>Opsi Tampilan</SectionLabel>
                  <ToggleSwitch
                    label="Tanggal Hijriyah"
                    checked={c.showHijri}
                    onChange={(v) => updateForm({ showHijri: v })}
                    description="Tampilkan tanggal Hijriyah di bawah tanggal Masehi"
                    isDarkMode={isDarkMode}
                  />
                  <ToggleSwitch
                    label="Hitung Mundur Sholat"
                    checked={c.showCountdown}
                    onChange={(v) => updateForm({ showCountdown: v })}
                    description="Tampilkan sisa waktu menuju sholat berikutnya"
                    isDarkMode={isDarkMode}
                  />
                  <ToggleSwitch
                    label="Suara Alarm"
                    checked={c.soundEnabled}
                    onChange={(v) => updateForm({ soundEnabled: v })}
                    description="Aktifkan suara notifikasi saat waktu sholat"
                    isDarkMode={isDarkMode}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>

      {/* Sticky Save Button */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 border-t ${borderClass} ${headerBgClass} sticky-header`}
      >
        <div className="mx-auto w-full max-w-2xl px-4 pb-5 pt-3">
          
          <Button
            onClick={handleSave}
            disabled={saving || isLoading}
            className="ios-haptic flex items-center justify-center gap-2 h-14 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-base font-semibold text-black rounded-2xl hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
          >
            {saving || isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                {hasUnsavedChanges ? 'Simpan Pengaturan' : 'Pengaturan Tersimpan'}
              </>
            )}
          </Button>

          {hasUnsavedChanges && (
            <p className={`mt-2 text-center text-xs ${textSecondaryClass}`}>
              Anda memiliki perubahan yang belum disimpan
            </p>
          )}
          
        </div>
      </div>

      {/* Preview Overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black">
          <div className="absolute top-0 left-0 right-0 z-[110] flex items-center justify-between px-5 py-3 bg-black/70 sticky-header">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-white/80">Preview Mode</span>
              {previewMode !== 'none' && (
                <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-400">
                  {previewMode === 'adhan' ? 'Adhan' : previewMode === 'iqomah' ? 'Iqomah' : previewMode === 'post-iqomah' ? 'Shalat' : 'Informasi'}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closePreview}
              className="ios-haptic h-9 gap-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl text-sm"
            >
              <X className="h-4 w-4" />
              <span>Kembali ke Settings</span>
            </Button>
          </div>
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
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    checkSavedAuth()
    const savedMode = localStorage.getItem('settingsDarkMode')
    if (savedMode) setIsDarkMode(savedMode === 'true')
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [checkSavedAuth, isDarkMode])

  const handleToggleDarkMode = useCallback(() => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('settingsDarkMode', String(newMode))
    document.documentElement.classList.toggle('dark', newMode)
  }, [isDarkMode])

  if (!isAuthenticated) {
    return <LoginScreen isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
  }

  return <SettingsDashboard isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
}
