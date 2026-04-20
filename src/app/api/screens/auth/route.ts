import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/screens/auth - Authenticate with screen ID + password
export async function POST(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const { id, password } = await request.json()

    if (!id || !password) {
      return NextResponse.json({ error: 'ID dan password wajib diisi' }, { status: 400 })
    }

    const { data: screen, error } = await supabaseAdmin
      .from('screens')
      .select('id, password, config')
      .eq('id', id)
      .single()

    if (error || !screen) {
      return NextResponse.json({ error: 'ID atau password salah' }, { status: 401 })
    }

    if (screen.password !== password) {
      return NextResponse.json({ error: 'ID atau password salah' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      screen: {
        id: screen.id,
        config: screen.config,
      },
    })
  } catch (err) {
    console.error('Auth error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
