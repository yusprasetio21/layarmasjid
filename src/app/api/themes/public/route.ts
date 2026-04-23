import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { StoredTheme } from '../route'

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

// ─── GET /api/themes/public — List all public themes (no auth) ─────────

export async function GET() {
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

    // Filter to only public themes that parsed successfully
    const themes = results
      .filter((t): t is StoredTheme => t !== null && t.isPublic === true)

    // Sort by updatedAt descending (newest first)
    themes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return NextResponse.json({ themes })
  } catch (err) {
    console.error('List public themes error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
