'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { Camera, Check, CheckCircle, ChevronDown } from 'lucide-react'
import { useMobileData } from './mobile-data'
import { BottomActions, InlineAlert, MobileButton, Screen, ScreenBody, ScreenHeader } from './mobile-kit'
import { cn } from '@/lib/utils'

interface MaintenanceFormScreenProps {
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
  onBack: () => void
}

const CATEGORIES = ['Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Painting', 'Appliances', 'Pest Control', 'Other']

const fieldClass =
  'w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20'
const labelClass = 'text-sm font-medium text-foreground'

export function MaintenanceFormScreen({ onNavigate, onBack }: MaintenanceFormScreenProps) {
  const { createMaintenanceRequest } = useMobileData()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = title.trim() && category && description.trim()

  const handlePhotos = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    const validPhotos = selected.filter((file) => ['image/jpeg', 'image/png'].includes(file.type) && file.size <= 10 * 1024 * 1024)
    setPhotos(validPhotos)

    if (selected.length !== validPhotos.length) {
      setError('Only JPEG or PNG photos up to 10MB each can be attached.')
      return
    }

    setError(null)
  }

  const handleSubmit = async () => {
    if (!isValid) return
    setLoading(true)
    setError(null)

    try {
      await createMaintenanceRequest({
        title,
        category,
        description,
        media: photos.map((photo) => photo.name),
      })
      setSubmitted(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit request.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Screen className="items-center justify-center px-6">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-center text-xl font-semibold tracking-tight text-foreground">Request Submitted!</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Your maintenance request has been received. Our team will get back to you within 24–48 hours.
        </p>
        <div className="mt-8 flex w-full flex-col gap-2">
          <MobileButton onClick={() => onNavigate('maintenance')}>Track My Request</MobileButton>
          <MobileButton variant="ghost" onClick={() => onNavigate('home')} className="text-muted-foreground">
            Back to Home
          </MobileButton>
        </div>
      </Screen>
    )
  }

  return (
    <Screen>
      <ScreenHeader title="New Request" subtitle="Describe the issue in detail" onBack={onBack} />

      <ScreenBody className="space-y-4">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="maintenance-title" className={labelClass}>Issue Title *</label>
          <input
            id="maintenance-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Leaking faucet in bathroom"
            className={cn(fieldClass, 'h-12')}
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Category *</label>
          <button
            type="button"
            onClick={() => setShowCategoryPicker(!showCategoryPicker)}
            aria-expanded={showCategoryPicker}
            className={cn(fieldClass, 'flex h-12 items-center justify-between text-left', showCategoryPicker && 'border-ring ring-[3px] ring-ring/20')}
          >
            <span className={category ? 'text-foreground' : 'text-muted-foreground/70'}>{category || 'Select category'}</span>
            <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', showCategoryPicker && 'rotate-180')} />
          </button>
          {showCategoryPicker && (
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setCategory(cat); setShowCategoryPicker(false) }}
                  className={cn(
                    'flex min-h-11 w-full items-center justify-between px-4 text-left text-sm transition-colors active:bg-muted/60',
                    category === cat ? 'bg-primary/5 font-semibold text-primary' : 'text-foreground',
                  )}
                >
                  {cat}
                  {category === cat && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="maintenance-description" className={labelClass}>Description *</label>
          <textarea
            id="maintenance-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the issue in detail. When did it start? What have you tried?"
            rows={4}
            className={cn(fieldClass, 'resize-none py-3')}
          />
        </div>

        {/* Photo Upload */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Photos (Optional)</label>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            className="hidden"
            onChange={handlePhotos}
          />
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-input bg-card p-6 transition-colors active:bg-muted/60"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Camera className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-primary">
                {photos.length > 0 ? `${photos.length} photo${photos.length === 1 ? '' : 's'} attached` : 'Tap to attach photos'}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">JPEG, PNG up to 10MB each</p>
            </div>
          </button>
          {photos.length > 0 && (
            <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
              {photos.map((photo) => photo.name).join(', ')}
            </div>
          )}
        </div>

        {error && <InlineAlert className="text-xs">{error}</InlineAlert>}
      </ScreenBody>

      <BottomActions>
        <MobileButton onClick={handleSubmit} disabled={!isValid || loading}>
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            'Submit Request'
          )}
        </MobileButton>
      </BottomActions>
    </Screen>
  )
}
