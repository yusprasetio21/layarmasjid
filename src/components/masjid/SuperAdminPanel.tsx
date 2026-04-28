'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface ScreenInfo { id:string; password:string; ownerName:string; mosqueName:string; config:Record<string,unknown>; createdAt:string; updatedAt:string|null }

const css = `
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --g:rgba(255,255,255,.08);--gb:rgba(255,255,255,.14);--gh:rgba(255,255,255,.13);
  --r:#ff3b30;--rs:rgba(255,59,48,.18);--a:#ff9f0a;--g2:#30d158;--gs:rgba(48,209,88,.18);
  --tp:rgba(255,255,255,.95);--ts:rgba(255,255,255,.55);--tt:rgba(255,255,255,.3);
  --bg:#0a0a0f;--dv:rgba(255,255,255,.08);--ib:rgba(255,255,255,.07);--ibr:rgba(255,255,255,.12);
  --sb:rgba(20,20,28,.97)
}
[data-theme="light"]{
  --g:rgba(0,0,0,.04);--gb:rgba(0,0,0,.12);--gh:rgba(0,0,0,.07);
  --r:#d32f2f;--rs:rgba(211,47,47,.1);--a:#b45f06;--g2:#1b7a2e;--gs:rgba(27,122,46,.12);
  --tp:rgba(0,0,0,.88);--ts:rgba(0,0,0,.55);--tt:rgba(0,0,0,.35);
  --bg:#f2f2f7;--dv:rgba(0,0,0,.1);--ib:rgba(0,0,0,.05);--ibr:rgba(0,0,0,.15);
  --sb:rgba(242,242,247,.98)
}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg);color:var(--tp);min-height:100vh;overflow-x:hidden;transition:background .3s,color .3s}
.bg-mesh{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 50% at 20% 20%,rgba(255,59,48,.07)0%,transparent 60%),radial-gradient(ellipse 50% 60% at 80% 80%,rgba(10,132,255,.05)0%,transparent 60%);transition:opacity .3s}
[data-theme="light"] .bg-mesh{opacity:.4}
.screen{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column}
.glass{background:var(--g);border:1px solid var(--gb);backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);border-radius:20px}
.login-wrap{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.login-card{width:100%;max-width:360px;padding:36px 24px 28px}
.login-icon{width:68px;height:68px;border-radius:20px;background:linear-gradient(135deg,rgba(255,59,48,.25),rgba(255,59,48,.08));border:1px solid rgba(255,59,48,.25);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:28px}
.login-title{font-size:24px;font-weight:700;text-align:center;margin-bottom:6px}
.login-sub{font-size:13px;color:var(--ts);text-align:center;margin-bottom:28px}
.input-wrap{margin-bottom:12px}
.input-label{font-size:11px;font-weight:600;color:var(--ts);text-transform:uppercase;margin-bottom:7px;display:block}
.input-field{width:100%;background:var(--ib);border:1px solid var(--ibr);border-radius:12px;padding:12px 14px;font-size:15px;color:var(--tp);outline:none;transition:border .2s,background .2s;font-family:inherit}
.input-field::placeholder{color:var(--tt)}
.input-field:focus{border-color:var(--r);background:var(--ib)}
.pw-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--tt);cursor:pointer;font-size:17px}
.input-pw-wrap{position:relative}
.input-pw-wrap .input-field{padding-right:46px}
.error-box{background:rgba(255,59,48,.1);border:1px solid rgba(255,59,48,.2);border-radius:10px;padding:10px 14px;font-size:13px;color:#ff6961;text-align:center;margin-bottom:14px}
.btn{display:flex;align-items:center;justify-content:center;gap:7px;border:none;border-radius:13px;font-weight:600;cursor:pointer;transition:.18s;font-size:15px}
.btn:active{transform:scale(.97)}
.btn:disabled{opacity:.5;pointer-events:none}
.btn-red{background:var(--r);color:#fff;padding:13px 18px;width:100%;box-shadow:0 4px 16px rgba(255,59,48,.25)}
.btn-ghost{background:var(--g);border:1px solid var(--gb);color:var(--ts);padding:10px 14px}
.btn-ghost:hover:not(:disabled){background:var(--gh);color:var(--tp)}
.btn-amber{background:var(--a);color:#fff;padding:13px 18px;width:100%}
.btn-destructive{background:var(--rs);border:1px solid rgba(255,59,48,.25);color:var(--r);padding:13px 18px;width:100%}
.btn-icon{width:34px;height:34px;border-radius:9px;background:var(--g);border:1px solid var(--gb);color:var(--tt);font-size:15px;transition:.2s}
.btn-icon:hover{color:var(--tp);background:var(--gh)}
.btn-icon.danger:hover{color:var(--r);background:var(--rs)}
.btn-icon.warning:hover{color:var(--a);background:rgba(255,159,10,.15)}
/* Header */
.header{position:sticky;top:0;z-index:50;padding:8px 12px;padding-top:max(8px,env(safe-area-inset-top));background:rgba(10,10,15,.75);backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);border-bottom:1px solid var(--dv);display:flex;align-items:center;justify-content:space-between;transition:.3s}
[data-theme="light"] .header{background:rgba(242,242,247,.8)}
.header-left{display:flex;align-items:center;gap:6px}
.header-icon{width:28px;height:28px;background:var(--rs);border:1px solid rgba(255,59,48,.25);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px}
.header-title{font-size:15px;font-weight:700}
.badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;text-transform:uppercase}
.badge-red{background:var(--rs);color:var(--r);border:1px solid rgba(255,59,48,.2)}
.badge-green{background:var(--gs);color:var(--g2);border:1px solid rgba(48,209,88,.2)}
.header-actions{display:flex;align-items:center;gap:5px}
.theme-pill{display:flex;align-items:center;gap:4px;background:var(--g);border:1px solid var(--gb);border-radius:20px;padding:4px 9px;font-size:11px;font-weight:600;color:var(--ts);transition:.2s;white-space:nowrap}
.theme-pill:hover{background:var(--gh);color:var(--tp)}
/* Content */
.content{flex:1;padding:12px 16px;max-width:480px;margin:0 auto;width:100%;padding-bottom:max(20px,env(safe-area-inset-bottom))}
.stats-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.stat-card{padding:16px 14px}
.stat-num{font-size:30px;font-weight:700;line-height:1;margin-bottom:3px}
.stat-label{font-size:11px;color:var(--ts)}
.add-btn{width:100%;padding:15px;font-size:15px;border-radius:14px;margin-bottom:20px;background:linear-gradient(135deg,rgba(255,59,48,.9),rgba(255,59,48,.7));border:1px solid rgba(255,59,48,.35);box-shadow:0 6px 24px rgba(255,59,48,.18),inset 0 1px 0 rgba(255,255,255,.1)}
.section-header{font-size:12px;font-weight:600;color:var(--ts);text-transform:uppercase;margin-bottom:10px}
.device-card{padding:16px;margin-bottom:10px;transition:.2s}
.device-card:active{transform:scale(.99)}
.device-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}
.device-id-row{display:flex;align-items:center;gap:8px}
.device-id-badge{font-size:20px;font-weight:800;font-variant-numeric:tabular-nums}
.device-actions{display:flex;gap:5px}
.device-info{margin-bottom:10px}
.device-info-row{display:flex;align-items:center;gap:6px;margin-bottom:4px}
.device-info-label{font-size:11px;color:var(--tt);min-width:48px}
.device-info-val{font-size:13px;color:var(--tp)}
.pw-row{display:flex;align-items:center;gap:8px;background:var(--ib);border:1px solid var(--ibr);border-radius:10px;padding:9px 12px;margin-bottom:10px}
.pw-label{font-size:11px;color:var(--tt)}
.pw-val{font-size:13px;font-family:monospace;color:var(--ts);flex:1}
.copy-btn{background:none;border:none;color:var(--tt);cursor:pointer;font-size:14px}
.copy-btn.copied{color:var(--g2)}
.device-date{font-size:11px;color:var(--tt)}
.empty{text-align:center;padding:50px 20px}
.empty-icon{font-size:44px;margin-bottom:14px;opacity:.3}
.empty-title{font-size:16px;font-weight:600;margin-bottom:5px;color:var(--ts)}
.empty-sub{font-size:13px;color:var(--tt)}
/* Dialog / Sheet */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(8px);z-index:100;display:flex;align-items:center;justify-content:center;overflow-x:hidden;animation:fadeIn .2s}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.dialog{width:calc(100% - 40px);max-width:340px;max-height:70vh;background:var(--sb);backdrop-filter:blur(60px);-webkit-backdrop-filter:blur(60px);border:1px solid var(--gb);border-radius:24px;padding:24px 20px 20px;display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;animation:popIn .25s cubic-bezier(0.34,1.56,0.64,1)}
@keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
.dialog-header{margin-bottom:16px}
.dialog-title{font-size:19px;font-weight:700;margin-bottom:4px}
.dialog-sub{font-size:13px;color:var(--ts)}
.dialog-body{flex:1;overflow-y:auto;padding:0 4px 16px 0;margin-right:-4px}
.dialog-footer{display:flex;gap:8px;padding-top:8px;border-top:1px solid var(--dv)}
.dialog-footer .btn-ghost{flex:1}
.dialog-footer .btn-red,.dialog-footer .btn-amber,.dialog-footer .btn-destructive{flex:2}
.ids-input-list{display:flex;flex-direction:column;gap:8px;margin-bottom:8px}
.id-input-row{display:flex;align-items:center;gap:8px}
.id-input-row .input-field{flex:1;font-variant-numeric:tabular-nums;font-size:18px;font-weight:700;text-align:center}
.id-remove-btn{width:32px;height:32px;border-radius:8px;background:var(--rs);border:1px solid rgba(255,59,48,.2);color:var(--r);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.add-id-btn{display:flex;align-items:center;gap:6px;padding:9px 14px;background:var(--g);border:1px solid var(--gb);border-radius:10px;font-size:13px;font-weight:600;color:var(--ts);width:100%;justify-content:center;cursor:pointer}
.add-id-btn:hover{background:var(--gh);color:var(--tp)}
.spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.3);border-top-color:currentColor;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
`

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
    } catch (e: any) { setErr(e.message) }
    finally { setLoading(false) }
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

function Dialog({ open, onClose, title, sub, footer, children }: { open: boolean, onClose: () => void, title: React.ReactNode, sub?: string, footer: React.ReactNode, children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="dialog">
        <div className="dialog-header">
          <div className="dialog-title">{title}</div>
          {sub && <div className="dialog-sub">{sub}</div>}
        </div>
        <div className="dialog-body">{children}</div>
        <div className="dialog-footer">{footer}</div>
      </div>
    </div>
  )
}

function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [screens, setScreens] = useState<ScreenInfo[]>([])
  const [loading, setLoading] = useState(true)
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
    const t = localStorage.getItem('sa-theme') as 'dark' | 'light' | null
    if (t) { setTheme(t); document.documentElement.setAttribute('data-theme', t) }
  }, [])

  const toggleTheme = () => {
    const n = theme === 'dark' ? 'light' : 'dark'
    setTheme(n); document.documentElement.setAttribute('data-theme', n); localStorage.setItem('sa-theme', n)
  }

  const headers = useCallback(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/superadmin', { headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 401) { localStorage.removeItem('sa-token'); onLogout(); return }
      const data = await res.json()
      if (res.ok) setScreens(data.screens)
    } catch (e) { console.error(e) }
  }, [token, onLogout])

  useEffect(() => { load().finally(() => setLoading(false)) }, [load])

  const copy = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopiedId(key); setTimeout(() => setCopiedId(null), 2000) }

  const addIdField = () => setFIds(prev => [...prev, ''])
  const removeIdField = (i: number) => setFIds(prev => prev.filter((_, idx) => idx !== i))
  const updateId = (i: number, v: string) => setFIds(prev => prev.map((x, idx) => idx === i ? v.replace(/\D/g, '').slice(0, 4) : x))

  const handleCreate = async () => {
    setFErr('')
    const validIds = fIds.filter(id => /^\d{4}$/.test(id))
    if (validIds.length === 0) { setFErr('Minimal 1 ID harus 4 angka'); return }
    if (!fPw || fPw.length < 4) { setFErr('Password minimal 4 karakter'); return }
    setFLoading(true)
    try {
      for (const id of validIds) {
        const res = await fetch('/api/screens', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, password: fPw, ownerName: fOwner, mosqueName: fMosque }) })
        const data = await res.json()
        if (!res.ok) throw new Error(`ID ${id}: ${data.error}`)
      }
      setCreateOpen(false); setFIds(['']); setFPw(''); setFOwner(''); setFMosque(''); load()
    } catch (e: any) { setFErr(e.message) } finally { setFLoading(false) }
  }

  const handleChangePw = async () => {
    setFErr('')
    if (!fPw || fPw.length < 4) { setFErr('Password minimal 4 karakter'); return }
    setFLoading(true)
    try {
      const res = await fetch('/api/superadmin', { method: 'PATCH', headers: headers(), body: JSON.stringify({ id: activeScreen?.id, password: fPw }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPwOpen(false); setFPw(''); load()
    } catch (e: any) { setFErr(e.message) } finally { setFLoading(false) }
  }

  const handleDelete = async () => {
    setFLoading(true)
    try {
      await fetch(`/api/superadmin?id=${activeScreen?.id}`, { method: 'DELETE', headers: headers() })
      setDeleteOpen(false); load()
    } catch (e) { console.error(e) } finally { setFLoading(false) }
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  const validCount = fIds.filter(id => /^\d{4}$/.test(id)).length

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}><span className="spinner" style={{ width: 26, height: 26, borderColor: 'rgba(128,128,128,.2)', borderTopColor: 'var(--r)' }} /><span style={{ fontSize: 13, color: 'var(--ts)' }}>Memuat...</span></div>

  const handleLogout = () => { localStorage.removeItem('sa-token'); onLogout() }

  return (
    <div className="screen">
      <div className="header">
        <div className="header-left">
          <div className="header-icon">🛡️</div>
          <span className="header-title">Superadmin</span>
          <span className="badge badge-red">Owner</span>
        </div>
        <div className="header-actions">
          <button className="theme-pill" onClick={toggleTheme}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          <button className="btn btn-ghost" style={{ padding: '6px 9px', fontSize: 12 }} onClick={() => load()}>↻</button>
          <Link href="/"><button className="btn btn-ghost" style={{ padding: '6px 9px', fontSize: 12 }}>📺</button></Link>
          <button className="btn btn-ghost" style={{ padding: '6px 9px', fontSize: 12 }} onClick={handleLogout}>↩️</button>
        </div>
      </div>

      <div className="content">
        <div className="stats-row">
          <div className="glass stat-card"><div className="stat-num" style={{ color: 'var(--r)' }}>{screens.length}</div><div className="stat-label">Total</div></div>
          <div className="glass stat-card"><div className="stat-num" style={{ color: 'var(--g2)' }}>{screens.length}</div><div className="stat-label">Aktif</div></div>
        </div>
        <button className="btn add-btn" onClick={() => { setFIds(['']); setFPw(''); setFOwner(''); setFMosque(''); setFErr(''); setCreateOpen(true) }}>＋ Tambah Perangkat</button>

        {screens.length === 0 ? (
          <div className="empty"><div className="empty-icon">📺</div><div className="empty-title">Belum ada perangkat</div><div className="empty-sub">Tap tombol di atas</div></div>
        ) : (
          <>
            <div className="section-header">Perangkat ({screens.length})</div>
            {screens.map(s => (
              <div key={s.id} className="glass device-card">
                <div className="device-header">
                  <div className="device-id-row"><span style={{ fontSize: 12, color: 'var(--tt)' }}>ID</span><span className="device-id-badge">{s.id}</span><span className="badge badge-green">Aktif</span></div>
                  <div className="device-actions">
                    <button className="btn btn-icon warning" onClick={() => { setActiveScreen(s); setFPw(''); setFErr(''); setPwOpen(true) }}>🔑</button>
                    <button className="btn btn-icon danger" onClick={() => { setActiveScreen(s); setDeleteOpen(true) }}>🗑️</button>
                  </div>
                </div>
                <div className="device-info">
                  {s.ownerName && <div className="device-info-row"><span className="device-info-label">Pemilik</span><span className="device-info-val">{s.ownerName}</span></div>}
                  {s.mosqueName && <div className="device-info-row"><span className="device-info-label">Masjid</span><span className="device-info-val">{s.mosqueName}</span></div>}
                </div>
                <div className="pw-row">
                  <span className="pw-label">Pass</span><span className="pw-val">{s.password}</span>
                  <button className={`copy-btn ${copiedId === `pw-${s.id}` ? 'copied' : ''}`} onClick={() => copy(s.password, `pw-${s.id}`)}>{copiedId === `pw-${s.id}` ? '✓' : '⎘'}</button>
                </div>
                <div className="device-date">Dibuat {fmt(s.createdAt)}{s.updatedAt && ` · Diubah ${fmt(s.updatedAt)}`}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Dialog Tambah Perangkat */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Tambah Perangkat" sub="ID & password untuk masjid baru"
        footer={<><button className="btn btn-ghost" onClick={() => setCreateOpen(false)}>Batal</button><button className="btn btn-red" onClick={handleCreate} disabled={fLoading}>{fLoading ? <span className="spinner" /> : `Buat${validCount > 1 ? ` (${validCount})` : ''}`}</button></>}
      >
        <div className="input-wrap"><label className="input-label">Pemilik</label><input className="input-field" value={fOwner} onChange={e => setFOwner(e.target.value)} placeholder="Nama pemilik" /></div>
        <div className="input-wrap"><label className="input-label">Masjid</label><input className="input-field" value={fMosque} onChange={e => setFMosque(e.target.value)} placeholder="Nama masjid" /></div>
        <div className="input-wrap">
          <label className="input-label">ID (4 angka)</label>
          <div className="ids-input-list">
            {fIds.map((id, i) => (
              <div key={i} className="id-input-row">
                <input className="input-field" value={id} onChange={e => updateId(i, e.target.value)} placeholder="1234" maxLength={4} />
                {fIds.length > 1 && <button className="id-remove-btn" onClick={() => removeIdField(i)}>×</button>}
              </div>
            ))}
          </div>
          <button className="add-id-btn" onClick={addIdField}>+ ID Lain</button>
        </div>
        <div className="input-wrap"><label className="input-label">Password</label><input className="input-field" value={fPw} onChange={e => setFPw(e.target.value)} placeholder="Min 4 karakter" /></div>
        {fErr && <div className="error-box">{fErr}</div>}
      </Dialog>

      {/* Dialog Ubah Password */}
      <Dialog open={pwOpen} onClose={() => setPwOpen(false)} title="Ubah Password" sub={`ID: ${activeScreen?.id}`}
        footer={<><button className="btn btn-ghost" onClick={() => setPwOpen(false)}>Batal</button><button className="btn btn-amber" onClick={handleChangePw} disabled={fLoading}>{fLoading ? <span className="spinner" /> : '🔑 Simpan'}</button></>}
      >
        <div className="input-wrap"><label className="input-label">Password Baru</label><input className="input-field" value={fPw} onChange={e => setFPw(e.target.value)} placeholder="Min 4 karakter" /></div>
        {fErr && <div className="error-box">{fErr}</div>}
      </Dialog>

      {/* Dialog Hapus */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title={<span style={{ color: 'var(--r)' }}>Hapus?</span>} sub={`ID ${activeScreen?.id} akan dihapus permanen`}
        footer={<><button className="btn btn-ghost" onClick={() => setDeleteOpen(false)}>Batal</button><button className="btn btn-destructive" onClick={handleDelete} disabled={fLoading}>{fLoading ? <span className="spinner" /> : '🗑️ Hapus'}</button></>}
      >
        <div style={{ padding: 8 }} />
      </Dialog>
    </div>
  )
}

export default function SuperAdminPanel() {
  const [token, setToken] = useState<string | null>(null)
  useEffect(() => { const t = localStorage.getItem('sa-token'); if (t) setToken(t) }, [])
  const logout = () => { localStorage.removeItem('sa-token'); setToken(null) }
  return <><style dangerouslySetInnerHTML={{ __html: css }} /><div className="bg-mesh" />{!token ? <Login onLogin={setToken} /> : <Dashboard token={token} onLogout={logout} />}</>
}