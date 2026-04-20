import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'mosque-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// POST /api/upload - Upload image to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const deviceId = formData.get('deviceId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Format tidak didukung. Gunakan: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Ukuran file maksimal 5MB (file: ${(file.size / 1024 / 1024).toFixed(1)}MB)` },
        { status: 400 }
      )
    }

    // Generate unique file path: {deviceId}/{timestamp}.{ext}
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).slice(2, 6)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const folder = deviceId || 'default'
    const filePath = `${folder}/${timestamp}_${randomSuffix}.${ext}`

    // Upload file
    const arrayBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        cacheControl: '31536000', // 1 year cache
        upsert: true,
      })

    if (uploadError) {
      console.error('[Storage] Upload error:', uploadError.message)

      // Provide user-friendly error based on the error type
      const msg = uploadError.message.toLowerCase()
      if (msg.includes('not found') || msg.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Upload gagal: Bucket belum ada. Hubungi admin.' },
          { status: 503 }
        )
      }
      if (msg.includes('policy') || msg.includes('permission') || msg.includes('row-level security') || msg.includes('rls')) {
        return NextResponse.json(
          { error: 'Upload gagal: Belum punya akses. Hubungi admin.' },
          { status: 403 }
        )
      }

      return NextResponse.json({ error: `Upload gagal: ${uploadError.message}` }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uploadData.path)

    console.log(`[Storage] Uploaded: ${filePath} (${(file.size / 1024).toFixed(0)}KB)`)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: uploadData.path,
      size: file.size,
    })
  } catch (err) {
    console.error('[Storage] Upload exception:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// DELETE /api/upload - Delete image from Supabase Storage
export async function DELETE(request: NextRequest) {
  try {
    const { path } = await request.json()

    if (!path) {
      return NextResponse.json({ error: 'Path tidak ditemukan' }, { status: 400 })
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

    if (error) {
      console.error('[Storage] Delete error:', error.message)
      return NextResponse.json({ error: `Hapus gagal: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Storage] Delete exception:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
