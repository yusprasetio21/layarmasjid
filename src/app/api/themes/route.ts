import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// ─── Auth ───────────────────────────────────────────────────────────────

function authenticateSuperadmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    return token === 'superadmin:sayaadmin123'
  }
  return false
}

// ─── Types ──────────────────────────────────────────────────────────────

export interface ThemeConfig {
  // Identity
  name: string
  description: string
  category: 'dark' | 'light' | 'layout'
  isPublic: boolean

  // Layout
  layout: 'default' | 'nabawi' | 'makkah' | 'cordoba'

  // Background
  bgType: 'gradient' | 'solid' | 'image'
  bgGradient: string
  bgSolidColor: string
  bgImageUrl: string
  bgImageOpacity: number

  // Theme type
  isLight: boolean

  // Colors
  accentGold: string
  accentLight: string
  textPrimary: string
  textMuted: string
  textCard: string

  // Header/Footer
  headerBg: string
  headerBorder: string
  footerBg: string
  footerBorder: string

  // Prayer cards
  cardBg: string
  cardBorder: string
  cardHighlightBg: string
  cardHighlightBorder: string
  cardTextColor: string
  cardFontSize: number

  // Running text
  runningTextColor: string
  runningTextBg: string

  // Clock
  clockType: 'digital' | 'analog'
  clockFont: string
  clockSize: number
  clockStyle: 'default' | 'retro' | 'minimal'
  clockAnimation: string

  // Fonts
  mosqueNameFont: string
  mosqueNameSize: number
  dateFont: string
  dateSize: number
  dateColor: string

  // Adhan
  adhanStyle: 'dark' | 'light' | 'themed'
  adhanBgGradient: string

  // Iqomah
  iqomahFont: string
  iqomahSize: number
  iqomahAnimation: string

  // Preview
  previewImage: string
}

export interface StoredTheme extends ThemeConfig {
  id: string
  createdAt: string
  updatedAt: string
}

// ─── Defaults ───────────────────────────────────────────────────────────

const DEFAULT_THEME: ThemeConfig = {
  name: 'Default Theme',
  description: '',
  category: 'dark',
  isPublic: false,
  layout: 'default',
  bgType: 'gradient',
  bgGradient: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
  bgSolidColor: '#0f2027',
  bgImageUrl: '',
  bgImageOpacity: 0.3,
  isLight: false,
  accentGold: '#d4af37',
  accentLight: '#f5e6c8',
  textPrimary: '#ffffff',
  textMuted: '#a0aec0',
  textCard: '#ffffff',
  headerBg: 'rgba(0, 0, 0, 0.4)',
  headerBorder: 'rgba(212, 175, 55, 0.3)',
  footerBg: 'rgba(0, 0, 0, 0.4)',
  footerBorder: 'rgba(212, 175, 55, 0.3)',
  cardBg: 'rgba(255, 255, 255, 0.1)',
  cardBorder: 'rgba(212, 175, 55, 0.2)',
  cardHighlightBg: 'rgba(212, 175, 55, 0.15)',
  cardHighlightBorder: 'rgba(212, 175, 55, 0.5)',
  cardTextColor: '#ffffff',
  cardFontSize: 14,
  runningTextColor: '#d4af37',
  runningTextBg: 'rgba(0, 0, 0, 0.6)',
  clockType: 'digital',
  clockFont: "'Amiri', serif",
  clockSize: 48,
  clockStyle: 'default',
  clockAnimation: 'none',
  mosqueNameFont: "'Amiri', serif",
  mosqueNameSize: 32,
  dateFont: "'Amiri', serif",
  dateSize: 16,
  dateColor: '#d4af37',
  adhanStyle: 'dark',
  adhanBgGradient: 'linear-gradient(135deg, #1a1a2e, #16213e)',
  iqomahFont: "'Amiri', serif",
  iqomahSize: 24,
  iqomahAnimation: 'none',
  previewImage: '',
}

// ─── Helpers ────────────────────────────────────────────────────────────

const BUCKET = 'themes-data'

async function downloadAndParseTheme(fileName: string): Promise<StoredTheme | null> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(fileName)

  if (error) {
    console.error(`Failed to download ${fileName}:`, error.message)
    return null
  }

  try {
    const text = await data.text()
    return JSON.parse(text) as StoredTheme
  } catch (parseErr) {
    console.error(`Failed to parse ${fileName}:`, parseErr)
    return null
  }
}

// ─── GET /api/themes — List all themes (superadmin only) ────────────────

export async function GET(request: NextRequest) {
  if (!authenticateSuperadmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const { data: files, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .list('', { limit: 100 })

    if (error) {
      console.error('Supabase storage list error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ themes: [] })
    }

    // Filter for JSON files only
    const jsonFiles = files.filter(f => f.name.endsWith('.json'))

    // Download and parse all theme files concurrently
    const results = await Promise.all(
      jsonFiles.map(f => downloadAndParseTheme(f.name))
    )

    // Filter out any nulls (failed downloads/parses)
    const themes = results.filter((t): t is StoredTheme => t !== null)

    // Sort by updatedAt descending (newest first)
    themes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return NextResponse.json({ themes })
  } catch (err) {
    console.error('List themes error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// ─── POST /api/themes — Create a new theme (superadmin only) ───────────

export async function POST(request: NextRequest) {
  if (!authenticateSuperadmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { name, description, category, config, ...rest } = body

    if (!name) {
      return NextResponse.json({ error: 'Nama tema wajib diisi' }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: 'Kategori tema wajib diisi' }, { status: 400 })
    }

    // Generate unique ID
    const id = `theme_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

    const now = new Date().toISOString()

    // Merge defaults with provided body fields
    // Support both flat fields and nested `config` object from the old format
    const configFields = config && typeof config === 'object' ? config : {}
    const themeData: StoredTheme = {
      ...DEFAULT_THEME,
      ...configFields,
      ...rest,
      id,
      name,
      description: description || '',
      category,
      isPublic: body.isPublic !== undefined ? body.isPublic : (configFields as Record<string, unknown>).isPublic !== undefined ? (configFields as Record<string, unknown>).isPublic as boolean : false,
      createdAt: now,
      updatedAt: now,
    }

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(id + '.json', JSON.stringify(themeData, null, 2), {
        contentType: 'application/json',
        upsert: true,
      })

    if (error) {
      console.error('Supabase storage upload error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ theme: themeData }, { status: 201 })
  } catch (err) {
    console.error('Create theme error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
