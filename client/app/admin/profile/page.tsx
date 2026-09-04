'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Mail, 
  User as UserIcon, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Building2, 
  Phone, 
  BadgeCheck 
} from 'lucide-react'
import { getAuthToken } from '@/lib/get-token'

export default function AdminProfilePage() {
  const { user, updateUser, isLoading: authLoading } = useAuth()

  // Profile Information State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [primaryNumber, setPrimaryNumber] = useState('')
  const [role, setRole] = useState('')

  const [profileIsSaving, setProfileIsSaving] = useState(false)
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('')
  const [profileErrorMsg, setProfileErrorMsg] = useState('')

  // Change Password State
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [pwdIsSaving, setPwdIsSaving] = useState(false)
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState('')
  const [pwdErrorMsg, setPwdErrorMsg] = useState('')

  // Change Email State
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [showEmailPassword, setShowEmailPassword] = useState(false)

  const [emailIsSaving, setEmailIsSaving] = useState(false)
  const [emailSuccessMsg, setEmailSuccessMsg] = useState('')
  const [emailErrorMsg, setEmailErrorMsg] = useState('')

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.name || '')
      setEmail(user.email || '')
      setDepartment(user.department || 'Central Administration')
      setPrimaryNumber(user.primaryNumber || '')
      setRole(user.role || 'admin')
    }
  }, [user])

  // Profile Info Submit Handler
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileIsSaving(true)
    setProfileSuccessMsg('')
    setProfileErrorMsg('')

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
      const token = getAuthToken()

      const bodyData = {
        fullName,
        primaryNumber,
        department,
      }

      const res = await fetch(`${baseUrl}/auth/profile`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(bodyData),
      })

      const data = await res.json()

      if (data?.status && data?.data?.user) {
        updateUser(data.data.user)
        setProfileSuccessMsg('Admin profile updated successfully!')
        setTimeout(() => setProfileSuccessMsg(''), 4000)
      } else {
        setProfileErrorMsg(data?.message || 'Failed to update admin profile.')
      }
    } catch (err: any) {
      setProfileErrorMsg(err?.message || 'Network error updating profile.')
    } finally {
      setProfileIsSaving(false)
    }
  }

  // Password Submit Handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdIsSaving(true)
    setPwdSuccessMsg('')
    setPwdErrorMsg('')

    if (!oldPassword) {
      setPwdErrorMsg('Current password is required.')
      setPwdIsSaving(false)
      return
    }

    if (newPassword.length < 6) {
      setPwdErrorMsg('New password must be at least 6 characters long.')
      setPwdIsSaving(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setPwdErrorMsg('New password and confirmation do not match.')
      setPwdIsSaving(false)
      return
    }

    if (oldPassword === newPassword) {
      setPwdErrorMsg('New password must be different from current password.')
      setPwdIsSaving(false)
      return
    }

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
      const token = getAuthToken()

      const res = await fetch(`${baseUrl}/auth/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (data?.status) {
        setPwdSuccessMsg(data?.message || 'Admin password updated successfully!')
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPwdSuccessMsg(''), 4000)
      } else {
        setPwdErrorMsg(data?.message || data?.detail || 'Failed to update password.')
      }
    } catch (err: any) {
      setPwdErrorMsg(err?.message || 'Network error updating password.')
    } finally {
      setPwdIsSaving(false)
    }
  }

  // Email Submit Handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailIsSaving(true)
    setEmailSuccessMsg('')
    setEmailErrorMsg('')

    if (!newEmail || !newEmail.includes('@')) {
      setEmailErrorMsg('Please enter a valid email address.')
      setEmailIsSaving(false)
      return
    }

    if (user && user.email && user.email.toLowerCase() === newEmail.trim().toLowerCase()) {
      setEmailErrorMsg('New email is the same as your current email address.')
      setEmailIsSaving(false)
      return
    }

    if (!emailPassword) {
      setEmailErrorMsg('Current password is required to change your email.')
      setEmailIsSaving(false)
      return
    }

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
      const token = getAuthToken()

      const res = await fetch(`${baseUrl}/auth/change-email`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          newEmail: newEmail.trim(),
          currentPassword: emailPassword,
        }),
      })

      const data = await res.json()

      if (data?.status && data?.data?.user) {
        updateUser(data.data.user)
        if (data.data.token) {
          localStorage.setItem('admin_token', data.data.token)
        }
        setEmailSuccessMsg('Admin email address updated successfully!')
        setNewEmail('')
        setEmailPassword('')
        setTimeout(() => setEmailSuccessMsg(''), 4000)
      } else {
        setEmailErrorMsg(data?.message || data?.detail || 'Failed to update email address.')
      }
    } catch (err: any) {
      setEmailErrorMsg(err?.message || 'Network error updating email address.')
    } finally {
      setEmailIsSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="p-2 rounded-xl bg-card border border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Admin Profile & Security</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your administrator account, contact details, and password security.
            </p>
          </div>
        </div>
      </div>

      {/* Admin User Banner Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/15 via-card/90 to-blue-500/15 border border-purple-500/30 backdrop-blur-xl flex flex-col sm:flex-row items-center gap-5 shadow-lg">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 via-primary to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-white/20 shadow-md">
            {fullName ? fullName.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-lg font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
            {fullName || 'System Administrator'}
            <BadgeCheck className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-xs text-muted-foreground">{email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
              {role || 'ADMINISTRATOR'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-card border border-border/40 text-muted-foreground">
              {department}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Personal Information Form */}
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl bg-card/80 border border-border/50 shadow-lg space-y-6 backdrop-blur-md">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border/30 pb-2">
            Administrator Details
          </h3>

          {/* Profile Success Alert */}
          {profileSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 text-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {/* Profile Error Alert */}
          {profileErrorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center gap-3 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{profileErrorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-primary" /> Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
                placeholder="Enter full name"
              />
            </div>

            {/* Email Address (Readonly reference) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" /> Current Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/20 border border-border/30 text-sm text-muted-foreground cursor-not-allowed outline-none"
              />
            </div>

            {/* Department / Office */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" /> Office / Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
                placeholder="e.g. Central Administration"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" /> Contact Phone
              </label>
              <input
                type="text"
                value={primaryNumber}
                onChange={(e) => setPrimaryNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
                placeholder="e.g. +880 1700 000000"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/30">
            <button
              type="submit"
              disabled={profileIsSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold shadow-md transition"
            >
              {profileIsSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Info</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Change Email Card Section */}
      <div className="p-6 rounded-2xl bg-card/80 border border-border/50 shadow-lg space-y-6 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-border/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Email Address Management</h3>
              <p className="text-xs text-muted-foreground">
                Update your administrator email address. Current password confirmation required.
              </p>
            </div>
          </div>
        </div>

        {/* Email Success Alert */}
        {emailSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{emailSuccessMsg}</span>
          </div>
        )}

        {/* Email Error Alert */}
        {emailErrorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center gap-3 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{emailErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* New Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" /> New Admin Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
                placeholder="admin@gmail.com"
              />
            </div>

            {/* Current Password Verification */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-primary" /> Current Password (for Security)
              </label>
              <div className="relative">
                <input
                  type={showEmailPassword ? 'text' : 'password'}
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-border/30">
            <button
              type="submit"
              disabled={emailIsSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold shadow-md transition"
            >
              {emailIsSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Email...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Update Admin Email</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card Section */}
      <div className="p-6 rounded-2xl bg-card/80 border border-border/50 shadow-lg space-y-6 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-border/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Security & Password Management</h3>
              <p className="text-xs text-muted-foreground">
                Update your administrator account password to keep your system access protected.
              </p>
            </div>
          </div>
        </div>

        {/* Password Success Alert */}
        {pwdSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{pwdSuccessMsg}</span>
          </div>
        )}

        {/* Password Error Alert */}
        {pwdErrorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center gap-3 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{pwdErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-primary" /> Current Password
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" /> New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" /> Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
                  placeholder="Re-type new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-border/30">
            <button
              type="submit"
              disabled={pwdIsSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold shadow-md transition"
            >
              {pwdIsSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
