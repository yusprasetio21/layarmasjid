'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Shield,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Trash2,
  Key,
  Monitor,
  Copy,
  Check,
  Palette,
} from 'lucide-react'

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

// ─── Login Screen ────────────────────────────────────────────────────
function SuperAdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = useCallback(async () => {
    setError('')
    if (!username || !password) {
      setError('Username dan password wajib diisi')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login gagal')
      onLogin(data.token)
      toast.success('Berhasil masuk sebagai Superadmin')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login gagal'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [username, password, onLogin])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <CardTitle className="text-xl text-zinc-100">
            Superadmin
          </CardTitle>
          <CardDescription className="text-zinc-500">
            Kelola semua perangkat MasjidScreen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="bg-zinc-800 border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600"
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password superadmin"
                className="bg-zinc-800 border-zinc-700 pr-10 text-zinc-200 placeholder:text-zinc-600"
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-400">
              {error}
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Masuk Superadmin
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Superadmin Dashboard ────────────────────────────────────────────
function SuperAdminDashboard({ token }: { token: string }) {
  const [screens, setScreens] = useState<ScreenInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [createId, setCreateId] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createOwnerName, setCreateOwnerName] = useState('')
  const [createMosqueName, setCreateMosqueName] = useState('')
  const [createError, setCreateError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  const [changePwOpen, setChangePwOpen] = useState(false)
  const [changePwId, setChangePwId] = useState('')
  const [changePwPassword, setChangePwPassword] = useState('')
  const [changePwError, setChangePwError] = useState('')
  const [changePwLoading, setChangePwLoading] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }), [token])

  const fetchScreens = useCallback(async () => {
    try {
      const res = await fetch('/api/superadmin', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil data')
      setScreens(data.screens)
    } catch (err) {
      console.error('Fetch screens error:', err)
      toast.error('Gagal mengambil data perangkat')
    }
  }, [token])

  useEffect(() => {
    fetchScreens().finally(() => setLoading(false))
  }, [fetchScreens])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchScreens()
    setRefreshing(false)
    toast.success('Data diperbarui')
  }, [fetchScreens])

  const handleCreate = useCallback(async () => {
    setCreateError('')
    if (!createId || createId.length !== 4 || !/^\d{4}$/.test(createId)) {
      setCreateError('ID harus 4 angka')
      return
    }
    if (!createPassword || createPassword.length < 4) {
      setCreateError('Password minimal 4 karakter')
      return
    }
    setCreateLoading(true)
    try {
      const res = await fetch('/api/screens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: createId, password: createPassword, ownerName: createOwnerName, mosqueName: createMosqueName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal membuat perangkat')
      toast.success(`Perangkat ${createId} berhasil dibuat!`)
      setCreateOpen(false)
      setCreateId('')
      setCreatePassword('')
      setCreateOwnerName('')
      setCreateMosqueName('')
      fetchScreens()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal'
      setCreateError(msg)
    } finally {
      setCreateLoading(false)
    }
  }, [createId, createPassword, createOwnerName, createMosqueName, fetchScreens])

  const handleChangePassword = useCallback(async () => {
    setChangePwError('')
    if (!changePwPassword || changePwPassword.length < 4) {
      setChangePwError('Password minimal 4 karakter')
      return
    }
    setChangePwLoading(true)
    try {
      const res = await fetch('/api/superadmin', {
        method: 'PATCH',
        headers: fetchHeaders(),
        body: JSON.stringify({ id: changePwId, password: changePwPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah password')
      toast.success(`Password perangkat ${changePwId} berhasil diubah`)
      setChangePwOpen(false)
      setChangePwPassword('')
      fetchScreens()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal'
      setChangePwError(msg)
    } finally {
      setChangePwLoading(false)
    }
  }, [changePwId, changePwPassword, fetchHeaders, fetchScreens])

  const handleDelete = useCallback(async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/superadmin?id=${deleteId}`, {
        method: 'DELETE',
        headers: fetchHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus')
      toast.success(`Perangkat ${deleteId} berhasil dihapus`)
      setDeleteOpen(false)
      fetchScreens()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal'
      toast.error(msg)
    } finally {
      setDeleteLoading(false)
    }
  }, [deleteId, fetchHeaders, fetchScreens])

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }, [])

  const openChangePassword = useCallback((screen: ScreenInfo) => {
    setChangePwId(screen.id)
    setChangePwPassword('')
    setChangePwError('')
    setChangePwOpen(true)
  }, [])

  const openDelete = useCallback((screen: ScreenInfo) => {
    setDeleteId(screen.id)
    setDeleteOpen(true)
  }, [])

  const handleLogout = useCallback(() => {
    setToken(null)
    toast.info('Keluar dari Superadmin')
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-red-400" />
          <span className="text-sm text-zinc-500">Memuat data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-400" />
            <h1 className="text-sm font-semibold text-zinc-200">
              Superadmin Panel
            </h1>
            <Badge className="border-red-500/30 bg-red-500/10 text-red-400 text-[10px]">
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/superadmin/themes">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-[11px] text-zinc-400 hover:text-purple-400"
              >
                <Palette className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Theme Designer</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-8 gap-1 text-[11px] text-zinc-400 hover:text-zinc-200"
            >
              {refreshing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : null}
              Refresh
            </Button>
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-[11px] text-zinc-400 hover:text-amber-400"
              >
                <Monitor className="h-3 w-3" />
                Tampilan
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-zinc-500 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl space-y-4 p-4">
          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-2xl font-bold text-zinc-100">{screens.length}</div>
              <div className="text-xs text-zinc-500">Total Perangkat</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setCreateId('')
                setCreatePassword('')
                setCreateOwnerName('')
                setCreateMosqueName('')
                setCreateError('')
                setCreateOpen(true)
              }}
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
            >
              <Plus className="h-4 w-4" />
              Tambah Perangkat
            </Button>
          </div>

          <Separator className="bg-zinc-800" />

          {/* Screen list */}
          {screens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Monitor className="h-12 w-12 text-zinc-800" />
              <p className="mt-4 text-sm text-zinc-500">Belum ada perangkat terdaftar</p>
              <p className="mt-1 text-xs text-zinc-600">
                Klik &quot;Tambah Perangkat&quot; untuk menambahkan perangkat baru
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {screens.map((screen) => (
                <Card key={screen.id} className="border-zinc-800 bg-zinc-900">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-zinc-500" />
                          <span className="font-mono text-lg font-bold text-zinc-100">
                            {screen.id}
                          </span>
                          <Badge className="border-zinc-700 bg-zinc-800 text-zinc-400 text-[10px]">
                            Perangkat
                          </Badge>
                        </div>
                        {screen.ownerName && (
                          <div className="mt-1 text-xs text-zinc-400">
                            <span className="text-zinc-500">Pemilik:</span> {screen.ownerName}
                          </div>
                        )}
                        {screen.mosqueName && (
                          <div className="mt-0.5 text-xs text-zinc-400">
                            <span className="text-zinc-500">Masjid:</span> {screen.mosqueName}
                          </div>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <Key className="h-3 w-3 text-zinc-600" />
                          <span className="font-mono text-xs text-zinc-400">
                            Password: {screen.password}
                          </span>
                          <button
                            onClick={() => copyToClipboard(screen.password, `pw-${screen.id}`)}
                            className="text-zinc-600 hover:text-zinc-400"
                          >
                            {copiedId === `pw-${screen.id}` ? (
                              <Check className="h-3 w-3 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-600">
                          <span>Dibuat: {new Date(screen.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          {screen.updatedAt && (
                            <span>· Diubah: {new Date(screen.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                        </div>
                        {(screen.config as Record<string, unknown>)?.mosqueName && (
                          <div className="mt-2 text-xs text-zinc-500">
                            {String(screen.config.mosqueName)}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openChangePassword(screen)}
                          className="h-8 w-8 text-zinc-600 hover:text-amber-400"
                          title="Ubah Password"
                        >
                          <Key className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(screen)}
                          className="h-8 w-8 text-zinc-600 hover:text-red-400"
                          title="Hapus Perangkat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Create Device Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Tambah Perangkat Baru</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Buat Device ID dan password untuk perangkat baru
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Nama Pemilik</Label>
              <Input
                value={createOwnerName}
                onChange={(e) => setCreateOwnerName(e.target.value)}
                placeholder="Nama pemilik perangkat"
                className="bg-zinc-800 border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Nama Masjid</Label>
              <Input
                value={createMosqueName}
                onChange={(e) => setCreateMosqueName(e.target.value)}
                placeholder="Nama masjid"
                className="bg-zinc-800 border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">ID Perangkat (4 angka)</Label>
              <Input
                value={createId}
                onChange={(e) => setCreateId(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Contoh: 1234"
                className="bg-zinc-800 border-zinc-700 text-sm text-zinc-200 font-mono placeholder:text-zinc-600"
                maxLength={4}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Password</Label>
              <Input
                type="text"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Minimal 4 karakter"
                className="bg-zinc-800 border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600"
              />
            </div>
            {createError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-400">
                {createError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              className="text-zinc-400"
            >
              Batal
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createLoading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {createLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : (
                'Buat Perangkat'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePwOpen} onOpenChange={setChangePwOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              Ubah Password — {changePwId}
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Masukkan password baru untuk perangkat ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Password Baru</Label>
              <Input
                type="text"
                value={changePwPassword}
                onChange={(e) => setChangePwPassword(e.target.value)}
                placeholder="Minimal 4 karakter"
                className="bg-zinc-800 border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600"
              />
            </div>
            {changePwError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-400">
                {changePwError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setChangePwOpen(false)}
              className="text-zinc-400"
            >
              Batal
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changePwLoading}
              className="bg-amber-500 text-black hover:bg-amber-600"
            >
              {changePwLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900">
          <DialogHeader>
            <DialogTitle className="text-red-400">Hapus Perangkat?</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Perangkat dengan ID <strong className="text-zinc-300">{deleteId}</strong> akan dihapus permanen beserta semua konfigurasinya. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
              className="text-zinc-400"
            >
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteLoading}
              variant="destructive"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Hapus Permanen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────
export default function SuperAdminPanel() {
  const [token, setToken] = useState<string | null>(null)

  if (!token) {
    return <SuperAdminLogin onLogin={setToken} />
  }

  return <SuperAdminDashboard token={token} />
}
