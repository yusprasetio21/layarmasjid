import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/screens/[id] - Get screen config
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const { id } = await params

    const { data: screen, error } = await supabaseAdmin
      .from('screens')
      .select('id, config, created_at')
      .eq('id', id)
      .single()

    if (error || !screen) {
      return NextResponse.json({ error: 'Screen tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ screen })
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// PATCH /api/screens/[id] - Update screen config or password
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    // If this is a config update
    if (body.config) {
      const { data: screen, error } = await supabaseAdmin
        .from('screens')
        .update({ config: body.config, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Supabase update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, screen })
    }

    // If this is a password change
    if (body.password) {
      const { error } = await supabaseAdmin
        .from('screens')
        .update({ password: body.password, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Supabase update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Tidak ada data untuk diupdate' }, { status: 400 })
  } catch (err) {
    console.error('Update screen error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
