import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const TABLE_NAME = 'custom_themes'

// Superadmin auth check
function authenticateSuperadmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    return token === 'superadmin:sayaadmin123'
  }
  return false
}

// GET /api/themes - List all themes (public read for preview)
export async function GET(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase select error:', error)
      // Table might not exist yet
      if (error.code === '42P01') {
        return NextResponse.json({ themes: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ themes: data || [] })
  } catch (err) {
    console.error('Get themes error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// POST /api/themes - Create new theme (superadmin only)
export async function POST(request: NextRequest) {
  if (!authenticateSuperadmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { name, description, config, thumbnail_url, is_active } = body

    if (!name || !config) {
      return NextResponse.json({ error: 'Nama dan config wajib diisi' }, { status: 400 })
    }

    // Try to create table if not exists
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          name TEXT NOT NULL,
          description TEXT DEFAULT '',
          config JSONB NOT NULL DEFAULT '{}'::jsonb,
          thumbnail_url TEXT DEFAULT '',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE ${TABLE_NAME} ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Themes are publicly readable" ON ${TABLE_NAME} FOR SELECT USING (true);
        CREATE POLICY "Superadmin can manage themes" ON ${TABLE_NAME} FOR ALL USING (true) WITH CHECK (true);
      `
    }).catch(() => {
      // Ignore - table likely already exists or rpc not available
    })

    const id = body.id || `theme_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

    const { data, error } = await supabaseAdmin
      .from(TABLE_NAME)
      .insert({
        id,
        name,
        description: description || '',
        config,
        thumbnail_url: thumbnail_url || '',
        is_active: is_active !== false,
      })
      .select()
      .single()

    if (error) {
      console.error('Insert theme error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ theme: data })
  } catch (err) {
    console.error('Create theme error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// PUT /api/themes - Update theme (superadmin only)
export async function PUT(request: NextRequest) {
  if (!authenticateSuperadmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { id, name, description, config, thumbnail_url, is_active } = body

    if (!id) {
      return NextResponse.json({ error: 'ID tema wajib diisi' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (config !== undefined) updateData.config = config
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error } = await supabaseAdmin
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update theme error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ theme: data })
  } catch (err) {
    console.error('Update theme error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// DELETE /api/themes?id=xxx - Delete theme (superadmin only)
export async function DELETE(request: NextRequest) {
  if (!authenticateSuperadmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID tema wajib diisi' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from(TABLE_NAME)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete theme error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Tema berhasil dihapus' })
  } catch (err) {
    console.error('Delete theme error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
