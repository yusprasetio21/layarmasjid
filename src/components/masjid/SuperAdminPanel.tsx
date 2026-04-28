'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface ScreenInfo {
  id: string
  password: string
  ownerName: string
  mosqueName: string
  config: Record<string, unknown>
  createdAt: string
  updatedAt: string | null
}

const styles = `
* { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
:root {
  --glass: rgba(255,255,255,0.08);
  --glass-border: rgba(255,255,255,0.14);
  --glass-hover: rgba(255,255,255,0.13);
  --red: #ff3b30;
  --red-soft: rgba(255,59,48,0.18);
  --amber: #ff9f0a;
  --green: #30d158;
  --green-soft: rgba(48,209,88,0.18);
  --text-primary: rgba(255,255,255,0.95);
  --text-secondary: rgba(255,255,255,0.55);
  --text-tertiary: rgba(255,255,255,0.3);
  --bg: #0a0a0f;
  --divider: rgba(255,255,255,0.08);
  --input-bg: rgba(255,255,255,0.07);
  --input-border: rgba(255,255,255,0.12);
  --sheet-bg: rgba(20,20,28,0.97);
}
[data-theme="light"] {
  --glass: rgba(0,0,0,0.04);
  --glass-border: rgba(0,0,0,0.08);
  --glass-hover: rgba(0,0,0,0.07);
  --red: #ff3b30;
  --red-soft: rgba(255,59,48,0.1);
  --amber: #c07800;
  --green: #1a9e3f;
  --green-soft: rgba(26,158,63,0.12);
  --text-primary: rgba(0,0,0,0.88);
  --text-secondary: rgba(0,0,0,0.5);
  --text-tertiary: rgba(0,0,0,0.3);
  --bg: #f2f2f7;
  --divider: rgba(0,0,0,0.08);
  --input-bg: rgba(0,0,0,0.04);
  --input-border: rgba(0,0,0,0.1);
  --sheet-bg: rgba(242,242,247,0.98);
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
  transition: background 0.3s, color 0.3s;
}
.bg-mesh {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 60% 50% at 20% 20%, rgba(255,59,48,0.07) 0%, transparent 60%),
              radial-gradient(ellipse 50% 60% at 80% 80%, rgba(10,132,255,0.05) 0%, transparent 60%);
  transition: opacity 0.3s;
}
[data-theme="light"] .bg-mesh { opacity: 0.4; }
.screen { position:relative; z-index:1; min-height:100vh; display:flex; flex-direction:column; }
.glass {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 20px;
}
.login-wrap { display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px; }
.login-card { width:100%; max-width:360px; padding:36px 24px 28px; }
.login-icon {
  width:68px; height:68px; border-radius:20px;
  background: linear-gradient(135deg,rgba(255,59,48,0.25),rgba(255,59,48,0.08));
  border:1px solid rgba(255,59,48,0.25);
  display:flex; align-items:center; justify-content:center;
  margin:0 auto 20px; font-size:28px;
}
.login-title { font-size:24px; font-weight:700; text-align:center; letter-spacing:-0.5px; margin-bottom:6px; }
.login-sub { font-size:13px; color:var(--text-secondary); text-align:center; margin-bottom:28px; }
.input-wrap { margin-bottom:12px; }
.input-label {
  font-size:11px; font-weight:600; color:var(--text-secondary);
  letter-spacing:0.4px; text-transform:uppercase; margin-bottom:7px; display:block;
}
.input-field {
  width:100%; background:var(--input-bg); border:1px solid var(--input-border);
  border-radius:12px; padding:12px 14px; font-size:15px; color:var(--text-primary);
  outline:none; transition:border-color 0.2s, background 0.2s; font-family:inherit;
}
.input-field::placeholder { color:var(--text-tertiary); }
.input-field:focus { border-color:rgba(255,59,48,0.5); background:var(--input-bg); }
.input-pw-wrap { position:relative; }
.input-pw-wrap .input-field { padding-right:46px; }
.pw-toggle {
  position:absolute; right:12px; top:50%; transform:translateY(-50%);
  background:none; border:none; color:var(--text-tertiary);
  cursor:pointer; font-size:17px; padding:4px; transition:color 0.2s;
}
.error-box {
  background:rgba(255,59,48,0.1); border:1px solid rgba(255,59,48,0.2);
  border-radius:10px; padding:10px 14px; font-size:13px; color:#ff6961;
  text-align:center; margin-bottom:14px;
}
.btn {
  display:flex; align-items:center; justify-content:center; gap:7px;
  border:none; border-radius:13px; font-family:inherit; font-weight:600;
  cursor:pointer; transition:all 0.18s; letter-spacing:-0.1px; font-size:15px;
}
.btn:active { transform:scale(0.97); }
.btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
.btn-red { background:var(--red); color:#fff; padding:13px 18px; width:100%; box-shadow:0 4px 16px rgba(255,59,48,0.25); }
.btn-ghost {
  background:var(--glass); border:1px solid var(--glass-border);
  color:var(--text-secondary); padding:10px 14px;
  backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
}
.btn-ghost:hover:not(:disabled) { background:var(--glass-hover); color:var(--text-primary); }
.btn-amber { background:var(--amber); color:#fff; padding:13px 18px; width:100%; }
.btn-destructive {
  background:var(--red-soft); border:1px solid rgba(255,59,48,0.25);
  color:var(--red); padding:13px 18px; width:100%;
}
.btn-icon {
  width:34px; height:34px; border-radius:9px;
  background:var(--glass); border:1px solid var(--glass-border);
  color:var(--text-tertiary); font-size:15px; flex-shrink:0; transition:all 0.2s;
}
.btn-icon:hover { color:var(--text-primary); background:var(--glass-hover); }
.btn-icon.danger:hover { color:var(--red); background:var(--red-soft); }
.btn-icon.warning:hover { color:var(--amber); background:rgba(255,159,10,0.15); }
.header {
  position:sticky; top:0; z-index:50;
  padding: 8px 12px;
  padding-top: max(8px, env(safe-area-inset-top));
  background:rgba(10,10,15,0.75);
  backdrop-filter:blur(40px) saturate(180%);
  -webkit-backdrop-filter:blur(40px) saturate(180%);
  border-bottom:1px solid var(--divider);
  display:flex; align-items:center; justify-content:space-between;
  transition:background 0.3s;
}
[data-theme="light"] .header { background:rgba(242,242,247,0.8); }
.header-left { display:flex; align-items:center; gap:6px; }
.header-icon {
  width:28px; height:28px;
  background:var(--red-soft);
  border:1px solid rgba(255,59,48,0.25);
  border-radius:8px;
  display:flex; align-items:center; justify-content:center; font-size:14px;
}
.header-title { font-size:15px; font-weight:700; letter-spacing:-0.3px; }
.badge {
  font-size:10px; font-weight:700; padding:2px 7px;
  border-radius:20px; letter-spacing:0.3px; text-transform:uppercase;
}
.badge-red { background:var(--red-soft); color:var(--red); border:1px solid rgba(255,59,48,0.2); }
.badge-green { background:var(--green-soft); color:var(--green); border:1px solid rgba(48,209,88,0.2); }
.header-actions { display:flex; align-items:center; gap:5px; }
.theme-pill {
  display:flex; align-items:center; gap:4px;
  background:var(--glass); border:1px solid var(--glass-border);
  border-radius:20px; padding:4px 9px;
  cursor:pointer; font-size:11px; font-weight:600;
  color:var(--text-secondary); transition:all 0.2s; white-space:nowrap;
}
.theme-pill:hover { background:var(--glass-hover); color:var(--text-primary); }
.content {
  flex:1; padding:12px 16px; max-width:480px; margin:0 auto; width:100%;
  padding-bottom: max(20px, env(safe-area-inset-bottom));
}
.stats-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
.stat-card { padding:16px 14px; }
.stat-num { font-size:30px; font-weight:700; letter-spacing:-1px; line-height:1; margin-bottom:3px; }
.stat-label { font-size:11px; color:var(--text-secondary); font-weight:500; }
.add-btn {
  width:100%; padding:15px; font-size:15px; border-radius:14px; margin-bottom:20px;
  background:linear-gradient(135deg,rgba(255,59,48,0.9),rgba(255,59,48,0.7));
  border:1px solid rgba(255,59,48,0.35);
  box-shadow:0 6px 24px rgba(255,59,48,0.18), inset 0 1px 0 rgba(255,255,255,0.1);
}
.section-header {
  font-size:12px; font-weight:600; color:var(--text-secondary);
  text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;
}
.device-card { padding:16px; margin-bottom:10px; transition:all 0.2s; }
.device-card:active { transform:scale(0.99); }
.device-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:10px; }
.device-id-row { display:flex; align-items:center; gap:8px; }
.device-id-badge { font-size:20px; font-weight:800; letter-spacing:-0.5px; font-variant-numeric:tabular-nums; }
.device-actions { display:flex; gap:5px; }
.device-info { margin-bottom:10px; }
.device-info-row { display:flex; align-items:center; gap:6px; margin-bottom:4px; }
.device-info-label { font-size:11px; color:var(--text-tertiary); font-weight:500; min-width:48px; }
.device-info-val { font-size:13px; color:var(--text-primary); font-weight:500; }
.pw-row {
  display:flex; align-items:center; gap:8px;
  background:var(--input-bg); border:1px solid var(--input-border);
  border-radius:10px; padding:9px 12px; margin-bottom:10px;
}
.pw-label { font-size:11px; color:var(--text-tertiary); flex:0 0 auto; }
.pw-val { font-size:13px; font-family:'SF Mono',monospace; color:var(--text-secondary); flex:1; }
.copy-btn {
  background:none; border:none; color:var(--text-tertiary);
  cursor:pointer; font-size:14px; padding:2px; transition:color 0.2s;
}
.copy-btn:hover { color:var(--text-primary); }
.copy-btn.copied { color:var(--green); }
.ids-row { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; }
.id-chip {
  background:var(--input-bg); border:1px solid var(--input-border);
  border-radius:8px; padding:5px 10px; font-size:13px;
  font-weight:700; font-variant-numeric:tabular-nums;
  color:var(--text-primary); letter-spacing:1px;
}
.device-date { font-size:11px; color:var(--text-tertiary); }
.empty { text-align:center; padding:50px 20px; }
.empty-icon { font-size:44px; margin-bottom:14px; opacity:0.3; }
.empty-title { font-size:16px; font-weight:600; margin-bottom:5px; color:var(--text-secondary); }
.empty-sub { font-size:13px; color:var(--text-tertiary); }

/* Bottom Sheet - sekarang 100% lebar, tidak melebihi layar */
.overlay {
  position:fixed; inset:0;
  background:rgba(0,0,0,0.55);
  backdrop-filter:blur(8px);
  z-index:100;
  display:flex;
  align-items:flex-end;
  justify-content:center;
  overflow-x: hidden;                /* mencegah geser horizontal */
  animation:fadeIn 0.2s ease;
}
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
.sheet {
  width: 100%;                       /* penuh selebar layar */
  max-width: 100%;                   /* tidak terpotong batas 480px */
  max-height: 75dvh;                 /* lebih pas di mobile + keyboard */
  background:var(--sheet-bg);
  backdrop-filter:blur(60px) saturate(200%);
  -webkit-backdrop-filter:blur(60px) saturate(200%);
  border:1px solid var(--glass-border);
  border-bottom:none;
  border-radius:26px 26px 0 0;
  animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
  display:flex;
  flex-direction:column;
  overflow: hidden;                  /* tidak ada scroll horizontal */
  box-sizing: border-box;
}
.sheet-handle-wrap { padding:10px 24px 0; flex-shrink:0; }
.sheet-handle { width:36px; height:4px; background:rgba(128,128,128,0.3); border-radius:2px; margin:0 auto 16px; }
.sheet-header { padding:0 24px 14px; flex-shrink:0; border-bottom:1px solid var(--divider); }
.sheet-title { font-size:19px; font-weight:700; letter-spacing:-0.4px; margin-bottom:3px; }
.sheet-sub { font-size:13px; color:var(--text-secondary); }
.sheet-body {
  flex:1;
  overflow-y:auto;
  padding:18px 24px;
  -webkit-overflow-scrolling:touch;
}
.sheet-footer {
  padding:14px 24px 24px;
  padding-bottom: max(14px, env(safe-area-inset-bottom));
  flex-shrink:0;
  border-top:1px solid var(--divider);
  display:flex;
  gap:8px;
}
.sheet-footer .btn-ghost { flex:1; justify-content:center; }
.sheet-footer .btn-red,
.sheet-footer .btn-amber,
.sheet-footer .btn-destructive { flex:2; min-width:0; } /* min-width:0 agar tombol bisa mengecil */

.ids-input-list { display:flex; flex-direction:column; gap:8px; margin-bottom:8px; }
.id-input-row { display:flex; align-items:center; gap:8px; }
.id-input-row .input-field {
  flex:1;
  font-variant-numeric:tabular-nums;
  letter-spacing:3px;
  font-size:18px;
  font-weight:700;
  text-align:center;
}
.id-remove-btn {
  width:32px; height:32px; border-radius:8px; flex-shrink:0;
  background:var(--red-soft); border:1px solid rgba(255,59,48,0.2);
  color:var(--red); font-size:16px; cursor:pointer; transition:all 0.2s;
  display:flex; align-items:center; justify-content:center;
}
.add-id-btn {
  display:flex; align-items:center; gap:6px; padding:9px 14px;
  background:var(--glass); border:1px solid var(--glass-border);
  border-radius:10px; cursor:pointer; font-size:13px; font-weight:600;
  color:var(--text-secondary); transition:all 0.2s; width:100%;
  justify-content:center; font-family:inherit;
}
.add-id-btn:hover { background:var(--glass-hover); color:var(--text-primary); }

.spinner {
  width:15px; height:15px; border:2px solid rgba(255,255,255,0.3);
  border-top-color:currentColor; border-radius:50%;
  animation:spin 0.7s linear infinite; flex-shrink:0;
}
@keyframes spin { to{transform:rotate(360deg)} }
`

// ─── Login, Sheet, Dashboard, Main (sama seperti sebelumnya, hanya modifikasi kecil di tombol footer) ───
// (Potongan komponen tetap sama, hanya ubah teks tombol footer saat Create)

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
      localStorage.setItem('sa-token', data.token)
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
          <input className="input-field" value={u} onChange={e => setU(e.target.value)} placeholder="admin" onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>
        <div className="input-wrap" style={{ marginBottom: 18 }}>
          <label className="input-label">Password</label>
          <div className="input-pw-wrap">
            <input className="input-field" type={show ? 'text' : 'password'} value={p} onChange={e => setP(e.target.value)} placeholder="Password superadmin" onKeyDown={e => e.key === 'Enter' && submit()} />
            <button className="pw-toggle" onClick={() => setShow(!show)}>{show ? '🙈' : '👁️'}</button>
          </div>
        </div>
        {err && <div className="error-box">{err}</div>}
        <button className="btn btn-red" onClick={submit} disabled={loading}>
          {loading ? <><span className="spinner" />Memproses...</> : <>🛡️ Masuk Superadmin</>}
        </button>
      </div>
    </div>
  )
}

function Sheet({ onClose, title, sub, footer, children }: {
  onClose: () => void
  title: React.ReactNode
  sub?: string
  footer: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle-wrap"><div className="sheet-handle" /></div>
        <div className="sheet-header">
          <div className="sheet-title">{title}</div>
          {sub && <div className="sheet-sub">{sub}</div>}
        </div>
        <div className="sheet-body">{children}</div>
        <div className="sheet-footer">{footer}</div>
      </div>
    </div>
  )
}

function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [screens, setScreens] = useState<ScreenInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const [createOpen, setCreateOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activeScreen, setActiveScreen] = useState<ScreenInfo | null>(null)

  const [fIds, setFIds] = useState([''])
  const [fPw, setFPw] = useState('')
  const [fOwner, setFOwner] = useState('')
  const [fMosque, setFMosque] = useState('')
  const [fErr, setFErr] = useState('')
  const [fLoading, setFLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sa-theme') as 'dark' | 'light' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('sa-theme', next)
  }

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }), [token])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/superadmin', { headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 401) {
        localStorage.removeItem('sa-token')
        onLogout()
        return
      }
      const data = await res.json()
      if (res.ok) setScreens(data.screens)
    } catch (e) { console.error(e) }
  }, [token, onLogout])

  useEffect(() => { load().finally(() => setLoading(false)) }, [load])

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false) }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(key)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const addIdField = () => setFIds(prev => [...prev, ''])
  const removeIdField = (i: number) => setFIds(prev => prev.filter((_, idx) => idx !== i))
  const updateId = (i: number, val: string) =>
    setFIds(prev => prev.map((v, idx) => idx === i ? val.replace(/\D/g, '').slice(0, 4) : v))

  const handleCreate = async () => {
    setFErr('')
    const validIds = fIds.filter(id => /^\d{4}$/.test(id))
    if (validIds.length === 0) { setFErr('Minimal 1 ID harus 4 angka'); return }
    if (!fPw || fPw.length < 4) { setFErr('Password minimal 4 karakter'); return }
    setFLoading(true)
    try {
      for (const id of validIds) {
        const res = await fetch('/api/screens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, password: fPw, ownerName: fOwner, mosqueName: fMosque }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(`ID ${id}: ${data.error}`)
      }
      setCreateOpen(false)
      setFIds(['']); setFPw(''); setFOwner(''); setFMosque('')
      await load()
    } catch (e: unknown) { setFErr(e instanceof Error ? e.message : 'Gagal') }
    finally { setFLoading(false) }
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
    } catch (e: unknown) { setFErr(e instanceof Error ? e.message : 'Gagal') }
    finally { setFLoading(false) }
  }

  const handleDelete = async () => {
    setFLoading(true)
    try {
      const res = await fetch(`/api/superadmin?id=${activeScreen?.id}`, { method: 'DELETE', headers: headers() })
      if (!res.ok) throw new Error('Gagal menghapus')
      setDeleteOpen(false)
      await load()
    } catch (e) { console.error(e) }
    finally { setFLoading(false) }
  }

  const openCreate = () => {
    setFIds(['']); setFPw(''); setFOwner(''); setFMosque(''); setFErr(''); setCreateOpen(true)
  }
  const openPw = (s: ScreenInfo) => { setActiveScreen(s); setFPw(''); setFErr(''); setPwOpen(true) }
  const openDelete = (s: ScreenInfo) => { setActiveScreen(s); setDeleteOpen(true) }

  const fmt = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  const handleLogout = () => {
    localStorage.removeItem('sa-token')
    onLogout()
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:12 }}>
      <span className="spinner" style={{ width:26, height:26, borderWidth:3, borderColor:'rgba(128,128,128,0.2)', borderTopColor:'var(--red)' }} />
      <span style={{ fontSize:13, color:'var(--text-secondary)' }}>Memuat data...</span>
    </div>
  )

  // ringkasan jumlah ID yang valid untuk tombol
  const validIdsCount = fIds.filter(id => /^\d{4}$/.test(id)).length

  return (
    <div className="screen">
      <div className="header">
        <div className="header-left">
          <div className="header-icon">🛡️</div>
          <span className="header-title">Superadmin</span>
          <span className="badge badge-red">Owner</span>
        </div>
        <div className="header-actions">
          <button className="theme-pill" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <Link href="/superadmin/themes">
            <button className="btn btn-ghost" style={{ padding:'6px 9px', fontSize:12 }}>🎨</button>
          </Link>
          <button className="btn btn-ghost" style={{ padding:'6px 9px', fontSize:12 }} onClick={refresh} disabled={refreshing}>
            {refreshing ? <span className="spinner" /> : '↻'}
          </button>
          <Link href="/">
            <button className="btn btn-ghost" style={{ padding:'6px 9px', fontSize:12 }}>📺</button>
          </Link>
          <button className="btn btn-ghost" style={{ padding:'6px 9px', fontSize:12 }} onClick={handleLogout}>↩️</button>
        </div>
      </div>

      <div className="content">
        <div className="stats-row">
          <div className="glass stat-card">
            <div className="stat-num" style={{ color:'var(--red)' }}>{screens.length}</div>
            <div className="stat-label">Total Perangkat</div>
          </div>
          <div className="glass stat-card">
            <div className="stat-num" style={{ color:'var(--green)' }}>{screens.length}</div>
            <div className="stat-label">Aktif</div>
          </div>
        </div>

        <button className="btn add-btn" onClick={openCreate}>＋ Tambah Perangkat</button>

        {screens.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📺</div>
            <div className="empty-title">Belum ada perangkat</div>
            <div className="empty-sub">Tap tombol di atas untuk menambahkan perangkat</div>
          </div>
        ) : (
          <>
            <div className="section-header">Perangkat Terdaftar ({screens.length})</div>
            {screens.map(s => (
              <div key={s.id} className="glass device-card">
                <div className="device-header">
                  <div className="device-id-row">
                    <span style={{ fontSize:12, color:'var(--text-tertiary)' }}>ID</span>
                    <span className="device-id-badge">{s.id}</span>
                    <span className="badge badge-green">Aktif</span>
                  </div>
                  <div className="device-actions">
                    <button className="btn btn-icon warning" onClick={() => openPw(s)}>🔑</button>
                    <button className="btn btn-icon danger" onClick={() => openDelete(s)}>🗑️</button>
                  </div>
                </div>
                <div className="device-info">
                  {s.ownerName && <div className="device-info-row"><span className="device-info-label">Pemilik</span><span className="device-info-val">{s.ownerName}</span></div>}
                  {s.mosqueName && <div className="device-info-row"><span className="device-info-label">Masjid</span><span className="device-info-val">{s.mosqueName}</span></div>}
                </div>
                <div className="pw-row">
                  <span className="pw-label">Password</span>
                  <span className="pw-val">{s.password}</span>
                  <button className={`copy-btn ${copiedId === `pw-${s.id}` ? 'copied' : ''}`} onClick={() => copy(s.password, `pw-${s.id}`)}>
                    {copiedId === `pw-${s.id}` ? '✓' : '⎘'}
                  </button>
                </div>
                <div className="device-date">Dibuat {fmt(s.createdAt)}{s.updatedAt && ` · Diubah ${fmt(s.updatedAt)}`}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {createOpen && (
        <Sheet
          onClose={() => setCreateOpen(false)}
          title="Tambah Perangkat"
          sub="Buat ID dan password untuk masjid baru"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setCreateOpen(false)}>Batal</button>
              <button className="btn btn-red" onClick={handleCreate} disabled={fLoading}>
                {fLoading ? <><span className="spinner" />Membuat...</> : `Buat${validIdsCount > 1 ? ` (${validIdsCount})` : ''}`}
              </button>
            </>
          }
        >
          <div className="input-wrap">
            <label className="input-label">Nama Pemilik</label>
            <input className="input-field" value={fOwner} onChange={e => setFOwner(e.target.value)} placeholder="Nama pemilik / pengurus" />
          </div>
          <div className="input-wrap">
            <label className="input-label">Nama Masjid</label>
            <input className="input-field" value={fMosque} onChange={e => setFMosque(e.target.value)} placeholder="Nama masjid" />
          </div>
          <div className="input-wrap">
            <label className="input-label">ID Perangkat (4 angka) — bisa lebih dari 1</label>
            <div className="ids-input-list">
              {fIds.map((id, i) => (
                <div key={i} className="id-input-row">
                  <input className="input-field" value={id} onChange={e => updateId(i, e.target.value)} placeholder="1234" maxLength={4} />
                  {fIds.length > 1 && <button className="id-remove-btn" onClick={() => removeIdField(i)}>×</button>}
                </div>
              ))}
            </div>
            <button className="add-id-btn" onClick={addIdField}>＋ Tambah ID Layar Lain</button>
          </div>
          <div className="input-wrap" style={{ marginBottom: 0 }}>
            <label className="input-label">Password (sama untuk semua layar)</label>
            <input className="input-field" value={fPw} onChange={e => setFPw(e.target.value)} placeholder="Minimal 4 karakter" />
          </div>
          {fErr && <div className="error-box" style={{ marginTop: 12 }}>{fErr}</div>}
        </Sheet>
      )}

      {pwOpen && (
        <Sheet
          onClose={() => setPwOpen(false)}
          title="Ubah Password"
          sub={`Perangkat ID: ${activeScreen?.id} — ${activeScreen?.mosqueName || 'tanpa nama'}`}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setPwOpen(false)}>Batal</button>
              <button className="btn btn-amber" onClick={handleChangePw} disabled={fLoading}>
                {fLoading ? <><span className="spinner" />Menyimpan...</> : '🔑 Simpan'}
              </button>
            </>
          }
        >
          <div className="input-wrap" style={{ marginBottom: 0 }}>
            <label className="input-label">Password Baru</label>
            <input className="input-field" value={fPw} onChange={e => setFPw(e.target.value)} placeholder="Minimal 4 karakter" />
          </div>
          {fErr && <div className="error-box" style={{ marginTop: 12 }}>{fErr}</div>}
        </Sheet>
      )}

      {deleteOpen && (
        <Sheet
          onClose={() => setDeleteOpen(false)}
          title={<span style={{ color:'var(--red)' }}>Hapus Perangkat?</span>}
          sub={`ID ${activeScreen?.id} (${activeScreen?.mosqueName || 'tanpa nama'}) akan dihapus permanen. Tidak dapat dibatalkan.`}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeleteOpen(false)}>Batal</button>
              <button className="btn btn-destructive" onClick={handleDelete} disabled={fLoading}>
                {fLoading ? <><span className="spinner" />Menghapus...</> : '🗑️ Hapus'}
              </button>
            </>
          }
        >
          <div style={{ padding:'8px 0' }} />
        </Sheet>
      )}
    </div>
  )
}

export default function SuperAdminPanel() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('sa-token')
    if (savedToken) setToken(savedToken)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('sa-token')
    setToken(null)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="bg-mesh" />
      {!token ? <Login onLogin={setToken} /> : <Dashboard token={token} onLogout={handleLogout} />}
    </>
  )
}