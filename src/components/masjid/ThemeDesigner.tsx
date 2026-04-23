'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Palette, Plus, Trash2, Save, Eye, EyeOff, Maximize2, Minimize2,
  Download, Upload, Copy, Check, X, ChevronRight, Sparkles,
  Layout, Image, Type, Clock, Layers, Monitor, ArrowLeft, Loader2,
  Paintbrush, RefreshCw,
} from 'lucide-react'

// ============================================================
// TYPES
// ============================================================

export interface ThemeConfig {
  name: string
  description: string
  category: 'dark' | 'light' | 'layout'
  isPublic: boolean

  layout: 'default' | 'nabawi' | 'makkah' | 'cordoba'

  bgType: 'gradient' | 'solid' | 'image'
  bgGradient: string
  bgSolidColor: string
  bgImageUrl: string
  bgImageOpacity: number

  isLight: boolean

  accentGold: string
  accentLight: string
  textPrimary: string
  textMuted: string
  textCard: string

  headerBg: string
  headerBorder: string
  footerBg: string
  footerBorder: string

  cardBg: string
  cardBorder: string
  cardHighlightBg: string
  cardHighlightBorder: string
  cardTextColor: string
  cardFontSize: number

  runningTextColor: string
  runningTextBg: string

  clockType: 'digital' | 'analog'
  clockFont: string
  clockSize: number
  clockStyle: 'default' | 'retro' | 'minimal'
  clockAnimation: string

  mosqueNameFont: string
  mosqueNameSize: number
  dateFont: string
  dateSize: number
  dateColor: string

  adhanStyle: 'dark' | 'light' | 'themed'
  adhanBgGradient: string

  iqomahFont: string
  iqomahSize: number
  iqomahAnimation: string

  previewImage: string
}

interface SavedTheme extends ThemeConfig {
  id: string
  createdAt?: string
  updatedAt?: string
}

// ============================================================
// PRESET DATA
// ============================================================

const PRESET_GRADIENTS = [
  { name: 'Dark Classic', value: 'linear-gradient(135deg, #0a0806 0%, #0f0d08 30%, #151210 60%, #0a0806 100%)' },
  { name: 'Nabawi Green', value: 'linear-gradient(135deg, #0a1a0f 0%, #0d2818 40%, #0a1a0f 100%)' },
  { name: 'Royal Gold', value: 'linear-gradient(135deg, #1a1005 0%, #2a1a0a 40%, #1a1005 100%)' },
  { name: 'Ocean Night', value: 'linear-gradient(135deg, #050a12 0%, #0a1628 40%, #050a12 100%)' },
  { name: 'Warm Earth', value: 'linear-gradient(135deg, #120e0a 0%, #1e1610 40%, #120e0a 100%)' },
  { name: 'Deep Maroon', value: 'linear-gradient(135deg, #120508 0%, #200a10 40%, #120508 100%)' },
  { name: 'Pure Dark', value: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)' },
  { name: 'Midnight Blue', value: 'linear-gradient(135deg, #060810 0%, #0c1020 40%, #060810 100%)' },
]

const FONT_OPTIONS = [
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'Roboto', value: "'Roboto', sans-serif" },
  { label: 'Cinzel', value: "'Cinzel', serif" },
  { label: 'Amiri', value: "'Amiri', serif" },
  { label: 'Orbitron', value: "'Orbitron', monospace" },
  { label: 'Josefin Sans', value: "'Josefin Sans', sans-serif" },
  { label: 'Lato', value: "'Lato', sans-serif" },
]

const CLOCK_ANIMATION_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Pulse', value: 'pulse' },
  { label: 'Glow', value: 'glow' },
  { label: 'Slide', value: 'slide' },
  { label: 'Fade', value: 'fade' },
]

const IQOMAH_ANIMATION_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Pulse', value: 'pulse' },
  { label: 'Bounce', value: 'bounce' },
  { label: 'Glow', value: 'glow' },
  { label: 'Shake', value: 'shake' },
]

const LAYOUT_LABELS: Record<string, string> = {
  default: 'Default',
  nabawi: 'Nabawi',
  makkah: 'Makkah',
  cordoba: 'Cordoba',
}

// ============================================================
// DEFAULT THEME CONFIG
// ============================================================

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  name: '',
  description: '',
  category: 'dark',
  isPublic: true,

  layout: 'default',

  bgType: 'gradient',
  bgGradient: 'linear-gradient(135deg, #0a0806 0%, #0f0d08 30%, #151210 60%, #0a0806 100%)',
  bgSolidColor: '#0a0806',
  bgImageUrl: '',
  bgImageOpacity: 30,

  isLight: false,

  accentGold: '#C9A84C',
  accentLight: '#E8D48B',
  textPrimary: '#ffffff',
  textMuted: '#ffffff99',
  textCard: '#ffffff',

  headerBg: 'rgba(0,0,0,0.6)',
  headerBorder: 'rgba(255,255,255,0.05)',
  footerBg: 'rgba(0,0,0,0.4)',
  footerBorder: 'rgba(255,255,255,0.05)',

  cardBg: 'rgba(201,168,76,0.08)',
  cardBorder: 'rgba(201,168,76,0.2)',
  cardHighlightBg: 'rgba(201,168,76,0.18)',
  cardHighlightBorder: 'rgba(201,168,76,0.5)',
  cardTextColor: '#ffffff',
  cardFontSize: 1,

  runningTextColor: '#C9A84C',
  runningTextBg: 'rgba(0,0,0,0.3)',

  clockType: 'digital',
  clockFont: "'Orbitron', monospace",
  clockSize: 6.5,
  clockStyle: 'default',
  clockAnimation: 'none',

  mosqueNameFont: "'Cinzel', serif",
  mosqueNameSize: 1.25,
  dateFont: "'Inter', sans-serif",
  dateSize: 0.8,
  dateColor: '#ffffff',

  adhanStyle: 'dark',
  adhanBgGradient: 'linear-gradient(135deg, #0a1628 0%, #162a50 50%, #0a1628 100%)',

  iqomahFont: "'Orbitron', monospace",
  iqomahSize: 1,
  iqomahAnimation: 'pulse',

  previewImage: '',
}

// ============================================================
// API CONFIG
// ============================================================

const SUPERADMIN_TOKEN = 'superadmin:sayaadmin123'
const apiHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPERADMIN_TOKEN}`,
})

// ============================================================
// HELPER COMPONENTS
// ============================================================

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-medium text-zinc-400">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded border border-zinc-700 bg-transparent"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border-zinc-700 bg-zinc-800 text-xs font-mono text-zinc-200"
        />
      </div>
    </div>
  )
}

function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] font-medium text-zinc-400">{label}</Label>
        <span className="text-xs font-mono text-zinc-300">
          {value}{unit}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="py-1"
      />
    </div>
  )
}

function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-semibold text-zinc-200">{children}</span>
    </div>
  )
}

function MiniPreview({ config }: { config: ThemeConfig }) {
  const bg = config.bgType === 'gradient'
    ? config.bgGradient
    : config.bgType === 'solid'
      ? config.bgSolidColor
      : config.bgSolidColor

  return (
    <div
      className="relative h-32 w-full overflow-hidden rounded-lg"
      style={{ background: bg }}
    >
      {/* Background image overlay */}
      {config.bgType === 'image' && config.bgImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${config.bgImageUrl})`,
            opacity: config.bgImageOpacity / 100,
          }}
        />
      )}

      {/* Header bar */}
      <div
        className="absolute inset-x-0 top-0 flex items-center justify-between px-2 py-1"
        style={{
          background: config.headerBg,
          borderBottom: `1px solid ${config.headerBorder}`,
        }}
      >
        <div className="h-1.5 w-8 rounded-sm" style={{ background: config.accentGold }} />
        <div className="h-1.5 w-4 rounded-sm" style={{ background: config.textMuted }} />
      </div>

      {/* Clock area */}
      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-0.5">
        <div
          className="h-4 w-16 rounded-sm"
          style={{
            background: config.accentGold,
            fontFamily: config.clockFont,
            opacity: 0.9,
          }}
        />
        <div className="flex items-center gap-1">
          <div className="h-1 w-10 rounded-sm" style={{ background: config.textMuted }} />
          <div className="h-1 w-6 rounded-sm" style={{ background: config.accentLight, opacity: 0.5 }} />
        </div>
      </div>

      {/* Mini prayer cards */}
      <div className="absolute inset-x-0 bottom-5 flex justify-center gap-1 px-1">
        {['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'].map((p, i) => (
          <div
            key={p}
            className="flex flex-col items-center rounded px-1.5 py-1"
            style={{
              background: i === 0 ? config.cardHighlightBg : config.cardBg,
              border: `1px solid ${i === 0 ? config.cardHighlightBorder : config.cardBorder}`,
              opacity: i < 3 ? 1 : 0.5,
            }}
          >
            <div
              className="h-1.5 w-4 rounded-sm mb-0.5"
              style={{ background: config.cardTextColor }}
            />
            <div
              className="h-1 w-3 rounded-sm"
              style={{
                background: i === 0 ? config.accentGold : config.textMuted,
                fontSize: `${Math.max(0.5, config.cardFontSize * 0.5)}rem`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Running text bar */}
      <div
        className="absolute inset-x-0 bottom-0 px-2 py-0.5"
        style={{
          background: config.runningTextBg,
          borderTop: `1px solid ${config.footerBorder}`,
        }}
      >
        <div className="h-1 w-20 animate-pulse rounded-sm" style={{ background: config.runningTextColor, opacity: 0.6 }} />
      </div>
    </div>
  )
}

// ============================================================
// LIVE PREVIEW COMPONENT (Right Panel)
// ============================================================

function LivePreview({ config }: { config: ThemeConfig }) {
  const bg = config.bgType === 'gradient'
    ? config.bgGradient
    : config.bgType === 'solid'
      ? config.bgSolidColor
      : config.bgSolidColor

  return (
    <div className="flex flex-col gap-3">
      {/* Preview controls */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">Live Preview</span>
        <Badge variant="outline" className="border-zinc-700 text-[10px] text-zinc-400">
          {LAYOUT_LABELS[config.layout] || config.layout}
        </Badge>
      </div>

      {/* 16:9 Preview Frame */}
      <div className="relative w-full overflow-hidden rounded-xl border border-zinc-700/50 shadow-2xl shadow-black/50">
        <div
          className="relative w-full"
          style={{
            background: bg,
            paddingBottom: '56.25%', // 16:9
          }}
        >
          {/* Actual preview content */}
          <div
            className="absolute inset-0 flex flex-col overflow-hidden"
            style={{
              background: bg,
            }}
          >
            {/* Background image */}
            {config.bgType === 'image' && config.bgImageUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${config.bgImageUrl})`,
                  opacity: config.bgImageOpacity / 100,
                }}
              />
            )}

            {/* Header */}
            <div
              className="relative z-10 flex shrink-0 items-center justify-between px-3 py-1.5"
              style={{
                background: config.headerBg,
                borderBottom: `1px solid ${config.headerBorder}`,
              }}
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ background: config.accentGold }} />
                <div
                  className="text-[9px] font-bold leading-none"
                  style={{
                    color: config.accentGold,
                    fontFamily: config.mosqueNameFont,
                  }}
                >
                  MasjidScreen
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="text-[10px] font-bold leading-none"
                  style={{
                    color: config.accentGold,
                    fontFamily: config.clockFont,
                  }}
                >
                  14:35
                </div>
              </div>
            </div>

            {/* Main area */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-2 px-4 py-3">
              {/* Mosque name */}
              <div
                className="text-center leading-tight"
                style={{
                  color: config.accentGold,
                  fontFamily: config.mosqueNameFont,
                  fontSize: `${Math.max(0.5, config.mosqueNameSize * 0.55)}rem`,
                }}
              >
                بِسْمِ اللَّهِ
              </div>
              <div
                className="text-center"
                style={{
                  color: config.textPrimary,
                  opacity: 0.8,
                  fontSize: `${Math.max(0.4, config.mosqueNameSize * 0.3)}rem`,
                  fontFamily: config.mosqueNameFont,
                }}
              >
                Masjid Al-Ikhlas
              </div>

              {/* Clock */}
              <div className="mt-1 flex flex-col items-center gap-0.5">
                <div
                  className="font-bold leading-none"
                  style={{
                    color: config.accentGold,
                    fontFamily: config.clockFont,
                    fontSize: `${Math.max(0.8, config.clockSize * 0.55)}rem`,
                    ...(config.clockStyle === 'retro' ? {
                      textShadow: `0 0 8px ${config.accentGold}40, 0 0 16px ${config.accentGold}20`,
                      letterSpacing: '0.05em',
                    } : config.clockStyle === 'minimal' ? {
                      fontWeight: 300,
                      letterSpacing: '0.15em',
                      opacity: 0.9,
                    } : {}),
                  }}
                >
                  14:35:00
                </div>
                <div
                  className="text-center"
                  style={{
                    color: config.dateColor || config.textMuted,
                    fontSize: `${Math.max(0.3, config.dateSize * 0.4)}rem`,
                    fontFamily: config.dateFont,
                  }}
                >
                  Senin, 16 Juni 2025
                </div>
              </div>
            </div>

            {/* Prayer cards */}
            <div className="relative z-10 px-2 pb-1.5">
              <div className="flex justify-center gap-1">
                {[
                  { name: 'Subuh', time: '04:35', active: false },
                  { name: 'Dzuhur', time: '12:00', active: true },
                  { name: 'Ashar', time: '15:15', active: false },
                  { name: 'Maghrib', time: '18:00', active: false },
                  { name: 'Isya', time: '19:15', active: false },
                ].map((prayer) => (
                  <div
                    key={prayer.name}
                    className="flex flex-col items-center rounded px-1.5 py-1"
                    style={{
                      background: prayer.active ? config.cardHighlightBg : config.cardBg,
                      border: `1px solid ${prayer.active ? config.cardHighlightBorder : config.cardBorder}`,
                    }}
                  >
                    <div
                      className="leading-none"
                      style={{
                        color: config.cardTextColor,
                        fontSize: `${Math.max(0.3, config.cardFontSize * 0.4)}rem`,
                        fontFamily: config.iqomahFont,
                      }}
                    >
                      {prayer.name}
                    </div>
                    <div
                      className="mt-0.5 font-bold leading-none"
                      style={{
                        color: prayer.active ? config.accentGold : config.cardTextColor,
                        fontSize: `${Math.max(0.3, config.cardFontSize * 0.45)}rem`,
                        fontFamily: config.clockFont,
                      }}
                    >
                      {prayer.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Running text */}
            <div
              className="relative z-10 shrink-0 px-2 py-1"
              style={{
                background: config.runningTextBg,
                borderTop: `1px solid ${config.footerBorder}`,
              }}
            >
              <div
                className="animate-pulse"
                style={{
                  color: config.runningTextColor,
                  fontSize: '0.35rem',
                  opacity: 0.7,
                }}
              >
                Selamat datang di Masjid Al-Ikhlas — Marhaban Ya Ramadhan
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview info */}
      <div className="flex items-center justify-between text-[10px] text-zinc-600">
        <span>Background: {config.bgType}</span>
        <span>Clock: {config.clockType} / {config.clockStyle}</span>
        <span>{config.isLight ? '☀ Light' : '🌙 Dark'}</span>
      </div>
    </div>
  )
}

// ============================================================
// THEME LIST VIEW
// ============================================================

function ThemeListView({
  themes,
  loading,
  onEdit,
  onDuplicate,
  onDelete,
  onCreateNew,
  onRefresh,
}: {
  themes: SavedTheme[]
  loading: boolean
  onEdit: (theme: SavedTheme) => void
  onDuplicate: (theme: SavedTheme) => void
  onDelete: (theme: SavedTheme) => void
  onCreateNew: () => void
  onRefresh: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/20">
              <Palette className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-zinc-100 sm:text-lg">Theme Designer</h1>
              <p className="text-[11px] text-zinc-500 hidden sm:block">
                Buat dan kelola tema tampilan untuk MasjidScreen
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={onCreateNew}
              className="h-8 gap-1.5 bg-amber-600 text-white text-xs hover:bg-amber-700"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Buat Tema</span>
              <span className="sm:hidden">Baru</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-5xl p-4 sm:p-6">
          {loading && themes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400/50" />
              <p className="mt-3 text-sm text-zinc-500">Memuat tema...</p>
            </div>
          ) : themes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800">
                <Paintbrush className="h-8 w-8 text-zinc-700" />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-zinc-400">Belum Ada Tema</h2>
              <p className="mt-1 max-w-sm text-xs text-zinc-600">
                Buat tema pertama Anda untuk mengkustomisasi tampilan MasjidScreen
              </p>
              <Button
                onClick={onCreateNew}
                className="mt-4 h-9 gap-2 bg-amber-600 text-white text-xs hover:bg-amber-700"
              >
                <Plus className="h-4 w-4" />
                Buat Tema Pertama
              </Button>
            </div>
          ) : (
            <>
              {/* Theme count */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                  {themes.length} tema tersimpan
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-zinc-800 text-[10px] text-zinc-500">
                    <Eye className="mr-1 h-2.5 w-2.5" />
                    {themes.filter((t) => t.isPublic).length} publik
                  </Badge>
                </div>
              </div>

              {/* Theme Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {themes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    onEdit={() => onEdit(theme)}
                    onDuplicate={() => onDuplicate(theme)}
                    onDelete={() => onDelete(theme)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function ThemeCard({
  theme,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  theme: SavedTheme
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  return (
    <div className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-all hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20">
      {/* Preview */}
      <div className="p-3 pb-2">
        <MiniPreview config={theme} />
      </div>

      {/* Info */}
      <div className="px-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-zinc-200">
              {theme.name || 'Tanpa Nama'}
            </h3>
            {theme.description && (
              <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                {theme.description}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className="border-zinc-800 text-[10px] text-zinc-400"
          >
            {theme.category}
          </Badge>
          <Badge
            variant="outline"
            className="border-zinc-800 text-[10px] text-zinc-400"
          >
            <Layout className="mr-1 h-2.5 w-2.5" />
            {LAYOUT_LABELS[theme.layout]}
          </Badge>
          {theme.isPublic && (
            <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-400">
              Publik
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-7 flex-1 gap-1 text-[11px] text-zinc-400 hover:text-amber-400"
          >
            <Paintbrush className="h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="h-7 gap-1 text-[11px] text-zinc-400 hover:text-blue-400"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-7 gap-1 text-[11px] text-zinc-400 hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// THEME EDITOR VIEW
// ============================================================

function ThemeEditorView({
  initialConfig,
  isNew,
  onSave,
  onCancel,
  onExportJSON,
  onImportJSON,
}: {
  initialConfig: ThemeConfig
  isNew: boolean
  onSave: (config: ThemeConfig) => Promise<void>
  onCancel: () => void
  onExportJSON: (config: ThemeConfig) => void
  onImportJSON: () => void
}) {
  const [config, setConfig] = useState<ThemeConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  const update = useCallback(<K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    if (!config.name.trim()) {
      toast.error('Nama tema wajib diisi')
      return
    }
    setSaving(true)
    try {
      await onSave(config)
      toast.success(isNew ? 'Tema berhasil dibuat!' : 'Tema berhasil disimpan!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan tema'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }, [config, isNew, onSave])

  const handleExportJSON = useCallback(() => {
    onExportJSON(config)
  }, [config, onExportJSON])

  const handleImportJSON = useCallback(() => {
    importRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string)
        setConfig((prev) => ({ ...prev, ...json }))
        toast.success('Tema berhasil diimpor')
      } catch {
        toast.error('File JSON tidak valid')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  // Keyboard shortcut for save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave])

  const previewConfig = useMemo(() => config, [config])

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      {/* Editor Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-3 py-2 backdrop-blur-sm sm:px-4 sm:py-2.5">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-zinc-200">
              {isNew ? 'Buat Tema Baru' : 'Edit Tema'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Hidden file input for import */}
          <input
            ref={importRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImportJSON}
            className="h-7 gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 sm:h-8 sm:text-[11px]"
          >
            <Upload className="h-3 w-3" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportJSON}
            className="h-7 gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 sm:h-8 sm:text-[11px]"
          >
            <Download className="h-3 w-3" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Separator orientation="vertical" className="mx-1 h-5 bg-zinc-800" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullscreen(true)}
            className="h-7 gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 sm:h-8 sm:text-[11px]"
          >
            <Maximize2 className="h-3 w-3" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-7 gap-1 bg-amber-600 px-3 text-[11px] text-white hover:bg-amber-700 sm:h-8 sm:px-4"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="hidden sm:inline">Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Simpan</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Controls */}
        <div className="w-full overflow-y-auto md:w-[40%] lg:w-[38%] border-r border-zinc-800">
          <div className="p-3 sm:p-4">
            <Accordion
              type="multiple"
              defaultValue={[
                'info', 'background', 'colors', 'cards', 'clock', 'fonts',
              ]}
              className="w-full"
            >
              {/* ─── Info & Kategori ─── */}
              <AccordionItem value="info" className="border-zinc-800">
                <AccordionTrigger className="text-zinc-300 hover:no-underline">
                  <SectionLabel icon={<Sparkles className="h-3.5 w-3.5 text-amber-400" />}>
                    Info & Kategori
                  </SectionLabel>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-zinc-400">Nama Tema</Label>
                    <Input
                      value={config.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="Contoh: Dark Gold Premium"
                      className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-zinc-400">Deskripsi</Label>
                    <Textarea
                      value={config.description}
                      onChange={(e) => update('description', e.target.value)}
                      placeholder="Deskripsi singkat tema..."
                      rows={2}
                      className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-zinc-400">Kategori</Label>
                    <Select
                      value={config.category}
                      onValueChange={(v) => update('category', v as ThemeConfig['category'])}
                    >
                      <SelectTrigger className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-700 bg-zinc-900">
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="layout">Layout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-medium text-zinc-400">Publik</Label>
                    <Switch
                      checked={config.isPublic}
                      onCheckedChange={(v) => update('isPublic', v)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ─── Layout ─── */}
              <AccordionItem value="layout" className="border-zinc-800">
                <AccordionTrigger className="text-zinc-300 hover:no-underline">
                  <SectionLabel icon={<Layout className="h-3.5 w-3.5 text-amber-400" />}>
                    Layout
                  </SectionLabel>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-zinc-400">Tipe Layout</Label>
                    <Select
                      value={config.layout}
                      onValueChange={(v) => update('layout', v as ThemeConfig['layout'])}
                    >
                      <SelectTrigger className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-700 bg-zinc-900">
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="nabawi">Nabawi</SelectItem>
                        <SelectItem value="makkah">Makkah</SelectItem>
                        <SelectItem value="cordoba">Cordoba</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Layout visual options */}
                  <div className="grid grid-cols-2 gap-2">
                    {(['default', 'nabawi', 'makkah', 'cordoba'] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => update('layout', l)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-all ${
                          config.layout === l
                            ? 'border-amber-500/50 bg-amber-500/10'
                            : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex h-10 w-14 items-center justify-center rounded border border-zinc-700/50 bg-zinc-800">
                          {l === 'default' && (
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="h-1 w-10 rounded-sm bg-zinc-600" />
                              <div className="h-1.5 w-6 rounded-sm bg-amber-500/50" />
                              <div className="h-1 w-10 rounded-sm bg-zinc-600" />
                            </div>
                          )}
                          {l === 'nabawi' && (
                            <div className="flex items-center gap-0.5">
                              <div className="flex flex-col items-center gap-0.5">
                                <div className="h-1.5 w-6 rounded-sm bg-amber-500/50" />
                                <div className="h-1 w-4 rounded-sm bg-zinc-600" />
                              </div>
                              <div className="h-6 w-px bg-zinc-600" />
                              <div className="flex flex-col gap-0.5">
                                <div className="h-1 w-3 rounded-sm bg-zinc-600" />
                                <div className="h-1 w-3 rounded-sm bg-zinc-600" />
                                <div className="h-1 w-3 rounded-sm bg-zinc-600" />
                              </div>
                            </div>
                          )}
                          {l === 'makkah' && (
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="flex gap-0.5">
                                <div className="h-1.5 w-2 rounded-sm bg-zinc-600" />
                                <div className="h-1.5 w-2 rounded-sm bg-zinc-600" />
                                <div className="h-1.5 w-2 rounded-sm bg-zinc-600" />
                              </div>
                              <div className="h-1.5 w-8 rounded-sm bg-amber-500/50" />
                              <div className="h-1 w-10 rounded-sm bg-zinc-600" />
                            </div>
                          )}
                          {l === 'cordoba' && (
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="h-1 w-10 rounded-sm bg-zinc-600" />
                              <div className="h-1.5 w-6 rounded-sm bg-amber-500/50" />
                              <div className="flex gap-1">
                                <div className="h-2 w-2 rounded-full bg-zinc-600" />
                                <div className="h-2 w-2 rounded-full bg-zinc-600" />
                                <div className="h-2 w-2 rounded-full bg-zinc-600" />
                              </div>
                            </div>
                          )}
                        </div>
                        <span className={`text-[10px] font-medium ${config.layout === l ? 'text-amber-400' : 'text-zinc-500'}`}>
                          {LAYOUT_LABELS[l]}
                        </span>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ─── Background ─── */}
              <AccordionItem value="background" className="border-zinc-800">
                <AccordionTrigger className="text-zinc-300 hover:no-underline">
                  <SectionLabel icon={<Image className="h-3.5 w-3.5 text-amber-400" />}>
                    Background
                  </SectionLabel>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-zinc-400">Tipe Background</Label>
                    <Select
                      value={config.bgType}
                      onValueChange={(v) => update('bgType', v as ThemeConfig['bgType'])}
                    >
                      <SelectTrigger className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-700 bg-zinc-900">
                        <SelectItem value="gradient">Gradient</SelectItem>
                        <SelectItem value="solid">Solid Color</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {config.bgType === 'gradient' && (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-zinc-400">CSS Gradient</Label>
                        <Textarea
                          value={config.bgGradient}
                          onChange={(e) => update('bgGradient', e.target.value)}
                          rows={2}
                          className="border-zinc-700 bg-zinc-800 text-xs font-mono text-zinc-200 resize-none"
                        />
                      </div>
                      {/* Preset Gradients */}
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-zinc-400">Preset Gradient</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {PRESET_GRADIENTS.map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => update('bgGradient', preset.value)}
                              className={`group flex items-center gap-2 rounded-lg border p-2 transition-all ${
                                config.bgGradient === preset.value
                                  ? 'border-amber-500/50 bg-amber-500/10'
                                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                              }`}
                            >
                              <div
                                className="h-6 w-6 shrink-0 rounded border border-zinc-700/50"
                                style={{ background: preset.value }}
                              />
                              <span className="truncate text-[10px] text-zinc-400 group-hover:text-zinc-300">
                                {preset.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {config.bgType === 'solid' && (
                    <ColorInput
                      label="Warna Background"
                      value={config.bgSolidColor}
                      onChange={(v) => update('bgSolidColor', v)}
                    />
                  )}

                  {config.bgType === 'image' && (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-zinc-400">URL Gambar</Label>
                        <Input
                          value={config.bgImageUrl}
                          onChange={(e) => update('bgImageUrl', e.target.value)}
                          placeholder="https://example.com/bg.jpg"
                          className="border-zinc-700 bg-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600"
                        />
                      </div>
                      <SliderField
                        label="Opasitas Gambar"
                        value={config.bgImageOpacity}
                        onChange={(v) => update('bgImageOpacity', v)}
                        min={0}
                        max={100}
                        unit="%"
                      />
                    </>
                  )}

                  {/* Light/Dark mode toggle */}
                  <Separator className="bg-zinc-800" />
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-medium text-zinc-400">Mode Terang (Light)</Label>
                    <Switch
                      checked={config.isLight}
                      onCheckedChange={(v) => update('isLight', v)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ─── Warna Utama ─── */}
              <AccordionItem value="colors" className="border-zinc-800">
                <AccordionTrigger className="text-zinc-300 hover:no-underline">
                  <SectionLabel icon={<Palette className="h-3.5 w-3.5 text-amber-400" />}>
                    Warna Utama
                  </SectionLabel>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <ColorInput
                    label="Accent Gold"
                    value={config.accentGold}
                    onChange={(v) => update('accentGold', v)}
                  />
                  <ColorInput
                    label="Accent Light"
                    value={config.accentLight}
                    onChange={(v) => update('accentLight', v)}
                  />
                  <ColorInput
                    label="Text Primary"
                    value={config.textPrimary}
                    onChange={(v) => update('textPrimary', v)}
                  />
                  <ColorInput
                    label="Text Muted"
                    value={config.textMuted}
                    onChange={(v) => update('textMuted', v)}
                  />
                  <ColorInput
                    label="Text Card"
                    value={config.textCard}
                    onChange={(v) => update('textCard', v)}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* ─── Header & Footer ─── */}
              <AccordionItem value="header-footer" className="border-zinc-800">
                <AccordionTrigger className="text-zinc-300 hover:no-underline">
                  <SectionLabel icon={<Layers className="h-3.5 w-3.5 text-amber-400" />}>
                    Header & Footer
                  </SectionLabel>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <ColorInput
                    label="Header Background"
                    value={config.headerBg}
                    onChange={(v) => update('headerBg', v)}
                  />
                  <ColorInput
                    label="Header Border"
                    value={config.headerBorder}
                    onChange={(v) => update('headerBorder', v)}
                  />
                  <ColorInput
                    label="Footer Background"
                    value={config.footerBg}
                    onChange={(v) => update('footerBg', v)}
                  />
                  <ColorInput
                    label="Footer Border"
                    value={config.footerBorder}
                    onChange={(v) => update('footerBorder', v)}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* ─── Card Shalat ─── */}
              <AccordionItem value="cards" className="border-zinc-800">
                <AccordionTrigger className="text-zinc-300 hover:no-underline">
                  <SectionLabel icon={<Layers className="h-3.5 w-3.5 text-amber-400" />}>
                    Card Shalat
                  </SectionLabel>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <ColorInput
                    label="Card Background"
                    value={config.cardBg}
                    onChange={(v) => update('cardBg', v)}
                  />
                  <ColorInput
                    label="Card Border"
                    value={config.cardBorder}
                    onChange={(v) => update('cardBorder', v)}
                  />
                  <ColorInput
                    label="Highlight Background"
                    value={config.cardHighlightBg}
                    onChange={(v) => update('cardHighlightBg', v)}
                  />
                  <ColorInput
                    label="Highlight Border"
                    value={config.cardHighlightBorder}
                    onChange={(v) => update('cardHighlightBorder', v)}
                  />
                  <ColorInput
                    label="Card Text Color"
                    value={config.cardTextColor}
                    onChange={(v) => update('cardTextColor', v)}
                  />
                  <SliderField
                    label="Card Font Size"
                    value={config.cardFontSize}
                    onChange={(v) => update('cardFontSize', v)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    unit="rem"
                  />
                </AccordionContent>
              </AccordionItem>

              {/* ─── Text Berjalan ─── */}
              <AccordionItem value="running-text" className="border-zinc-800">
                <AccordionTrigger className="text-zinc-300 hover:no-underline">
                  <SectionLabel icon={<Type className="h-3.5 w-3.5 text-amber-400" />}>
                    Text Berjalan
                  </SectionLabel>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <ColorInput
                    label="Running Text Color"
                    value={config.runningTextColor}
                    onChange={(v) => update('runningTextColor', v)}
                  />
                  <ColorInput
                    label="Running Text Background"
                    value={config.runningTextBg}
                    onChange={(v) => update('runningTextBg', v)}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* ─── Jam (Clock) ─── */}
              <AccordionItem value="clock" className="border-zinc-800">
                <AccordionTrigger className="text-zinc-300 hover:no-underline">
                  <SectionLabel icon={<Clock className="h-3.5 w-3.5 text-amber-400" />}>
                    Jam (Clock)
                  </SectionLabel>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-zinc-400">Tipe Jam</Label>
                    <Select
                      value={config.clockType}
                      onValueChange={(v) => update('clockType', v as ThemeConfig['clockType'])}
                    >
                      <SelectTrigger className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-700 bg-zinc-900">
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="analog">Analog</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-zinc-400">Font Jam</Label>
                    <Select
                      value={config.clockFont}
                      onValueChange={(v) => update('clockFont', v)}
                    >
                      <SelectTrigger className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-700 bg-zinc-900">
                        {FONT_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <SliderField
                    label="Ukuran Jam"
                    value={config.clockSize}
                    onChange={(v) => update('clockSize', v)}
                    min={3}
                    max={12}
                    step={0.5}
                    unit="rem"
                  />
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-zinc-400">Gaya Jam</Label>
                    <Select
                      value={config.clockStyle}
                      onValueChange={(v) => update('clockStyle', v as ThemeConfig['clockStyle'])}
                    >
                      <SelectTrigger className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-700 bg-zinc-900">
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="retro">Retro</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-zinc-400">Animasi Jam</Label>
                    <Select
                      value={config.clockAnimation}
                      onValueChange={(v) => update('clockAnimation', v)}
                    >
                      <SelectTrigger className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-700 bg-zinc-900">
                        {CLOCK_ANIMATION_OPTIONS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ─── Font & Ukuran ─── */}
              <AccordionItem value="fonts" className="border-zinc-800">
                <AccordionTrigger className="text-zinc-300 hover:no-underline">
                  <SectionLabel icon={<Type className="h-3.5 w-3.5 text-amber-400" />}>
                    Font & Ukuran
                  </SectionLabel>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-zinc-400">Font Nama Masjid</Label>
                    <Select
                      value={config.mosqueNameFont}
                      onValueChange={(v) => update('mosqueNameFont', v)}
                    >
                      <SelectTrigger className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-700 bg-zinc-900">
                        {FONT_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <SliderField
                    label="Ukuran Nama Masjid"
                    value={config.mosqueNameSize}
                    onChange={(v) => update('mosqueNameSize', v)}
                    min={0.5}
                    max={3}
                    step={0.05}
                    unit="rem"
                  />
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-zinc-400">Font Tanggal</Label>
                    <Select
                      value={config.dateFont}
                      onValueChange={(v) => update('dateFont', v)}
                    >
                      <SelectTrigger className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-700 bg-zinc-900">
                        {FONT_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <SliderField
                    label="Ukuran Tanggal"
                    value={config.dateSize}
                    onChange={(v) => update('dateSize', v)}
                    min={0.4}
                    max={2}
                    step={0.05}
                    unit="rem"
                  />
                  <ColorInput
                    label="Warna Tanggal"
                    value={config.dateColor}
                    onChange={(v) => update('dateColor', v)}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* ─── Tampilan Adzan ─── */}
              <AccordionItem value="adhan" className="border-zinc-800">
                <AccordionTrigger className="text-zinc-300 hover:no-underline">
                  <SectionLabel icon={<Sparkles className="h-3.5 w-3.5 text-amber-400" />}>
                    Tampilan Adzan
                  </SectionLabel>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-zinc-400">Gaya Adzan</Label>
                    <Select
                      value={config.adhanStyle}
                      onValueChange={(v) => update('adhanStyle', v as ThemeConfig['adhanStyle'])}
                    >
                      <SelectTrigger className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-700 bg-zinc-900">
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="themed">Themed (Custom)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {config.adhanStyle === 'themed' && (
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-zinc-400">Custom Gradient Adzan</Label>
                      <Textarea
                        value={config.adhanBgGradient}
                        onChange={(e) => update('adhanBgGradient', e.target.value)}
                        rows={2}
                        className="border-zinc-700 bg-zinc-800 text-xs font-mono text-zinc-200 resize-none"
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* ─── Tampilan Iqomah ─── */}
              <AccordionItem value="iqomah" className="border-zinc-800">
                <AccordionTrigger className="text-zinc-300 hover:no-underline">
                  <SectionLabel icon={<Clock className="h-3.5 w-3.5 text-amber-400" />}>
                    Tampilan Iqomah
                  </SectionLabel>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-zinc-400">Font Iqomah</Label>
                    <Select
                      value={config.iqomahFont}
                      onValueChange={(v) => update('iqomahFont', v)}
                    >
                      <SelectTrigger className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-700 bg-zinc-900">
                        {FONT_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <SliderField
                    label="Ukuran Iqomah"
                    value={config.iqomahSize}
                    onChange={(v) => update('iqomahSize', v)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    unit="rem"
                  />
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-zinc-400">Animasi Iqomah</Label>
                    <Select
                      value={config.iqomahAnimation}
                      onValueChange={(v) => update('iqomahAnimation', v)}
                    >
                      <SelectTrigger className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-700 bg-zinc-900">
                        {IQOMAH_ANIMATION_OPTIONS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="hidden flex-1 flex-col overflow-hidden bg-zinc-900/50 md:flex lg:flex">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <LivePreview config={previewConfig} />
          </div>
        </div>
      </div>

      {/* Mobile: Preview toggle bar */}
      <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 p-2 md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFullscreen(true)}
          className="w-full gap-2 text-[11px] text-zinc-400 hover:text-amber-400"
        >
          <Eye className="h-3.5 w-3.5" />
          Lihat Preview Penuh
        </Button>
      </div>

      {/* Fullscreen Preview Dialog */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="flex h-[90vh] max-w-6xl flex-col border-zinc-800 bg-zinc-950 p-0">
          <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-zinc-800 px-4 py-2">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-amber-400" />
              <DialogTitle className="text-sm text-zinc-200">Preview Penuh — {config.name || 'Untitled'}</DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              Preview tema dalam mode layar penuh
            </DialogDescription>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFullscreen(false)}
              className="h-7 w-7 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex flex-1 items-center justify-center overflow-hidden bg-black p-4 sm:p-8">
            <div className="relative w-full max-w-4xl">
              <LivePreview config={previewConfig} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ThemeDesigner() {
  const [view, setView] = useState<'list' | 'editor'>('list')
  const [themes, setThemes] = useState<SavedTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTheme, setEditingTheme] = useState<ThemeConfig | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isNewTheme, setIsNewTheme] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingTheme, setDeletingTheme] = useState<SavedTheme | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ─── Fetch themes ───
  const fetchThemes = useCallback(async () => {
    try {
      const res = await fetch('/api/themes', {
        headers: apiHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil tema')
      setThemes(Array.isArray(data) ? data : data.themes || [])
    } catch (err) {
      console.error('Fetch themes error:', err)
      toast.error('Gagal memuat tema')
    }
  }, [])

  useEffect(() => {
    fetchThemes().finally(() => setLoading(false))
  }, [fetchThemes])

  // ─── Create new theme ───
  const handleCreateNew = useCallback(() => {
    setEditingTheme({ ...DEFAULT_THEME_CONFIG, name: '', description: '' })
    setEditingId(null)
    setIsNewTheme(true)
    setView('editor')
  }, [])

  // ─── Edit theme ───
  const handleEdit = useCallback((theme: SavedTheme) => {
    setEditingTheme({ ...theme })
    setEditingId(theme.id)
    setIsNewTheme(false)
    setView('editor')
  }, [])

  // ─── Duplicate theme ───
  const handleDuplicate = useCallback(async (theme: SavedTheme) => {
    const { id, createdAt, updatedAt, ...rest } = theme
    const duplicated = {
      ...rest,
      name: `${theme.name} (Copy)`,
    }
    try {
      const res = await fetch('/api/themes', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify(duplicated),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menduplikasi')
      toast.success(`Tema "${duplicated.name}" berhasil diduplikasi`)
      fetchThemes()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menduplikasi'
      toast.error(msg)
    }
  }, [fetchThemes])

  // ─── Delete theme ───
  const handleDeleteConfirm = useCallback(() => {
    if (!deletingTheme) return
    setDeleteLoading(true)
    fetch(`/api/themes/${deletingTheme.id}`, {
      method: 'DELETE',
      headers: apiHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok && data.error) throw new Error(data.error)
        toast.success(`Tema "${deletingTheme.name}" berhasil dihapus`)
        fetchThemes()
        setDeleteDialogOpen(false)
        setDeletingTheme(null)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Gagal menghapus'
        toast.error(msg)
      })
      .finally(() => setDeleteLoading(false))
  }, [deletingTheme, fetchThemes])

  const handleDeleteClick = useCallback((theme: SavedTheme) => {
    setDeletingTheme(theme)
    setDeleteDialogOpen(true)
  }, [])

  // ─── Save theme ───
  const handleSave = useCallback(async (config: ThemeConfig): Promise<void> => {
    if (isNewTheme) {
      const res = await fetch('/api/themes', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal membuat tema')
      // Update editing state to existing theme
      if (data.id) {
        setEditingId(data.id)
        setIsNewTheme(false)
      }
      fetchThemes()
    } else if (editingId) {
      const res = await fetch(`/api/themes/${editingId}`, {
        method: 'PUT',
        headers: apiHeaders(),
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan tema')
      fetchThemes()
    } else {
      throw new Error('Tema tidak valid')
    }
  }, [isNewTheme, editingId, fetchThemes])

  // ─── Export/Import JSON ───
  const handleExportJSON = useCallback((config: ThemeConfig) => {
    try {
      const json = JSON.stringify(config, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `theme-${config.name || 'untitled'}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Tema berhasil diekspor sebagai JSON')
    } catch {
      toast.error('Gagal mengekspor tema')
    }
  }, [])

  // ─── Cancel edit ───
  const handleCancel = useCallback(() => {
    setView('list')
    setEditingTheme(null)
    setEditingId(null)
  }, [])

  // ─── Refresh ───
  const handleRefresh = useCallback(async () => {
    setLoading(true)
    await fetchThemes()
    setLoading(false)
    toast.success('Daftar tema diperbarui')
  }, [fetchThemes])

  // ─── Render ───
  if (view === 'editor' && editingTheme) {
    return (
      <ThemeEditorView
        initialConfig={editingTheme}
        isNew={isNewTheme}
        onSave={handleSave}
        onCancel={handleCancel}
        onExportJSON={handleExportJSON}
        onImportJSON={() => {}}
      />
    )
  }

  return (
    <>
      <ThemeListView
        themes={themes}
        loading={loading}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDeleteClick}
        onCreateNew={handleCreateNew}
        onRefresh={handleRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400">Hapus Tema?</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Tema <strong className="text-zinc-300">&quot;{deletingTheme?.name || 'Tanpa Nama'}&quot;</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
              className="text-zinc-400"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Hapus Permanen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
