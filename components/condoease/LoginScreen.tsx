'use client'

import { useState } from 'react'
import type { ReactNode, HTMLAttributes } from 'react'
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, X } from 'lucide-react'
import { Logo } from './Logo'
import { IconButton, InlineAlert, MobileButton } from './mobile-kit'
import { login, resetPasswordWithOtp, saveAuthSession, sendOtp, verifyOtp, type ApiUser } from '@/lib/api'

interface LoginScreenProps {
  onLogin: (user: ApiUser) => void
  onSignUp: () => void
}

const inputWrapClass =
  'flex h-12 items-center gap-3 rounded-xl border border-input bg-card px-4 transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20'
const inputClass = 'h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70'
const labelClass = 'text-sm font-medium text-foreground'
const iconClass = 'h-[18px] w-[18px] shrink-0 text-muted-foreground'

function Spinner() {
  return <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
}

export function LoginScreen({ onLogin, onSignUp }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forgotOpen, setForgotOpen] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const session = await login(email, password)
      saveAuthSession(session.token, session.user)
      onLogin(session.user)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex h-full flex-col bg-background">
      <div className="mobile-scroll flex flex-1 flex-col gap-5 px-6 pb-6 pt-14">
        {/* Brand */}
        <div className="flex flex-col items-start gap-1">
          <Logo size="md" variant="full" />
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Tenant Portal</p>
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your tenant account</p>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className={labelClass}>Email Address</label>
          <div className={inputWrapClass}>
            <Mail className={iconClass} />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="your@email.com"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className={labelClass}>Password</label>
            <button type="button" onClick={() => setForgotOpen(true)} className="-my-2 py-2 text-sm font-semibold text-primary">
              Forgot password?
            </button>
          </div>
          <div className={inputWrapClass}>
            <Lock className={iconClass} />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Password"
            />
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="-mr-3 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </IconButton>
          </div>
        </div>

        {error && <InlineAlert className="text-xs">{error}</InlineAlert>}

        {/* Login Button */}
        <MobileButton onClick={handleLogin} disabled={loading}>
          {loading ? (
            <Spinner />
          ) : (
            <>
              Sign In
              <ArrowRight className="h-[18px] w-[18px]" />
            </>
          )}
        </MobileButton>

        <MobileButton variant="outline" onClick={onSignUp}>
          Create tenant account
        </MobileButton>

        {/* Login notice */}
        <div className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <p className="text-xs font-medium text-muted-foreground">
            Use your approved CondoEase tenant account to sign in.
          </p>
        </div>

        {/* Unit Info */}
        <div className="mt-auto pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            CondoEase Tenant Portal
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Having trouble? Contact{' '}
            <span className="font-semibold text-primary">support@condoease.ph</span>
          </p>
        </div>
      </div>
      {forgotOpen && <ForgotPasswordSheet initialEmail={email} onClose={() => setForgotOpen(false)} />}
    </div>
  )
}

type ResetStep = 'email' | 'otp' | 'password' | 'done'

function ForgotPasswordSheet({ initialEmail, onClose }: { initialEmail: string; onClose: () => void }) {
  const [step, setStep] = useState<ResetStep>('email')
  const [resetEmail, setResetEmail] = useState(initialEmail.trim().toLowerCase())
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const sendResetOtp = async () => {
    if (!resetEmail.trim()) {
      setError('Email is required.')
      return
    }

    setLoading(true)
    setError(null)
    setNotice(null)

    try {
      const cleanEmail = resetEmail.trim().toLowerCase()
      await sendOtp({ email: cleanEmail, purpose: 'password_reset' })
      setResetEmail(cleanEmail)
      setOtp('')
      setStep('otp')
      setNotice('OTP sent. Check your email.')
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Unable to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  const verifyResetOtp = async () => {
    if (!otp.trim()) {
      setError('OTP is required.')
      return
    }

    setLoading(true)
    setError(null)
    setNotice(null)

    try {
      await verifyOtp({ email: resetEmail, purpose: 'password_reset', otp: otp.trim() })
      setStep('password')
      setNotice('OTP verified. Create your new password.')
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : 'Unable to verify OTP.')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async () => {
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)
    setNotice(null)

    try {
      await resetPasswordWithOtp({
        email: resetEmail,
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      })
      setStep('done')
      setNotice('Password reset successful. You can sign in now.')
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Unable to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-foreground/40 backdrop-blur-[2px]">
      <div className="flex-1" onClick={loading ? undefined : onClose} />
      <div className="rounded-t-3xl border-t border-border bg-card px-6 pb-6 pt-3">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {step === 'done' ? 'Password Reset' : 'Forgot Password'}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {step === 'email' && 'Enter your account email.'}
              {step === 'otp' && `Enter the OTP sent to ${resetEmail}.`}
              {step === 'password' && 'Create a new password.'}
              {step === 'done' && 'Your account is ready.'}
            </p>
          </div>
          <IconButton onClick={onClose} disabled={loading} aria-label="Close" className="-mr-2 -mt-1 bg-muted text-muted-foreground">
            <X className="h-[18px] w-[18px]" />
          </IconButton>
        </div>

        <div className="flex flex-col gap-4">
          {step === 'email' && (
            <>
              <SheetField label="Email Address" value={resetEmail} onChange={setResetEmail} placeholder="your@email.com" type="email" icon={<Mail className={iconClass} />} />
              <SheetButton loading={loading} label="Send OTP" onClick={sendResetOtp} />
            </>
          )}

          {step === 'otp' && (
            <>
              <SheetField label="OTP Code" value={otp} onChange={setOtp} placeholder="6-digit code" inputMode="numeric" icon={<ShieldCheck className={iconClass} />} />
              <SheetButton loading={loading} label="Verify OTP" onClick={verifyResetOtp} />
              <MobileButton variant="ghost" onClick={sendResetOtp} disabled={loading} className="h-10">
                Resend OTP
              </MobileButton>
            </>
          )}

          {step === 'password' && (
            <>
              <SheetPasswordField
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="At least 8 characters"
                show={showNewPassword}
                onToggle={() => setShowNewPassword(current => !current)}
              />
              <SheetPasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Repeat new password"
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(current => !current)}
              />
              <SheetButton loading={loading} label="Reset Password" onClick={resetPassword} />
            </>
          )}

          {step === 'done' && (
            <MobileButton onClick={onClose}>
              Back to Sign In
            </MobileButton>
          )}

          {(error || notice) && (
            <InlineAlert tone={error ? 'danger' : 'success'} className="text-xs">
              {error || notice}
            </InlineAlert>
          )}
        </div>
      </div>
    </div>
  )
}

function SheetPasswordField({
  label,
  value,
  onChange,
  placeholder,
  show,
  onToggle,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  show: boolean
  onToggle: () => void
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      <div className={inputWrapClass}>
        <Lock className={iconClass} />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={event => onChange(event.target.value)}
          className={inputClass}
          placeholder={placeholder}
        />
        <IconButton onClick={onToggle} aria-label={show ? 'Hide password' : 'Show password'} className="-mr-3 text-muted-foreground">
          {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </IconButton>
      </div>
    </label>
  )
}

function SheetField({
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

function SheetButton({ loading, label, onClick }: { loading: boolean; label: string; onClick: () => void }) {
  return (
    <MobileButton onClick={onClick} disabled={loading}>
      {loading ? (
        <Spinner />
      ) : (
        <>
          {label}
          <ArrowRight className="h-[18px] w-[18px]" />
        </>
      )}
    </MobileButton>
  )
}
