import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'mosque-images'

/**
 * POST /api/storage-setup
 * Attempts to auto-setup storage bucket + policies.
 * Falls back to returning SQL the user can run manually.
 */
export async function POST() {
  try {
    // Step 1: Create bucket (idempotent — skip if exists)
    try {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      })
    } catch {
      // Bucket might already exist or anon can't create
    }

    // Step 2: Verify by doing a test upload+delete
    const testData = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]) // minimal JPEG header
    const testPath = '_system/test_connection.jpg'

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(testPath, testData, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (!uploadError) {
      // Upload worked — clean up test file
      await supabase.storage.from(BUCKET_NAME).remove([testPath])
      console.log(`[Storage Setup] ✅ Bucket "${BUCKET_NAME}" is ready!`)
      return NextResponse.json({
        success: true,
        message: `Bucket "${BUCKET_NAME}" siap! Upload gambar bisa digunakan.`,
      })
    }

    // Upload failed — need to check why
    const msg = uploadError.message.toLowerCase()
    let reason = ''

    if (msg.includes('not found') || msg.includes('does not exist')) {
      reason = 'Bucket belum ada di Supabase Storage.'
    } else if (msg.includes('policy') || msg.includes('permission') || msg.includes('rls') || msg.includes('new row')) {
      reason = 'Bucket sudah ada tapi policy RLS belum diatur.'
    } else {
      reason = `Error: ${uploadError.message}`
    }

    console.log(`[Storage Setup] ❌ ${reason}`)

    return NextResponse.json({
      success: false,
      reason,
      message: `${reason} Jalankan SQL berikut di Supabase Dashboard → SQL Editor:`,
      sql: SETUP_SQL,
    })
  } catch (err) {
    console.error('[Storage Setup] Error:', err)
    return NextResponse.json({
      success: false,
      reason: 'Unknown error',
      message: 'Gagal setup otomatis. Jalankan SQL berikut di Supabase Dashboard → SQL Editor:',
      sql: SETUP_SQL,
    })
  }
}

const SETUP_SQL = `-- ============================================
-- MasjidScreen Storage Setup
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Buat bucket (skip jika sudah ada)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('mosque-images', 'mosque-images', true, 5242880, '{"image/jpeg","image/png","image/webp","image/gif"}')
ON CONFLICT (id) DO NOTHING;

-- 2. Hapus policy lama (jika ada)
DROP POLICY IF EXISTS "Public Read mosque-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert mosque-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete mosque-images" ON storage.objects;

-- 3. Buat policy akses publik
CREATE POLICY "Public Read mosque-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'mosque-images');

CREATE POLICY "Public Insert mosque-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'mosque-images');

CREATE POLICY "Public Delete mosque-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'mosque-images');`
