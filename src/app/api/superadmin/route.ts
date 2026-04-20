import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Superadmin credentials
const SUPERADMIN_USERNAME = 'admin'
const SUPERADMIN_PASSWORD = 'sayaadmin123'

function authenticateSuperadmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  // Support both Bearer token and Basic auth
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    return token === `superadmin:${SUPERADMIN_PASSWORD}`
  }

  if (authHeader.startsWith('Basic ')) {
    const decoded = atob(authHeader.slice(6))
    const [username, password] = decoded.split(':')
    return username === SUPERADMIN_USERNAME && password === SUPERADMIN_PASSWORD
  }

  return false
}

// POST /api/superadmin - Login
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (username !== SUPERADMIN_USERNAME || password !== SUPERADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      token: `superadmin:${SUPERADMIN_PASSWORD}`,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// GET /api/superadmin - List all screens with details
export async function GET(request: NextRequest) {
  if (!authenticateSuperadmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const { data: screens, error } = await supabaseAdmin
      .from('screens')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase select error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform snake_case to camelCase for frontend
    const result = (screens || []).map(s => ({
      id: s.id,
      password: s.password,
      ownerName: s.owner_name,
      mosqueName: s.mosque_name,
      config: s.config,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }))

    return NextResponse.json({ screens: result })
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// PATCH /api/superadmin - Update device (password, ownerName, mosqueName)
export async function PATCH(request: NextRequest) {
  if (!authenticateSuperadmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const { id, password, ownerName, mosqueName } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID perangkat wajib diisi' }, { status: 400 })
    }

    // Check if screen exists
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('screens')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Perangkat tidak ditemukan' }, { status: 404 })
    }

    // Build update data
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (password) updateData.password = password
    if (ownerName !== undefined) updateData.owner_name = ownerName
    if (mosqueName !== undefined) updateData.mosque_name = mosqueName

    // If mosqueName changed, also update config
    if (mosqueName !== undefined && existing.config) {
      const currentConfig = existing.config as Record<string, unknown>
      currentConfig.mosqueName = mosqueName
      updateData.config = currentConfig
    }

    const { error } = await supabaseAdmin
      .from('screens')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `Perangkat ${id} berhasil diubah` })
  } catch (err) {
    console.error('Update screen error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// DELETE /api/superadmin?id=xxx - Delete a device
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
      return NextResponse.json({ error: 'ID perangkat wajib diisi' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('screens')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `Perangkat ${id} berhasil dihapus` })
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
