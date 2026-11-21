'use client'

import { useRef, useState } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'
import { Building2, Calendar, Camera, Edit3, Home, Layers, LogOut, Mail, Phone, Shield, X } from 'lucide-react'
import { saveStoredUser, updatePassword, updateProfile, type ApiUser } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useMobileData } from './mobile-data'
import { IconButton, IconChip, InlineAlert, ListCard, ListRow, MobileButton, MobileCard, Screen, ScreenBody, ScreenHeader, SectionTitle } from './mobile-kit'

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

  const email = user?.email || tenant.email

  return (
    <Screen>
      <ScreenHeader title="Profile" />

      <ScreenBody>
        {/* Profile header */}
        <MobileCard className="flex flex-col items-center px-4 pb-5 pt-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={event => handlePhotoChange(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={savingPhoto}
            className="relative mb-3 h-20 w-20 rounded-full active:opacity-80"
            aria-label="Change profile photo"
          >
            <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-primary text-2xl font-semibold text-primary-foreground ring-4 ring-primary/10">
              {photoUrl ? (
                <Image src={photoUrl} alt="Profile" fill sizes="80px" unoptimized className="object-cover" />
              ) : (
                initials
              )}
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-primary shadow-xs">
              {savingPhoto ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Camera className="h-3.5 w-3.5" />}
            </span>
          </button>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{fullName}</h2>
          {email && <p className="mt-0.5 text-sm text-muted-foreground">{email}</p>}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <Home className="h-3.5 w-3.5" />
              {tenant.unit}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              {tenant.building}
            </span>
          </div>
          {(photoError || photoNotice) && (
            <InlineAlert tone={photoError ? 'danger' : 'success'} className="mt-4 w-full px-3 py-2 text-center text-xs font-semibold">
              {photoError || photoNotice}
            </InlineAlert>
          )}
        </MobileCard>

        <section>
          <SectionTitle title="Unit Information" />
          <ListCard>
            <InfoRow icon={Home} label="Unit" value={tenant.unit} />
            <InfoRow icon={Layers} label="Floor" value={tenant.floor} />
            <InfoRow icon={Calendar} label="Address" value={address || tenant.address || 'No address on file'} />
          </ListCard>
        </section>

        <section>
          <SectionTitle title="Contact Details" />
          <ListCard>
            <InfoRow icon={Mail} label="Email" value={user?.email || tenant.email} />
            <InfoRow icon={Phone} label="Phone" value={user?.contactNumber || tenant.phone} />
          </ListCard>
        </section>

        <section>
          <SectionTitle title="Settings" />
          <ListCard>
            <ListRow icon={Edit3} title="Edit Profile" subtitle="Update personal details" onClick={() => setEditOpen(true)} />
            <ListRow icon={Shield} title="Security" subtitle="Change password" onClick={() => setSecurityOpen(true)} />
          </ListCard>
        </section>

        <div>
          <MobileButton variant="outline" onClick={() => setConfirmLogout(true)} className="text-destructive hover:bg-destructive/5">
            <LogOut className="h-[18px] w-[18px]" />
            Log Out
          </MobileButton>
          <p className="mt-3 text-center text-xs text-muted-foreground">CondoEase v1.0.0 - Tenant App</p>
        </div>
      </ScreenBody>

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
        <SheetOverlay onDismiss={() => setConfirmLogout(false)}>
          <SheetHeader
            title="Log out?"
            desc="You will need to sign in again to access your tenant portal."
            onClose={() => setConfirmLogout(false)}
          />
          <MobileButton variant="danger" onClick={onLogout}>
            <LogOut className="h-[18px] w-[18px]" />
            Log Out
          </MobileButton>
          <MobileButton variant="ghost" onClick={() => setConfirmLogout(false)} className="mt-2 text-muted-foreground">
            Stay Signed In
          </MobileButton>
        </SheetOverlay>
      )}
    </Screen>
  )
}

function InfoRow({ icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <IconChip icon={icon} tone="primary" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

function SheetOverlay({ onDismiss, children, className }: { onDismiss?: () => void; children: ReactNode; className?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-foreground/40 backdrop-blur-[2px]">
      <div className="flex-1" onClick={onDismiss} />
      <div className={cn('rounded-t-3xl border-t border-border bg-card px-6 pb-6 pt-3', className)}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        {children}
      </div>
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
    <SheetOverlay onDismiss={saving ? undefined : onClose} className="mobile-scroll max-h-[86vh]">
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
    </SheetOverlay>
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
    <SheetOverlay onDismiss={saving ? undefined : onClose}>
      <SheetHeader title="Security" desc="Change your account password." onClose={onClose} disabled={saving} />
      <div className="flex flex-col gap-3">
        <SheetInput label="Current Password" value={currentPassword} onChange={(value) => { setCurrentPassword(value); setError(null); setNotice(null) }} type="password" />
        <SheetInput label="New Password" value={newPassword} onChange={(value) => { setNewPassword(value); setError(null); setNotice(null) }} type="password" />
        <SheetInput label="Confirm Password" value={confirmPassword} onChange={(value) => { setConfirmPassword(value); setError(null); setNotice(null) }} type="password" />
        {error && <SheetMessage tone="error">{error}</SheetMessage>}
        {notice && <SheetMessage tone="success">{notice}</SheetMessage>}
        <SheetPrimaryButton loading={saving} label="Update Password" onClick={save} />
      </div>
    </SheetOverlay>
  )
}

function SheetHeader({ title, desc, onClose, disabled }: { title: string; desc: string; onClose: () => void; disabled?: boolean }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
      <IconButton onClick={onClose} disabled={disabled} aria-label="Close" className="-mr-2 -mt-1 shrink-0 bg-muted text-muted-foreground">
        <X className="h-[18px] w-[18px]" />
      </IconButton>
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
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        inputMode={inputMode}
        className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
      />
    </label>
  )
}

function SheetMessage({ tone, children }: { tone: 'error' | 'success'; children: string }) {
  return (
    <InlineAlert tone={tone === 'error' ? 'danger' : 'success'} className="text-xs">
      {children}
    </InlineAlert>
  )
}

function SheetPrimaryButton({ loading, label, onClick }: { loading: boolean; label: string; onClick: () => void }) {
  return (
    <MobileButton onClick={onClick} disabled={loading} className="mt-1">
      {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : label}
    </MobileButton>
  )
}
