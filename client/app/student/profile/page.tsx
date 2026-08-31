'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { User as UserIcon, Mail, Phone, Building2, IdCard, Heart, MapPin, Save, Loader2, ArrowLeft, CheckCircle2, Calendar, BookOpen, Star, GraduationCap } from 'lucide-react'
import Link from 'next/link'

export default function EditProfilePage() {
  const router = useRouter()
  const { user, updateUser, isAuthenticated, isLoading: authLoading } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [department, setDepartment] = useState('')
  const [primaryNumber, setPrimaryNumber] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [gender, setGender] = useState('')
  const [address, setAddress] = useState('')

  const [currentSemester, setCurrentSemester] = useState('Spring 2026')
  const [creditsEnrolled, setCreditsEnrolled] = useState('15 Credits')
  const [currentGPA, setCurrentGPA] = useState('3.85')

  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.name || '')
      setEmail(user.email || '')
      setIdNumber(user.studentId || user.idNumber || '')
      setDepartment(user.department || '')
      setPrimaryNumber(user.primaryNumber || '')
      setBloodGroup(user.bloodGroup || '')
      setGender(user.gender || '')
      setAddress(user.address || '')
      setCurrentSemester(user.currentSemester || 'Spring 2026')
      setCreditsEnrolled(user.creditsEnrolled || '15 Credits')
      setCurrentGPA(user.currentGPA || '3.85')
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMsg('')
    setErrorMsg('')

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
      let token = ''
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|; )admin_token=([^;]*)/) || document.cookie.match(/(?:^|; )campusGPT=([^;]*)/)
        if (match) token = match[1]
      }

      const bodyData = {
        fullName,
        primaryNumber,
        department,
        idNumber,
        bloodGroup,
        gender,
        address,
        currentSemester,
        creditsEnrolled,
        currentGPA,
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
        setSuccessMsg('Profile and Academic details updated successfully!')
        setTimeout(() => setSuccessMsg(''), 4000)
      } else {
        setErrorMsg(data?.message || 'Failed to update profile.')
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error updating profile.')
    } finally {
      setIsSaving(false)
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
      {/* Header Navigation */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/student/dashboard"
            className="p-2 rounded-xl bg-card border border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Edit Student Profile</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your personal information, academic status, and contact details.
            </p>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center gap-3 text-sm animate-in fade-in">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* User Banner Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/15 via-card/90 to-accent/15 border border-primary/30 backdrop-blur-xl flex flex-col sm:flex-row items-center gap-5 shadow-lg">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-2xl font-bold border-2 border-white/20 shadow-md">
            {fullName ? fullName.charAt(0).toUpperCase() : 'S'}
          </div>
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-lg font-bold text-foreground">{fullName || 'Student Name'}</h2>
          <p className="text-xs text-muted-foreground">{email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase">
              {user?.role || 'Student'}
            </span>
            {department && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-card border border-border/40 text-muted-foreground">
                {department}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Academic Overview Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Current Semester */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-card/80 to-indigo-500/10 border border-blue-500/30 backdrop-blur-xl shadow-md flex items-center justify-between transition hover:border-blue-500/50">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Current Semester</p>
            <h3 className="text-lg font-bold text-foreground mt-1">{currentSemester || 'Spring 2026'}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xl shadow-inner">
            📅
          </div>
        </div>

        {/* Card 2: Credits Enrolled */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-card/80 to-pink-500/10 border border-purple-500/30 backdrop-blur-xl shadow-md flex items-center justify-between transition hover:border-purple-500/50">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Credits Enrolled</p>
            <h3 className="text-lg font-bold text-foreground mt-1">{creditsEnrolled || '15 Credits'}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl shadow-inner">
            📚
          </div>
        </div>

        {/* Card 3: Current GPA */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-card/80 to-yellow-500/10 border border-amber-500/30 backdrop-blur-xl shadow-md flex items-center justify-between transition hover:border-amber-500/50">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Current GPA</p>
            <h3 className="text-lg font-bold text-amber-400 mt-1">{currentGPA || '3.85'}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
            ⭐
          </div>
        </div>
      </div>

      {/* Profile Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Inputs Grid */}
        <div className="p-6 rounded-2xl bg-card/80 border border-border/50 shadow-lg space-y-6 backdrop-blur-md">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border/30 pb-2">
            Personal Information
          </h3>

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
                placeholder="Enter your full name"
              />
            </div>

            {/* Email Address (Readonly) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" /> Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/20 border border-border/30 text-sm text-muted-foreground cursor-not-allowed outline-none"
              />
            </div>

            {/* Student ID Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <IdCard className="w-3.5 h-3.5 text-primary" /> Student ID Number
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
                placeholder="e.g. 221-15-1234"
              />
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" /> Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
                placeholder="e.g. Computer Science & Engineering"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" /> Phone Number
              </label>
              <input
                type="text"
                value={primaryNumber}
                onChange={(e) => setPrimaryNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
                placeholder="e.g. +880 1700 000000"
              />
            </div>

            {/* Blood Group */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-primary" /> Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Campus Address */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Campus / Living Address
              </label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition resize-none"
                placeholder="Enter your hall or local residential address..."
              />
            </div>
          </div>

          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border/30 pb-2 pt-4">
            Academic Status Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Current Semester */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" /> Current Semester
              </label>
              <input
                type="text"
                value={currentSemester}
                onChange={(e) => setCurrentSemester(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
                placeholder="e.g. Spring 2026"
              />
            </div>

            {/* Credits Enrolled */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Credits Enrolled
              </label>
              <input
                type="text"
                value={creditsEnrolled}
                onChange={(e) => setCreditsEnrolled(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
                placeholder="e.g. 15 Credits"
              />
            </div>

            {/* Current GPA */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" /> Current GPA
              </label>
              <input
                type="text"
                value={currentGPA}
                onChange={(e) => setCurrentGPA(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/40 focus:border-primary/60 text-sm text-foreground outline-none transition"
                placeholder="e.g. 3.85"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-border/30">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold shadow-md transition"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
