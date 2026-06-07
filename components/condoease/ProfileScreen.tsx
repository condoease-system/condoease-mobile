'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Calendar, ChevronRight, Edit3, Home, LogOut, Mail, Phone, Shield, X } from 'lucide-react'
import { saveStoredUser, updatePassword, updateProfile, type ApiUser } from '@/lib/api'
import { useMobileData } from './mobile-data'

interface ProfileScreenProps {
  user?: ApiUser | null
  onUserUpdate: (user: ApiUser) => void
  onLogout: () => void
}

export function ProfileScreen({ user, onUserUpdate, onLogout }: ProfileScreenProps) {
  const { tenant } = useMobileData()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '')
  const [savingPhoto, setSavingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [photoNotice, setPhotoNotice] = useState<string | null>(null)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [securityOpen, setSecurityOpen] = useState(false)
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || tenant.name || 'Resident'
  const initials = [user?.firstName, user?.lastName].filter(Boolean).map(name => name?.[0]).join('').slice(0, 2) || tenant.avatar || 'R'
  const address = [user?.unitStreet, user?.barangay, user?.city, user?.region].filter(Boolean).join(', ')

  const handlePhotoChange = (file?: File) => {
    setPhotoError(null)
    setPhotoNotice(null)
    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setPhotoError('Profile photo must be JPG or PNG.')
      return
    }

    if (file.size > 1.5 * 1024 * 1024) {
      setPhotoError('Profile photo must be 1.5 MB or smaller.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      void savePhoto(String(reader.result ?? ''))
    }
    reader.onerror = () => setPhotoError('Unable to read the selected photo.')
    reader.readAsDataURL(file)
  }

  const savePhoto = async (nextPhotoUrl: string) => {
    setSavingPhoto(true)
    setPhotoError(null)
    setPhotoNotice(null)
    setPhotoUrl(nextPhotoUrl)

    try {
      const response = await updateProfile({ photoUrl: nextPhotoUrl })
      saveStoredUser(response.user)
      onUserUpdate(response.user)
      setPhotoNotice('Profile photo updated.')
    } catch (error) {
      setPhotoUrl(user?.photoUrl || '')
      setPhotoError(error instanceof Error ? error.message : 'Unable to update profile photo.')
    } finally {
      setSavingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col h-full mobile-scroll" style={{ background: '#F4F6FA' }}>
      <div
        className="px-5 pt-12 pb-8 flex flex-col items-center"
        style={{ background: 'linear-gradient(150deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={event => handlePhotoChange(event.target.files?.[0])}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={savingPhoto}
          className="relative w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 overflow-hidden active:opacity-80"
          style={{ backgroundColor: '#FF8A1C' }}
          aria-label="Change profile photo"
        >
          {photoUrl ? (
            <Image src={photoUrl} alt="Profile" fill sizes="80px" unoptimized className="object-cover" />
          ) : (
            initials
          )}
          <span className="absolute bottom-0 right-0 h-7 w-7 rounded-full flex items-center justify-center" style={{ background: '#FFFFFF', color: '#243660', border: '2px solid #243660' }}>
            {savingPhoto ? <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" /> : <Camera size={14} />}
          </span>
        </button>
        <h1 className="text-xl font-bold text-white">{fullName}</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{tenant.unit}</p>
        {(photoError || photoNotice) && (
          <p className="mt-3 rounded-xl px-3 py-2 text-center text-xs font-semibold" style={{ background: photoError ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.18)', color: '#FFFFFF' }}>
            {photoError || photoNotice}
          </p>
        )}

        <div
          className="mt-4 px-4 py-2 rounded-xl flex items-center gap-2"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Home size={14} color="rgba(255,255,255,0.7)" />
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {tenant.building}
          </span>
        </div>
      </div>

      <div className="mx-5 mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#9AABC4' }}>Unit Information</p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {[
            { icon: Home, label: 'Unit', value: tenant.unit },
            { icon: Home, label: 'Floor', value: tenant.floor },
            { icon: Calendar, label: 'Address', value: address || tenant.address || 'No address on file' },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-4 px-5 py-4 border-b last:border-b-0" style={{ borderColor: '#F1F5F9' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
                <item.icon size={16} color="#243660" />
              </div>
              <div className="flex-1">
                <p className="text-xs" style={{ color: '#9AABC4' }}>{item.label}</p>
                <p className="text-sm font-semibold" style={{ color: '#1A2847' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-5 mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#9AABC4' }}>Contact Details</p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {[
            { icon: Mail, label: 'Email', value: user?.email || tenant.email },
            { icon: Phone, label: 'Phone', value: user?.contactNumber || tenant.phone },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-4 px-5 py-4 border-b last:border-b-0" style={{ borderColor: '#F1F5F9' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
                <item.icon size={16} color="#243660" />
              </div>
              <div className="flex-1">
                <p className="text-xs" style={{ color: '#9AABC4' }}>{item.label}</p>
                <p className="text-sm font-semibold" style={{ color: '#1A2847' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-5 mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#9AABC4' }}>Settings</p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {[
            { icon: Edit3, label: 'Edit Profile', desc: 'Update personal details', onClick: () => setEditOpen(true) },
            { icon: Shield, label: 'Security', desc: 'Change password', onClick: () => setSecurityOpen(true) },
          ].map((item, index) => (
            <button key={index} onClick={item.onClick} className="w-full flex items-center gap-4 px-5 py-4 border-b last:border-b-0 text-left" style={{ borderColor: '#F1F5F9' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
                <item.icon size={16} color="#243660" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#1A2847' }}>{item.label}</p>
                <p className="text-xs" style={{ color: '#9AABC4' }}>{item.desc}</p>
              </div>
              <ChevronRight size={16} color="#9AABC4" />
            </button>
          ))}
        </div>
      </div>

      <div className="mx-5 mt-5 mb-8">
        <button
          onClick={() => setConfirmLogout(true)}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:opacity-80"
          style={{ backgroundColor: '#FFF1F0', color: '#EF4444', border: '1.5px solid #FECACA' }}
        >
          <LogOut size={18} />
          Log Out
        </button>
        <p className="text-center text-xs mt-3" style={{ color: '#9AABC4' }}>CondoEase v1.0.0 - Tenant App</p>
      </div>

      {editOpen && (
        <EditProfileSheet
          user={user}
          onClose={() => setEditOpen(false)}
          onSaved={(nextUser) => {
            saveStoredUser(nextUser)
            onUserUpdate(nextUser)
            setPhotoUrl(nextUser.photoUrl || '')
            setEditOpen(false)
          }}
        />
      )}

      {securityOpen && (
        <SecuritySheet onClose={() => setSecurityOpen(false)} />
      )}

      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(26,40,71,0.45)' }}>
          <div className="flex-1" onClick={() => setConfirmLogout(false)} />
          <div className="rounded-t-3xl bg-white px-6 pb-6 pt-4 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#1A2847' }}>Log out?</h2>
                <p className="mt-1 text-sm" style={{ color: '#5A6A8A' }}>
                  You will need to sign in again to access your tenant portal.
                </p>
              </div>
              <button onClick={() => setConfirmLogout(false)} className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: '#F4F6FA' }}>
                <X size={18} color="#5A6A8A" />
              </button>
            </div>
            <button
              onClick={onLogout}
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
              style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
            >
              <LogOut size={18} />
              Log Out
            </button>
            <button
              onClick={() => setConfirmLogout(false)}
              className="mt-3 w-full py-3 text-sm font-semibold"
              style={{ color: '#5A6A8A' }}
            >
              Stay Signed In
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EditProfileSheet({
  user,
  onClose,
  onSaved,
}: {
  user?: ApiUser | null
  onClose: () => void
  onSaved: (user: ApiUser) => void
}) {
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    contactNumber: user?.contactNumber || '',
    unitStreet: user?.unitStreet || '',
    barangay: user?.barangay || '',
    city: user?.city || '',
    region: user?.region || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (field: keyof typeof form, value: string) => {
    setForm(current => ({ ...current, [field]: value }))
    setError(null)
  }

  const save = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        contactNumber: form.contactNumber.trim(),
        unitStreet: form.unitStreet.trim(),
        barangay: form.barangay.trim(),
        city: form.city.trim(),
        region: form.region.trim(),
      })
      onSaved(response.user)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(26,40,71,0.45)' }}>
      <div className="flex-1" onClick={saving ? undefined : onClose} />
      <div className="max-h-[86vh] rounded-t-3xl bg-white px-6 pb-6 pt-4 shadow-xl mobile-scroll">
        <SheetHeader title="Edit Profile" desc="Update your tenant profile details." onClose={onClose} disabled={saving} />
        <div className="flex flex-col gap-3">
          <SheetInput label="First Name" value={form.firstName} onChange={value => update('firstName', value)} />
          <SheetInput label="Last Name" value={form.lastName} onChange={value => update('lastName', value)} />
          <SheetInput label="Contact Number" value={form.contactNumber} onChange={value => update('contactNumber', value)} inputMode="tel" />
          <SheetInput label="Unit / Street" value={form.unitStreet} onChange={value => update('unitStreet', value)} />
          <SheetInput label="Barangay" value={form.barangay} onChange={value => update('barangay', value)} />
          <SheetInput label="City" value={form.city} onChange={value => update('city', value)} />
          <SheetInput label="Region" value={form.region} onChange={value => update('region', value)} />
          {error && <SheetMessage tone="error">{error}</SheetMessage>}
          <SheetPrimaryButton loading={saving} label="Save Changes" onClick={save} />
        </div>
      </div>
    </div>
  )
}

function SecuritySheet({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const save = async () => {
    if (!currentPassword) {
      setError('Current password is required.')
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSaving(true)
    setError(null)
    setNotice(null)

    try {
      await updatePassword({ currentPassword, newPassword, confirmPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setNotice('Password updated.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(26,40,71,0.45)' }}>
      <div className="flex-1" onClick={saving ? undefined : onClose} />
      <div className="rounded-t-3xl bg-white px-6 pb-6 pt-4 shadow-xl">
        <SheetHeader title="Security" desc="Change your account password." onClose={onClose} disabled={saving} />
        <div className="flex flex-col gap-3">
          <SheetInput label="Current Password" value={currentPassword} onChange={(value) => { setCurrentPassword(value); setError(null); setNotice(null) }} type="password" />
          <SheetInput label="New Password" value={newPassword} onChange={(value) => { setNewPassword(value); setError(null); setNotice(null) }} type="password" />
          <SheetInput label="Confirm Password" value={confirmPassword} onChange={(value) => { setConfirmPassword(value); setError(null); setNotice(null) }} type="password" />
          {error && <SheetMessage tone="error">{error}</SheetMessage>}
          {notice && <SheetMessage tone="success">{notice}</SheetMessage>}
          <SheetPrimaryButton loading={saving} label="Update Password" onClick={save} />
        </div>
      </div>
    </div>
  )
}

function SheetHeader({ title, desc, onClose, disabled }: { title: string; desc: string; onClose: () => void; disabled?: boolean }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold" style={{ color: '#1A2847' }}>{title}</h2>
        <p className="mt-1 text-sm" style={{ color: '#5A6A8A' }}>{desc}</p>
      </div>
      <button onClick={onClose} disabled={disabled} className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: '#F4F6FA' }}>
        <X size={18} color="#5A6A8A" />
      </button>
    </div>
  )
}

function SheetInput({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: '#1A2847' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        inputMode={inputMode}
        className="rounded-xl px-4 py-3.5 text-sm outline-none"
        style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', color: '#1A2847' }}
      />
    </div>
  )
}

function SheetMessage({ tone, children }: { tone: 'error' | 'success'; children: string }) {
  return (
    <div
      className="rounded-xl p-3 text-xs font-medium"
      style={{
        background: tone === 'error' ? '#FEF2F2' : '#F0FDF4',
        color: tone === 'error' ? '#DC2626' : '#15803D',
        border: tone === 'error' ? '1px solid #FECACA' : '1px solid #BBF7D0',
      }}
    >
      {children}
    </div>
  )
}

function SheetPrimaryButton({ loading, label, onClick }: { loading: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="mt-1 flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-white text-base transition-opacity active:opacity-80"
      style={{ backgroundColor: '#243660' }}
    >
      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : label}
    </button>
  )
}
