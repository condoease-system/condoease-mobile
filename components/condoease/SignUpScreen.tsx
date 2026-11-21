'use client'

import { useState } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, ChevronDown, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react'
import { registerAccount, sendOtp, verifyOtp } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'
import { IconButton, InlineAlert, MobileButton } from './mobile-kit'

interface SignUpScreenProps {
  onBack: () => void
}

type SignupStep = 'email' | 'otp' | 'details' | 'submitted'

const idTypes = ['National ID', 'Driver License', 'Passport', 'SSS', 'UMID', 'Voter ID']
const workSchoolTypes = ['Work', 'School']

const inputWrapClass =
  'flex h-12 items-center gap-3 rounded-xl border border-input bg-card px-4 transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20'
const inputClass = 'h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70'
const labelClass = 'text-sm font-medium text-foreground'
const iconClass = 'h-[18px] w-[18px] shrink-0 text-muted-foreground'

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
      <div className="flex h-full flex-col items-center justify-center bg-background px-6 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Registration Submitted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your tenant account is pending property manager approval on the web portal. You can sign in once approved.
        </p>
        <MobileButton onClick={onBack} className="mt-8">
          Back to Sign In
        </MobileButton>
      </div>
    )
  }

  const stepIndex = step === 'email' ? 0 : step === 'otp' ? 1 : 2

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="shrink-0 border-b border-border bg-background/85 px-4 pb-4 pt-12 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 flex h-10 items-center gap-1.5 rounded-full pl-1.5 pr-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
          Sign In
        </button>
        <div className="mt-3 px-2">
          <Logo size="sm" variant="full" className="mb-4" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tenant Sign Up</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === 'email' ? 'Verify your email to begin' : step === 'otp' ? 'Enter the code sent to your email' : 'Complete your tenant profile'}
          </p>
          <div className="mt-4 flex gap-1.5" aria-hidden="true">
            {[0, 1, 2].map(index => (
              <span key={index} className={cn('h-1 flex-1 rounded-full', index <= stepIndex ? 'bg-primary' : 'bg-border')} />
            ))}
          </div>
        </div>
      </header>

      <div className="mobile-scroll flex flex-1 flex-col gap-4 px-6 py-6">
        {step === 'email' && (
          <>
            <Field label="Email Address" value={form.email} onChange={value => update('email', value)} placeholder="your@email.com" type="email" icon={<Mail className={iconClass} />} />
            <PrimaryButton loading={loading} label="Send OTP" onClick={handleSendOtp} />
          </>
        )}

        {step === 'otp' && (
          <>
            <Field label="OTP Code" value={form.otp} onChange={value => update('otp', value)} placeholder="6-digit code" inputMode="numeric" icon={<ShieldCheck className={iconClass} />} />
            <PrimaryButton loading={loading} label="Verify OTP" onClick={handleVerifyOtp} />
            <MobileButton variant="ghost" onClick={handleSendOtp} disabled={loading} className="h-10">
              Resend OTP
            </MobileButton>
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

        {error && <InlineAlert className="text-xs">{error}</InlineAlert>}
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
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
  icon?: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      <div className={inputWrapClass}>
        {icon}
        <input
          type={type}
          value={value}
          onChange={event => onChange(event.target.value)}
          className={inputClass}
          placeholder={placeholder}
          inputMode={inputMode}
        />
      </div>
    </label>
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
    <label className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      <div className={inputWrapClass}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={event => onChange(event.target.value)}
          className={inputClass}
          placeholder="At least 8 characters"
        />
        <IconButton onClick={onToggle} aria-label={show ? 'Hide password' : 'Show password'} className="-mr-3 text-muted-foreground">
          {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </IconButton>
      </div>
    </label>
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
    <label className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={event => onChange(event.target.value)}
          className={cn(
            'h-12 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20',
            value ? 'text-foreground' : 'text-muted-foreground/70',
          )}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </label>
  )
}

function PrimaryButton({ loading, label, onClick }: { loading: boolean; label: string; onClick: () => void }) {
  return (
    <MobileButton onClick={onClick} disabled={loading}>
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          {label}
          <ArrowRight className="h-[18px] w-[18px]" />
        </>
      )}
    </MobileButton>
  )
}
