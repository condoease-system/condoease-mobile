'use client'

import { useState } from 'react'
import type { ReactNode, HTMLAttributes } from 'react'
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, X } from 'lucide-react'
import { Logo } from './Logo'
import { login, resetPasswordWithOtp, saveAuthSession, sendOtp, verifyOtp, type ApiUser } from '@/lib/api'

interface LoginScreenProps {
  onLogin: (user: ApiUser) => void
  onSignUp: () => void
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
    <div className="flex flex-col h-full" style={{ background: '#F4F6FA' }}>
      {/* Top Navy Header */}
      <div
        className="flex flex-col items-center justify-end px-6 pb-10 pt-14"
        style={{ background: 'linear-gradient(160deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
      >
        <Logo size="md" variant="full" className="mb-2 [&_span]:!text-white [&_span_span]:!text-[#FF8A1C]" />
        <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>Tenant Portal</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-8 pb-6 flex flex-col gap-5 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A2847' }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: '#5A6A8A' }}>Sign in to your tenant account</p>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: '#1A2847' }}>Email Address</label>
          <div className="flex items-center rounded-xl px-4 py-3.5 gap-3" style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
            <Mail size={18} style={{ color: '#9AABC4' }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#1A2847' }}
              placeholder="your@email.com"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: '#1A2847' }}>Password</label>
          <div className="flex items-center rounded-xl px-4 py-3.5 gap-3" style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
            <Lock size={18} style={{ color: '#9AABC4' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#1A2847' }}
              placeholder="Password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1">
              {showPassword ? <EyeOff size={18} style={{ color: '#9AABC4' }} /> : <Eye size={18} style={{ color: '#9AABC4' }} />}
            </button>
          </div>
        </div>

        <button onClick={() => setForgotOpen(true)} className="text-right text-sm font-semibold" style={{ color: '#FF8A1C' }}>
          Forgot password?
        </button>

        {error && (
          <div className="rounded-xl p-3 text-xs font-medium" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
            {error}
          </div>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-white text-base transition-opacity active:opacity-80"
          style={{ backgroundColor: '#243660' }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <button
          onClick={onSignUp}
          className="py-2 text-sm font-semibold"
          style={{ color: '#FF8A1C' }}
        >
          Create tenant account
        </button>

        {/* Login notice */}
        <div className="rounded-xl p-4" style={{ background: '#FFF3E0', border: '1px solid #FFD199' }}>
          <p className="text-xs text-center font-medium" style={{ color: '#B85C00' }}>
            Use your approved CondoEase tenant account to sign in.
          </p>
        </div>

        {/* Unit Info */}
        <div className="mt-auto text-center">
          <p className="text-xs" style={{ color: '#9AABC4' }}>
            CondoEase Tenant Portal
          </p>
          <p className="text-xs mt-1" style={{ color: '#9AABC4' }}>
            Having trouble? Contact{' '}
            <span className="font-semibold" style={{ color: '#243660' }}>support@condoease.ph</span>
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
    <div className="absolute inset-0 z-50 flex flex-col" style={{ background: 'rgba(26,40,71,0.45)' }}>
      <div className="flex-1" onClick={loading ? undefined : onClose} />
      <div className="rounded-t-3xl bg-white px-6 pb-6 pt-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#1A2847' }}>
              {step === 'done' ? 'Password Reset' : 'Forgot Password'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#5A6A8A' }}>
              {step === 'email' && 'Enter your account email.'}
              {step === 'otp' && `Enter the OTP sent to ${resetEmail}.`}
              {step === 'password' && 'Create a new password.'}
              {step === 'done' && 'Your account is ready.'}
            </p>
          </div>
          <button onClick={onClose} disabled={loading} className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: '#F4F6FA' }}>
            <X size={18} color="#5A6A8A" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {step === 'email' && (
            <>
              <SheetField label="Email Address" value={resetEmail} onChange={setResetEmail} placeholder="your@email.com" type="email" icon={<Mail size={18} color="#9AABC4" />} />
              <SheetButton loading={loading} label="Send OTP" onClick={sendResetOtp} />
            </>
          )}

          {step === 'otp' && (
            <>
              <SheetField label="OTP Code" value={otp} onChange={setOtp} placeholder="6-digit code" inputMode="numeric" icon={<ShieldCheck size={18} color="#9AABC4" />} />
              <SheetButton loading={loading} label="Verify OTP" onClick={verifyResetOtp} />
              <button onClick={sendResetOtp} disabled={loading} className="py-2 text-sm font-semibold" style={{ color: '#FF8A1C' }}>
                Resend OTP
              </button>
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
            <button onClick={onClose} className="w-full py-4 rounded-xl font-bold text-white text-base" style={{ backgroundColor: '#243660' }}>
              Back to Sign In
            </button>
          )}

          {(error || notice) && (
            <div
              className="rounded-xl p-3 text-xs font-medium"
              style={{
                background: error ? '#FEF2F2' : '#F0FDF4',
                color: error ? '#DC2626' : '#15803D',
                border: error ? '1px solid #FECACA' : '1px solid #BBF7D0',
              }}
            >
              {error || notice}
            </div>
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
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: '#1A2847' }}>{label}</label>
      <div className="flex items-center rounded-xl px-4 py-3.5 gap-3" style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
        <Lock size={18} color="#9AABC4" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={event => onChange(event.target.value)}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: '#1A2847' }}
          placeholder={placeholder}
        />
        <button type="button" onClick={onToggle} className="p-1">
          {show ? <EyeOff size={18} color="#9AABC4" /> : <Eye size={18} color="#9AABC4" />}
        </button>
      </div>
    </div>
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
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: '#1A2847' }}>{label}</label>
      <div className="flex items-center rounded-xl px-4 py-3.5 gap-3" style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
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

function SheetButton({ loading, label, onClick }: { loading: boolean; label: string; onClick: () => void }) {
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
