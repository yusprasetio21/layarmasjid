'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────
interface ScreenInfo {
  id: string
  password: string
  ownerName: string
  mosqueName: string
  config: Record<string, unknown>
  createdAt: string
  updatedAt: string | null
}

// ─── Styles (injected) ───────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  
  :root {
    --glass: rgba(255,255,255,0.08);
    --glass-border: rgba(255,255,255,0.14);
    --glass-hover: rgba(255,255,255,0.13);
    --red: #ff3b30;
    --red-soft: rgba(255,59,48,0.18);
    --amber: #ff9f0a;
    --amber-soft: rgba(255,159,10,0.18);
    --green: #30d158;
    --green-soft: rgba(48,209,88,0.18);
    --blue: #0a84ff;
    --blue-soft: rgba(10,132,255,0.15);
    --text-primary: rgba(255,255,255,0.95);
    --text-secondary: rgba(255,255,255,0.55);
    --text-tertiary: rgba(255,255,255,0.3);
    --bg: #0a0a0f;
    --surface: rgba(255,255,255,0.06);
    --divider: rgba(255,255,255,0.08);
    --blur: blur(40px) saturate(180%);
  }

  body {
    font-family: -apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif;
    background: var(--bg);
    color: var(--text-primary);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Background mesh */
  .bg-mesh {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: 
      radial-gradient(ellipse 60% 50% at 20% 20%, rgba(255,59,48,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 80% 80%, rgba(10,132,255,0.06) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 50% 50%, rgba(255,159,10,0.04) 0%, transparent 60%);
  }

  /* Glass card */
  .glass {
    background: var(--glass);
    border: 1px solid var(--glass-border);
    backdrop-filter: var(--blur);
    -webkit-backdrop-filter: var(--blur);
    border-radius: 20px;
  }

  .glass-sm {
    background: var(--glass);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 14px;
  }

  /* Screen */
  .screen {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Login ── */
  .login-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px;
  }

  .login-card {
    width: 100%;
    max-width: 360px;
    padding: 36px 28px 32px;
  }

  .login-icon {
    width: 72px;
    height: 72px;
    border-radius: 22px;
    background: linear-gradient(135deg, rgba(255,59,48,0.3), rgba(255,59,48,0.1));
    border: 1px solid rgba(255,59,48,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    font-size: 30px;
  }

  .login-title {
    font-size: 26px;
    font-weight: 700;
    text-align: center;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }

  .login-sub {
    font-size: 14px;
    color: var(--text-secondary);
    text-align: center;
    margin-bottom: 32px;
  }

  /* Input */
  .input-wrap { margin-bottom: 14px; }
  .input-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: 0.4px;
    text-transform: uppercase;
    margin-bottom: 8px;
    display: block;
  }

  .input-field {
    width: 100%;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 13px 16px;
    font-size: 15px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    font-family: inherit;
  }

  .input-field::placeholder { color: var(--text-tertiary); }
  .input-field:focus {
    border-color: rgba(255,59,48,0.5);
    background: rgba(255,255,255,0.1);
  }

  .input-pw-wrap { position: relative; }
  .input-pw-wrap .input-field { padding-right: 48px; }
  .pw-toggle {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    font-size: 18px;
    padding: 4px;
    transition: color 0.2s;
  }
  .pw-toggle:hover { color: var(--text-secondary); }

  /* Error */
  .error-box {
    background: rgba(255,59,48,0.12);
    border: 1px solid rgba(255,59,48,0.25);
    border-radius: 12px;
    padding: 11px 14px;
    font-size: 13px;
    color: #ff6961;
    text-align: center;
    margin-bottom: 16px;
  }

  /* Buttons */
  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    border-radius: 14px;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: -0.1px;
  }

  .btn:active { transform: scale(0.97); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .btn-red {
    background: var(--red);
    color: #fff;
    padding: 14px 20px;
    font-size: 16px;
    width: 100%;
    box-shadow: 0 4px 20px rgba(255,59,48,0.3);
  }
  .btn-red:hover:not(:disabled) { background: #ff5248; }

  .btn-ghost {
    background: var(--glass);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    padding: 10px 16px;
    font-size: 14px;
    backdrop-filter: blur(20px);
  }
  .btn-ghost:hover:not(:disabled) { background: var(--glass-hover); color: var(--text-primary); }

  .btn-amber {
    background: var(--amber);
    color: #000;
    padding: 13px 20px;
    font-size: 15px;
    width: 100%;
  }

  .btn-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    color: var(--text-tertiary);
    font-size: 16px;
    flex-shrink: 0;
    transition: all 0.2s;
  }
  .btn-icon:hover { color: var(--text-primary); background: var(--glass-hover); }
  .btn-icon.danger:hover { color: var(--red); background: var(--red-soft); }
  .btn-icon.warning:hover { color: var(--amber); background: var(--amber-soft); }

  /* ── Header ── */
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    padding: 14px 20px 12px;
    background: rgba(10,10,15,0.7);
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    border-bottom: 1px solid var(--divider);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-left { display: flex; align-items: center; gap: 10px; }
  .header-icon {
    width: 32px; height: 32px;
    background: var(--red-soft);
    border: 1px solid rgba(255,59,48,0.3);
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
  }

  .header-title {
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .badge {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 20px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .badge-red { background: var(--red-soft); color: var(--red); border: 1px solid rgba(255,59,48,0.2); }
  .badge-green { background: var(--green-soft); color: var(--green); border: 1px solid rgba(48,209,88,0.2); }

  .header-actions { display: flex; align-items: center; gap: 8px; }

  /* ── Content ── */
  .content {
    flex: 1;
    padding: 20px;
    max-width: 480px;
    margin: 0 auto;
    width: 100%;
    padding-bottom: 40px;
  }

  /* Stats row */
  .stats-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }

  .stat-card {
    padding: 18px 16px;
  }

  .stat-num {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -1px;
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  /* Add button */
  .add-btn {
    width: 100%;
    padding: 16px;
    font-size: 16px;
    border-radius: 16px;
    margin-bottom: 24px;
    background: linear-gradient(135deg, rgba(255,59,48,0.9), rgba(255,59,48,0.7));
    border: 1px solid rgba(255,59,48,0.4);
    box-shadow: 0 8px 32px rgba(255,59,48,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
  }

  /* Section header */
  .section-header {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
  }

  /* Device cards */
  .device-card {
    padding: 18px;
    margin-bottom: 12px;
    transition: all 0.2s;
  }
  .device-card:active { transform: scale(0.99); }

  .device-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .device-id-row { display: flex; align-items: center; gap: 10px; }

  .device-id-badge {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    font-variant-numeric: tabular-nums;
  }

  .device-actions { display: flex; gap: 6px; }

  .device-info { margin-bottom: 12px; }
  .device-info-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 5px;
  }
  .device-info-label {
    font-size: 11px;
    color: var(--text-tertiary);
    font-weight: 500;
    min-width: 52px;
  }
  .device-info-val {
    font-size: 13px;
    color: var(--text-primary);
    font-weight: 500;
  }

  .pw-row {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 9px 12px;
    margin-bottom: 12px;
  }
  .pw-label { font-size: 11px; color: var(--text-tertiary); flex: 0 0 auto; }
  .pw-val { font-size: 13px; font-family: 'SF Mono', monospace; color: var(--text-secondary); flex: 1; }
  .copy-btn {
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    font-size: 14px;
    padding: 2px;
    transition: color 0.2s;
    flex: 0 0 auto;
  }
  .copy-btn:hover { color: var(--text-primary); }
  .copy-btn.copied { color: var(--green); }

  .device-date {
    font-size: 11px;
    color: var(--text-tertiary);
  }

  /* Empty state */
  .empty {
    text-align: center;
    padding: 60px 20px;
  }
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.3; }
  .empty-title { font-size: 17px; font-weight: 600; margin-bottom: 6px; color: var(--text-secondary); }
  .empty-sub { font-size: 14px; color: var(--text-tertiary); }

  /* ── Bottom Sheet Modal ── */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(8px);
    z-index: 100;
    display: flex;
    align-items: flex-end;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

  .sheet {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    background: rgba(20,20,28,0.95);
    backdrop-filter: blur(60px) saturate(200%);
    -webkit-backdrop-filter: blur(60px) saturate(200%);
    border: 1px solid rgba(255,255,255,0.12);
    border-bottom: none;
    border-radius: 28px 28px 0 0;
    padding: 12px 24px 40px;
    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .sheet-handle {
    width: 36px;
    height: 4px;
    background: rgba(255,255,255,0.2);
    border-radius: 2px;
    margin: 0 auto 24px;
  }

  .sheet-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.4px;
    margin-bottom: 4px;
  }

  .sheet-sub {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 28px;
  }

  .sheet-footer {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .sheet-footer .btn-ghost { flex: 1; justify-content: center; }
  .sheet-footer .btn-red,
  .sheet-footer .btn-amber { flex: 2; }

  /* Destructive */
  .btn-destructive {
    background: var(--red-soft);
    border: 1px solid rgba(255,59,48,0.3);
    color: var(--red);
    padding: 13px 20px;
    font-size: 15px;
    width: 100%;
  }

  /* Spinner */
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Sync dot */
  .sync-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 6px var(--green);
    animation: pulse 2s infinite;
    flex-shrink: 0;
  }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
`

// ─── Login ────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: (t: string) => void }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = useCallback(async () => {
    setErr('')
    if (!u || !p) { setErr('Username dan password wajib diisi'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login gagal')
      onLogin(data.token)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Login gagal')
    } finally {
      setLoading(false)
    }
  }, [u, p, onLogin])

  return (
    <div className="login-wrap">
      <div className="glass login-card">
        <div className="login-icon">🛡️</div>
        <div className="login-title">Superadmin</div>
        <div className="login-sub">Kelola semua perangkat MasjidScreen</div>

        <div className="input-wrap">
          <label className="input-label">Username</label>
          <input
            className="input-field"
            value={u}
            onChange={e => setU(e.target.value)}
            placeholder="admin"
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>

        <div className="input-wrap">
          <label className="input-label">Password</label>
          <div className="input-pw-wrap">
            <input
              className="input-field"
              type={show ? 'text' : 'password'}
              value={p}
              onChange={e => setP(e.target.value)}
              placeholder="Password superadmin"
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
            <button className="pw-toggle" onClick={() => setShow(!show)}>
              {show ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {err && <div className="error-box">{err}</div>}

        <button className="btn btn-red" onClick={submit} disabled={loading}>
          {loading ? <><span className="spinner" /> Memproses...</> : <>🛡️ Masuk Superadmin</>}
        </button>
      </div>
    </div>
  )
}

// ─── Bottom Sheet ─────────────────────────────────────────────────────
function Sheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        {children}
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────
function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [screens, setScreens] = useState<ScreenInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Modals
  const [createOpen, setCreateOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activeScreen, setActiveScreen] = useState<ScreenInfo | null>(null)

  // Form states
  const [fId, setFId] = useState('')
  const [fPw, setFPw] = useState('')
  const [fOwner, setFOwner] = useState('')
  const [fMosque, setFMosque] = useState('')
  const [fErr, setFErr] = useState('')
  const [fLoading, setFLoading] = useState(false)

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }), [token])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/superadmin', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (res.ok) setScreens(data.screens)
    } catch (e) { console.error(e) }
  }, [token])

  useEffect(() => { load().finally(() => setLoading(false)) }, [load])

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false) }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(key)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCreate = async () => {
    setFErr('')
    if (!fId || !/^\d{4}$/.test(fId)) { setFErr('ID harus 4 angka'); return }
    if (!fPw || fPw.length < 4) { setFErr('Password minimal 4 karakter'); return }
    setFLoading(true)
    try {
      const res = await fetch('/api/screens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fId, password: fPw, ownerName: fOwner, mosqueName: fMosque }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCreateOpen(false)
      setFId(''); setFPw(''); setFOwner(''); setFMosque('')
      await load()
    } catch (e: unknown) {
      setFErr(e instanceof Error ? e.message : 'Gagal')
    } finally { setFLoading(false) }
  }

  const handleChangePw = async () => {
    setFErr('')
    if (!fPw || fPw.length < 4) { setFErr('Password minimal 4 karakter'); return }
    setFLoading(true)
    try {
      const res = await fetch('/api/superadmin', {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ id: activeScreen?.id, password: fPw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPwOpen(false); setFPw('')
      await load()
    } catch (e: unknown) {
      setFErr(e instanceof Error ? e.message : 'Gagal')
    } finally { setFLoading(false) }
  }

  const handleDelete = async () => {
    setFLoading(true)
    try {
      const res = await fetch(`/api/superadmin?id=${activeScreen?.id}`, {
        method: 'DELETE', headers: headers(),
      })
      if (!res.ok) throw new Error('Gagal menghapus')
      setDeleteOpen(false)
      await load()
    } catch (e) { console.error(e) }
    finally { setFLoading(false) }
  }

  const openCreate = () => {
    setFId(''); setFPw(''); setFOwner(''); setFMosque(''); setFErr('')
    setCreateOpen(true)
  }

  const openPw = (s: ScreenInfo) => { setActiveScreen(s); setFPw(''); setFErr(''); setPwOpen(true) }
  const openDelete = (s: ScreenInfo) => { setActiveScreen(s); setDeleteOpen(true) }

  const fmt = (d: string) => new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
      <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'var(--red)' }} />
      <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Memuat data...</span>
    </div>
  )

  return (
    <div className="screen">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="header-icon">🛡️</div>
          <span className="header-title">Superadmin</span>
          <span className="badge badge-red">Owner</span>
        </div>
        <div className="header-actions">
          <Link href="/superadmin/themes">
            <button className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 13 }}>
              🎨 <span style={{ display: 'none' }}>Themes</span>
            </button>
          </Link>
          <button className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 13 }} onClick={refresh} disabled={refreshing}>
            {refreshing ? <span className="spinner" /> : '↻'}
          </button>
          <Link href="/">
            <button className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 13 }}>📺</button>
          </Link>
          <button className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 13 }} onClick={onLogout}>
            ↩️
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content">

        {/* Stats */}
        <div className="stats-row">
          <div className="glass stat-card">
            <div className="stat-num" style={{ color: 'var(--red)' }}>{screens.length}</div>
            <div className="stat-label">Total Perangkat</div>
          </div>
          <div className="glass stat-card">
            <div className="stat-num" style={{ color: 'var(--green)' }}>{screens.length}</div>
            <div className="stat-label">Aktif</div>
          </div>
        </div>

        {/* Add */}
        <button className="btn add-btn" onClick={openCreate}>
          ＋ Tambah Perangkat
        </button>

        {/* List */}
        {screens.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📺</div>
            <div className="empty-title">Belum ada perangkat</div>
            <div className="empty-sub">Tap tombol di atas untuk menambahkan perangkat baru</div>
          </div>
        ) : (
          <>
            <div className="section-header">Perangkat Terdaftar ({screens.length})</div>
            {screens.map(s => (
              <div key={s.id} className="glass device-card">
                <div className="device-header">
                  <div className="device-id-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>ID</span>
                      <span className="device-id-badge">{s.id}</span>
                    </div>
                    <span className="badge badge-green">Aktif</span>
                  </div>
                  <div className="device-actions">
                    <button className="btn btn-icon warning" onClick={() => openPw(s)} title="Ubah Password">🔑</button>
                    <button className="btn btn-icon danger" onClick={() => openDelete(s)} title="Hapus">🗑️</button>
                  </div>
                </div>

                <div className="device-info">
                  {s.ownerName && (
                    <div className="device-info-row">
                      <span className="device-info-label">Pemilik</span>
                      <span className="device-info-val">{s.ownerName}</span>
                    </div>
                  )}
                  {s.mosqueName && (
                    <div className="device-info-row">
                      <span className="device-info-label">Masjid</span>
                      <span className="device-info-val">{s.mosqueName}</span>
                    </div>
                  )}
                </div>

                <div className="pw-row">
                  <span className="pw-label">Password</span>
                  <span className="pw-val">{s.password}</span>
                  <button
                    className={`copy-btn ${copiedId === `pw-${s.id}` ? 'copied' : ''}`}
                    onClick={() => copy(s.password, `pw-${s.id}`)}
                  >
                    {copiedId === `pw-${s.id}` ? '✓' : '⎘'}
                  </button>
                </div>

                <div className="device-date">
                  Dibuat {fmt(s.createdAt)}
                  {s.updatedAt && ` · Diubah ${fmt(s.updatedAt)}`}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Sheet: Create ── */}
      {createOpen && (
        <Sheet onClose={() => setCreateOpen(false)}>
          <div className="sheet-title">Tambah Perangkat</div>
          <div className="sheet-sub">Buat ID dan password untuk masjid baru</div>

          <div className="input-wrap">
            <label className="input-label">Nama Pemilik</label>
            <input className="input-field" value={fOwner} onChange={e => setFOwner(e.target.value)} placeholder="Nama pemilik / pengurus" />
          </div>
          <div className="input-wrap">
            <label className="input-label">Nama Masjid</label>
            <input className="input-field" value={fMosque} onChange={e => setFMosque(e.target.value)} placeholder="Nama masjid" />
          </div>
          <div className="input-wrap">
            <label className="input-label">ID Perangkat (4 angka)</label>
            <input
              className="input-field"
              value={fId}
              onChange={e => setFId(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Contoh: 1234"
              maxLength={4}
              style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '4px', fontSize: 20, fontWeight: 700 }}
            />
          </div>
          <div className="input-wrap">
            <label className="input-label">Password</label>
            <input className="input-field" value={fPw} onChange={e => setFPw(e.target.value)} placeholder="Minimal 4 karakter" />
          </div>

          {fErr && <div className="error-box">{fErr}</div>}

          <div className="sheet-footer">
            <button className="btn btn-ghost" onClick={() => setCreateOpen(false)}>Batal</button>
            <button className="btn btn-red" onClick={handleCreate} disabled={fLoading}>
              {fLoading ? <><span className="spinner" /> Membuat...</> : 'Buat Perangkat'}
            </button>
          </div>
        </Sheet>
      )}

      {/* ── Sheet: Change PW ── */}
      {pwOpen && (
        <Sheet onClose={() => setPwOpen(false)}>
          <div className="sheet-title">Ubah Password</div>
          <div className="sheet-sub">Perangkat ID: <strong style={{ color: 'var(--text-primary)' }}>{activeScreen?.id}</strong></div>

          <div className="input-wrap">
            <label className="input-label">Password Baru</label>
            <input className="input-field" value={fPw} onChange={e => setFPw(e.target.value)} placeholder="Minimal 4 karakter" />
          </div>

          {fErr && <div className="error-box">{fErr}</div>}

          <div className="sheet-footer">
            <button className="btn btn-ghost" onClick={() => setPwOpen(false)}>Batal</button>
            <button className="btn btn-amber" onClick={handleChangePw} disabled={fLoading}>
              {fLoading ? <><span className="spinner" /> Menyimpan...</> : '🔑 Simpan Password'}
            </button>
          </div>
        </Sheet>
      )}

      {/* ── Sheet: Delete ── */}
      {deleteOpen && (
        <Sheet onClose={() => setDeleteOpen(false)}>
          <div className="sheet-title" style={{ color: 'var(--red)' }}>Hapus Perangkat?</div>
          <div className="sheet-sub">
            Perangkat <strong style={{ color: 'var(--text-primary)' }}>ID {activeScreen?.id}</strong> ({activeScreen?.mosqueName || 'tanpa nama'}) akan dihapus permanen beserta semua konfigurasinya. Tindakan ini tidak dapat dibatalkan.
          </div>

          <div className="sheet-footer">
            <button className="btn btn-ghost" onClick={() => setDeleteOpen(false)}>Batal</button>
            <button className="btn btn-destructive" onClick={handleDelete} disabled={fLoading}>
              {fLoading ? <><span className="spinner" /> Menghapus...</> : '🗑️ Hapus Permanen'}
            </button>
          </div>
        </Sheet>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────
export default function SuperAdminPanel() {
  const [token, setToken] = useState<string | null>(null)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="bg-mesh" />
      {!token
        ? <Login onLogin={setToken} />
        : <Dashboard token={token} onLogout={() => setToken(null)} />
      }
    </>
  )
}