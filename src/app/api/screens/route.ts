import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/screens - Create a new screen
export async function POST(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const { id, password, ownerName, mosqueName } = await request.json()

    if (!id || !password) {
      return NextResponse.json({ error: 'ID dan password wajib diisi' }, { status: 400 })
    }

    if (id.length !== 4 || !/^\d{4}$/.test(id)) {
      return NextResponse.json({ error: 'ID harus 4 angka' }, { status: 400 })
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Password minimal 4 karakter' }, { status: 400 })
    }

    // Check if screen already exists
    const { data: existing } = await supabaseAdmin
      .from('screens')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'ID sudah terdaftar' }, { status: 409 })
    }

    const resolvedMosqueName = mosqueName || 'Masjid Jami Al Ikhlas'

    const defaultConfig = {
      mosqueName: resolvedMosqueName,
      mosqueNameArabic: 'مَسْجِد جَامِع الإِخْلَاص',
      mosqueNameFontFamily: "'Cormorant Garamond', serif",
      mosqueNameFontSize: 1,
      dateOpacity: 0.85,
      dateColor: '#ffffff',
      dateFontFamily: "'Cormorant Garamond', serif",
      dateFontSize: 1,
      theme: 'haramain',
      clockType: 'digital',
      clockStyle: 'default',
      digitalFontFamily: "'Orbitron', monospace",
      digitalFontSize: 8.5,
      showSeconds: true,
      analogNumberStyle: 'arabic',
      analogSize: 200,
      prayerSourceMode: 'auto',
      cardBgColor: 'rgba(201,168,76,0.08)',
      cardBorderColor: 'rgba(201,168,76,0.2)',
      prayerTimesTemplate: [
        { id: 'subuh', latin: 'Subuh', arabic: 'الفَجْر', time: '04:32', isMain: true },
        { id: 'dzuhur', latin: 'Dzuhur', arabic: 'الظُّهْر', time: '11:58', isMain: true },
        { id: 'ashar', latin: 'Ashar', arabic: 'العَصْر', time: '15:15', isMain: true },
        { id: 'maghrib', latin: 'Maghrib', arabic: 'المَغْرِب', time: '17:58', isMain: true },
        { id: 'isya', latin: 'Isya', arabic: 'العِشَاء', time: '19:08', isMain: true },
      ],
      adhanModeEnabled: true,
      adhanDuration: 180,
      iqomahModeEnabled: true,
      iqomahFontFamily: "'Orbitron', monospace",
      iqomahFontSize: 12,
      iqomahBeepEnabled: true,
      iqomahMinutes: 10,
      runningAnimation: 'scroll-left',
      runningSpeed: 25,
      runningFontFamily: "'Inter', sans-serif",
      runningFontSize: 1.0,
      customThemeAccent: '#C9A84C',
      customThemeAccentLight: '#E8D48B',
      showHijri: true,
      showCountdown: true,
      soundEnabled: true,
      showAnnouncement: true,
      announcement: "Assalamu'alaikum Warahmatullahi Wabarakatuh",
      lang: 'id',
    }

    const { data: screen, error } = await supabaseAdmin
      .from('screens')
      .insert({
        id,
        password,
        owner_name: ownerName || '',
        mosque_name: resolvedMosqueName,
        config: defaultConfig,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      screen,
    }, { status: 201 })
  } catch (err) {
    console.error('Create screen error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// GET /api/screens - List screens (for superadmin - basic info only)
export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const { data: screens, error } = await supabaseAdmin
      .from('screens')
      .select('id, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase select error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ screens: screens || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
