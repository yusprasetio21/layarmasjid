import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { StoredTheme } from '../route'

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

// ─── Helpers ────────────────────────────────────────────────────────────

const BUCKET = 'themes-data'

async function getThemeById(id: string): Promise<StoredTheme | null> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(id + '.json')

  if (error) {
    // 404-style: object not found
    if (error.message.includes('Not Found') || error.message.includes('not found') || error.message.includes('The resource was not found')) {
      return null
    }
    console.error(`Failed to download theme ${id}:`, error.message)
    return null
  }

  try {
    const text = await data.text()
    return JSON.parse(text) as StoredTheme
  } catch (parseErr) {
    console.error(`Failed to parse theme ${id}:`, parseErr)
    return null
  }
}

// ─── GET /api/themes/[id] — Get a single theme (public, no auth) ──────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const { id } = await params

    const theme = await getThemeById(id)

    if (!theme) {
      return NextResponse.json({ error: 'Tema tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ theme })
  } catch (err) {
    console.error('Get theme error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// ─── PUT /api/themes/[id] — Update a theme (superadmin only) ───────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authenticateSuperadmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    // Check if theme exists
    const existing = await getThemeById(id)

    if (!existing) {
      return NextResponse.json({ error: 'Tema tidak ditemukan' }, { status: 404 })
    }

    // Merge: spread existing, then overwrite with new fields
    // Keep id, createdAt immutable; update updatedAt
    const { id: _ignoredId, createdAt: _ignoredCreatedAt, updatedAt: _ignoredUpdatedAt, ...updateFields } = body
    void _ignoredId
    void _ignoredCreatedAt
    void _ignoredUpdatedAt

    const updatedTheme: StoredTheme = {
      ...existing,
      ...updateFields,
      id, // ensure id is preserved
      createdAt: existing.createdAt, // ensure createdAt is preserved
      updatedAt: new Date().toISOString(),
    }

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(id + '.json', JSON.stringify(updatedTheme, null, 2), {
        contentType: 'application/json',
        upsert: true,
      })

    if (error) {
      console.error('Supabase storage upload error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ theme: updatedTheme })
  } catch (err) {
    console.error('Update theme error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// ─── DELETE /api/themes/[id] — Delete a theme (superadmin only) ────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authenticateSuperadmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const { id } = await params

    // Check if theme exists
    const existing = await getThemeById(id)

    if (!existing) {
      return NextResponse.json({ error: 'Tema tidak ditemukan' }, { status: 404 })
    }

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove([id + '.json'])

    if (error) {
      console.error('Supabase storage remove error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `Tema ${id} berhasil dihapus` })
  } catch (err) {
    console.error('Delete theme error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
