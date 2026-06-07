'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { ChevronLeft, ChevronDown, Camera, CheckCircle } from 'lucide-react'
import { useMobileData } from './mobile-data'

interface MaintenanceFormScreenProps {
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
  onBack: () => void
}

const CATEGORIES = ['Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Painting', 'Appliances', 'Pest Control', 'Other']

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
      <div className="flex flex-col h-full items-center justify-center px-8" style={{ background: '#F4F6FA' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: '#F0FDF4' }}>
          <CheckCircle size={44} color="#22C55E" />
        </div>
        <h2 className="text-xl font-bold text-center" style={{ color: '#1A2847' }}>Request Submitted!</h2>
        <p className="text-sm text-center mt-2" style={{ color: '#5A6A8A' }}>
          Your maintenance request has been received. Our team will get back to you within 24–48 hours.
        </p>
        <div className="w-full mt-8 flex flex-col gap-3">
          <button
            onClick={() => onNavigate('maintenance')}
            className="w-full py-4 rounded-2xl font-bold text-white active:opacity-80"
            style={{ backgroundColor: '#243660' }}
          >
            Track My Request
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm"
            style={{ color: '#9AABC4' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#F4F6FA' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(150deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <button onClick={onBack} className="flex items-center gap-2 mb-4">
          <ChevronLeft size={20} color="rgba(255,255,255,0.7)" />
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Maintenance</span>
        </button>
        <h1 className="text-xl font-bold text-white">New Request</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Describe the issue in detail</p>
      </div>

      <div className="flex-1 mobile-scroll px-5 py-5 flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: '#1A2847' }}>Issue Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Leaking faucet in bathroom"
            className="bg-white rounded-2xl px-4 py-3.5 text-sm outline-none"
            style={{ border: '1.5px solid #E2E8F0', color: '#1A2847' }}
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: '#1A2847' }}>Category *</label>
          <button
            onClick={() => setShowCategoryPicker(!showCategoryPicker)}
            className="bg-white rounded-2xl px-4 py-3.5 text-sm flex items-center justify-between"
            style={{ border: '1.5px solid #E2E8F0' }}
          >
            <span style={{ color: category ? '#1A2847' : '#9AABC4' }}>{category || 'Select category'}</span>
            <ChevronDown size={18} color="#9AABC4" />
          </button>
          {showCategoryPicker && (
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg" style={{ border: '1.5px solid #E2E8F0' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setShowCategoryPicker(false) }}
                  className="w-full px-4 py-3 text-sm text-left border-b last:border-b-0"
                  style={{
                    color: category === cat ? '#243660' : '#1A2847',
                    fontWeight: category === cat ? 700 : 400,
                    borderColor: '#F1F5F9',
                    backgroundColor: category === cat ? '#EEF2FF' : 'transparent',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: '#1A2847' }}>Description *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the issue in detail. When did it start? What have you tried?"
            rows={4}
            className="bg-white rounded-2xl px-4 py-3.5 text-sm outline-none resize-none"
            style={{ border: '1.5px solid #E2E8F0', color: '#1A2847' }}
          />
        </div>

        {/* Photo Upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: '#1A2847' }}>Photos (Optional)</label>
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
            className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 border-2 border-dashed"
            style={{ borderColor: '#C7D2FE' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
              <Camera size={22} color="#243660" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: '#243660' }}>
                {photos.length > 0 ? `${photos.length} photo${photos.length === 1 ? '' : 's'} attached` : 'Tap to attach photos'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#9AABC4' }}>JPEG, PNG up to 10MB each</p>
            </div>
          </button>
          {photos.length > 0 && (
            <div className="rounded-2xl bg-white px-4 py-3 text-xs" style={{ border: '1.5px solid #E2E8F0', color: '#5A6A8A' }}>
              {photos.map((photo) => photo.name).join(', ')}
            </div>
          )}
        </div>

        {/* Submit */}
        {error && (
          <div className="rounded-2xl p-3 text-xs font-medium" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 active:opacity-80 transition-all"
          style={{ backgroundColor: isValid ? '#243660' : '#C7D2FE' }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Submit Request'
          )}
        </button>
      </div>
    </div>
  )
}
