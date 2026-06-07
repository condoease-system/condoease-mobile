'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react'
import { registerAccount, sendOtp, verifyOtp } from '@/lib/api'
import { Logo } from './Logo'

interface SignUpScreenProps {
  onBack: () => void
}

type SignupStep = 'email' | 'otp' | 'details' | 'submitted'

const idTypes = ['National ID', 'Driver License', 'Passport', 'SSS', 'UMID', 'Voter ID']
const workSchoolTypes = ['Work', 'School']

export function SignUpScreen({ onBack }: SignUpScreenProps) {
  const [step, setStep] = useState<SignupStep>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    email: '',
    otp: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    unitStreet: '',
    barangay: '',
    city: '',
    region: '',
    idType: '',
    idNo: '',
    workSchoolType: '',
    companySchoolName: '',
    emergencyContact: '',
    relationship: '',
    emergencyContactNumber: '',
  })

  const update = (key: keyof typeof form, value: string) => {
    setForm(current => ({ ...current, [key]: value }))
    setError(null)
  }

  const handleSendOtp = async () => {
    if (!form.email.trim()) {
      setError('Email is required.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await sendOtp({ email: form.email.trim(), purpose: 'signup' })
      setStep('otp')
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Unable to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!form.otp.trim()) {
      setError('OTP is required.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await verifyOtp({ email: form.email.trim(), purpose: 'signup', otp: form.otp.trim() })
      setStep('details')
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : 'Unable to verify OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    const requiredFields: Array<keyof typeof form> = [
      'firstName',
      'lastName',
      'contactNumber',
      'password',
      'confirmPassword',
      'unitStreet',
      'barangay',
      'city',
      'region',
      'idType',
      'idNo',
      'workSchoolType',
      'companySchoolName',
      'emergencyContact',
      'relationship',
      'emergencyContactNumber',
    ]

    const missing = requiredFields.find(field => !form[field].trim())
    if (missing) {
      setError('Please complete all required fields.')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await registerAccount({
        role: 'Tenant',
        email: form.email.trim(),
        emailOtp: form.otp.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        contactNumber: form.contactNumber.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        unitStreet: form.unitStreet.trim(),
        barangay: form.barangay.trim(),
        city: form.city.trim(),
        region: form.region.trim(),
        idType: form.idType,
        idNo: form.idNo.trim(),
        workSchoolType: form.workSchoolType,
        companySchoolName: form.companySchoolName.trim(),
        emergencyContact: form.emergencyContact.trim(),
        relationship: form.relationship.trim(),
        emergencyContactNumber: form.emergencyContactNumber.trim(),
        idFileName: '',
        idFileType: '',
        idFileDataUrl: '',
      })
      setStep('submitted')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit registration.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'submitted') {
    return (
      <div className="flex flex-col h-full items-center justify-center px-8 text-center" style={{ background: '#F4F6FA' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: '#F0FDF4' }}>
          <CheckCircle size={44} color="#22C55E" />
        </div>
        <h1 className="text-xl font-bold" style={{ color: '#1A2847' }}>Registration Submitted</h1>
        <p className="text-sm mt-2" style={{ color: '#5A6A8A' }}>
          Your tenant account is pending property manager approval on the web portal. You can sign in once approved.
        </p>
        <button onClick={onBack} className="mt-8 w-full py-4 rounded-2xl font-bold text-white" style={{ backgroundColor: '#243660' }}>
          Back to Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#F4F6FA' }}>
      <div
        className="px-6 pt-12 pb-6"
        style={{ background: 'linear-gradient(160deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
      >
        <button onClick={onBack} className="flex items-center gap-2 mb-5">
          <ArrowLeft size={18} color="rgba(255,255,255,0.7)" />
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Sign In</span>
        </button>
        <Logo size="sm" variant="full" className="mb-3 [&_span]:!text-white [&_span_span]:!text-[#FF8A1C]" />
        <h1 className="text-xl font-bold text-white">Tenant Sign Up</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {step === 'email' ? 'Verify your email to begin' : step === 'otp' ? 'Enter the code sent to your email' : 'Complete your tenant profile'}
        </p>
      </div>

      <div className="flex-1 mobile-scroll px-6 py-6 flex flex-col gap-4">
        {step === 'email' && (
          <>
            <Field label="Email Address" value={form.email} onChange={value => update('email', value)} placeholder="your@email.com" type="email" icon={<Mail size={18} color="#9AABC4" />} />
            <PrimaryButton loading={loading} label="Send OTP" onClick={handleSendOtp} />
          </>
        )}

        {step === 'otp' && (
          <>
            <Field label="OTP Code" value={form.otp} onChange={value => update('otp', value)} placeholder="6-digit code" inputMode="numeric" icon={<ShieldCheck size={18} color="#9AABC4" />} />
            <PrimaryButton loading={loading} label="Verify OTP" onClick={handleVerifyOtp} />
            <button onClick={handleSendOtp} disabled={loading} className="py-2 text-sm font-semibold" style={{ color: '#FF8A1C' }}>
              Resend OTP
            </button>
          </>
        )}

        {step === 'details' && (
          <>
            <Field label="First Name" value={form.firstName} onChange={value => update('firstName', value)} placeholder="First name" />
            <Field label="Last Name" value={form.lastName} onChange={value => update('lastName', value)} placeholder="Last name" />
            <Field label="Contact Number" value={form.contactNumber} onChange={value => update('contactNumber', value)} placeholder="9XXXXXXXXX" inputMode="tel" />
            <PasswordField label="Password" value={form.password} onChange={value => update('password', value)} show={showPassword} onToggle={() => setShowPassword(current => !current)} />
            <PasswordField label="Confirm Password" value={form.confirmPassword} onChange={value => update('confirmPassword', value)} show={showConfirmPassword} onToggle={() => setShowConfirmPassword(current => !current)} />
            <Field label="Unit / Street" value={form.unitStreet} onChange={value => update('unitStreet', value)} placeholder="Unit 101, Street" />
            <Field label="Barangay" value={form.barangay} onChange={value => update('barangay', value)} placeholder="Barangay" />
            <Field label="City" value={form.city} onChange={value => update('city', value)} placeholder="City" />
            <Field label="Region" value={form.region} onChange={value => update('region', value)} placeholder="Region" />
            <SelectField label="ID Type" value={form.idType} options={idTypes} onChange={value => update('idType', value)} />
            <Field label="ID Number" value={form.idNo} onChange={value => update('idNo', value)} placeholder="ID number" />
            <SelectField label="Work / School" value={form.workSchoolType} options={workSchoolTypes} onChange={value => update('workSchoolType', value)} />
            <Field label="Company / School Name" value={form.companySchoolName} onChange={value => update('companySchoolName', value)} placeholder="Name" />
            <Field label="Emergency Contact" value={form.emergencyContact} onChange={value => update('emergencyContact', value)} placeholder="Full name" />
            <Field label="Relationship" value={form.relationship} onChange={value => update('relationship', value)} placeholder="Relationship" />
            <Field label="Emergency Contact Number" value={form.emergencyContactNumber} onChange={value => update('emergencyContactNumber', value)} placeholder="9XXXXXXXXX" inputMode="tel" />
            <PrimaryButton loading={loading} label="Submit Registration" onClick={handleSubmit} />
          </>
        )}

        {error && (
          <div className="rounded-xl p-3 text-xs font-medium" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  icon,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: '#1A2847' }}>{label}</label>
      <div className="flex items-center rounded-xl px-4 py-3.5 gap-3" style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
        {icon}
        <input
          type={type}
          value={value}
          onChange={event => onChange(event.target.value)}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: '#1A2847' }}
          placeholder={placeholder}
          inputMode={inputMode}
        />
      </div>
    </div>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  show: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: '#1A2847' }}>{label}</label>
      <div className="flex items-center rounded-xl px-4 py-3.5 gap-3" style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={event => onChange(event.target.value)}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: '#1A2847' }}
          placeholder="At least 8 characters"
        />
        <button type="button" onClick={onToggle} className="p-1">
          {show ? <EyeOff size={18} color="#9AABC4" /> : <Eye size={18} color="#9AABC4" />}
        </button>
      </div>
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: '#1A2847' }}>{label}</label>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="bg-white rounded-xl px-4 py-3.5 text-sm outline-none"
        style={{ color: value ? '#1A2847' : '#9AABC4', border: '1.5px solid #E2E8F0' }}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  )
}

function PrimaryButton({ loading, label, onClick }: { loading: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-white text-base transition-opacity active:opacity-80"
      style={{ backgroundColor: '#243660' }}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {label}
          <ArrowRight size={18} />
        </>
      )}
    </button>
  )
}
