'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight,
  BookOpen,
  IdCard,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { handleRegister } from '@/actions/auth-actions'

export default function RegisterPage() {
  const router = useRouter()
  const [role] = useState<'student'>('student')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [department, setDepartment] = useState('Computer Science & Engineering')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Calculate password strength score (0-4)
  const calculatePasswordStrength = (pass: string) => {
    let score = 0
    if (!pass) return score
    if (pass.length >= 6) score += 1
    if (pass.length >= 10) score += 1
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1
    return score
  }

  const passwordScore = calculatePasswordStrength(password)

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0: return { label: 'Too Weak', color: 'bg-[#2d2240]' }
      case 1: return { label: 'Weak', color: 'bg-red-500' }
      case 2: return { label: 'Fair', color: 'bg-amber-500' }
      case 3: return { label: 'Good', color: 'bg-cyan-500' }
      case 4: return { label: 'Strong & Secure', color: 'bg-emerald-500' }
      default: return { label: '', color: '' }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!fullName || !email || !idNumber || !password || !confirmPassword) {
      setErrorMsg('Please fill in all mandatory fields.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service & Privacy Policy.')
      return
    }

    setIsLoading(true)

    const formData = new FormData()
    formData.append('fullName', fullName)
    formData.append('email', email)
    formData.append('idNumber', idNumber)
    formData.append('department', department)
    formData.append('role', role)
    formData.append('password', password)

    const res = await handleRegister(formData)
    setIsLoading(false)

    if (!res.status) {
      setErrorMsg(res.error || 'Registration failed. Please check your information.')
      return
    }

    setSuccessMsg('Account created successfully! Redirecting to login...')
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#0f0117] text-foreground flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#a855f7]/30 via-[#3b82f6]/20 to-transparent blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-[#3b82f6]/30 via-[#06b6d4]/20 to-transparent blur-[150px] pointer-events-none" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-6">
        
        {/* Left Side: Registration Form */}
        <div className="lg:col-span-7 bg-gradient-to-b from-[#1a1226] to-[#140d21] border border-[#2d2240] rounded-3xl p-6 sm:p-9 shadow-2xl flex flex-col justify-center relative">
          {/* Subtle Accent Glow bar */}
          <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7] to-transparent opacity-60" />

          <div className="space-y-5 max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Create Account
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Join CampusGPT to unlock your personalized AI academic assistant
                </p>
              </div>
              <Link href="/" className="lg:hidden text-xs text-muted-foreground hover:text-white flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Link>
            </div>



            {/* Alerts */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                {successMsg}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name & Student/Staff ID Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Alex Johnson"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="pl-10 bg-[#0f0117]/80 border-[#2d2240] focus:border-[#3b82f6] focus:ring-[#3b82f6]/30 text-white h-10 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Student ID
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="CS-2026-8901"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      required
                      className="pl-10 bg-[#0f0117]/80 border-[#2d2240] focus:border-[#06b6d4] focus:ring-[#06b6d4]/30 text-white h-10 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Campus Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex justify-between">
                  <span>University Email Address</span>
                  <span className="text-[10px] text-[#06b6d4]">Must end with .edu</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="alex.johnson@campus.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-[#0f0117]/80 border-[#2d2240] focus:border-[#3b82f6] focus:ring-[#3b82f6]/30 text-white h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Department / Major Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Department / Field of Study</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 bg-[#0f0117]/80 border border-[#2d2240] focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/30 text-white h-10 rounded-xl text-xs outline-none cursor-pointer"
                  >
                    <option value="Computer Science & Engineering" className="bg-[#1a1226]">Computer Science & Engineering</option>
                    <option value="Electrical Engineering" className="bg-[#1a1226]">Electrical Engineering</option>
                    <option value="Business & Finance" className="bg-[#1a1226]">Business & Finance</option>
                    <option value="Biomedical Sciences" className="bg-[#1a1226]">Biomedical Sciences</option>
                    <option value="Mathematics & Physics" className="bg-[#1a1226]">Mathematics & Physics</option>
                    <option value="Arts & Humanities" className="bg-[#1a1226]">Arts & Humanities</option>
                  </select>
                </div>
              </div>

              {/* Passwords Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-9 bg-[#0f0117]/80 border-[#2d2240] focus:border-[#06b6d4] focus:ring-[#06b6d4]/30 text-white h-10 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 pr-9 bg-[#0f0117]/80 border-[#2d2240] focus:border-[#a855f7] focus:ring-[#a855f7]/30 text-white h-10 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="space-y-1 pt-0.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span className="font-semibold text-white">{getStrengthLabel(passwordScore).label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-full rounded-full transition-colors duration-300 ${
                          passwordScore >= level
                            ? getStrengthLabel(passwordScore).color
                            : 'bg-[#2d2240]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-[#2d2240] bg-[#0f0117] text-[#3b82f6] focus:ring-[#3b82f6]/40 cursor-pointer"
                  />
                  <span className="text-[11px] text-muted-foreground leading-snug group-hover:text-white transition-colors">
                    I agree to CampusGPT&apos;s{' '}
                    <a href="#terms" className="text-[#06b6d4] hover:underline">Terms of Service</a>
                    {' '}and acknowledge the{' '}
                    <a href="#privacy" className="text-[#a855f7] hover:underline">Privacy Policy</a>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-3 bg-gradient-to-r from-[#3b82f6] via-[#06b6d4] to-[#a855f7] hover:opacity-95 text-white font-semibold rounded-xl border-0 shadow-lg shadow-[#3b82f6]/25 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Campus Account...</span>
                  </div>
                ) : (
                  <>
                    <span>Create Campus Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Already registered */}
            <p className="text-center text-xs text-muted-foreground pt-1">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:underline"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Showcase Panel */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#1a1226]/90 to-[#120a1d]/90 backdrop-blur-xl border border-[#2d2240] rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b82f6] via-[#06b6d4] to-[#a855f7] p-0.5 shadow-lg shadow-[#3b82f6]/30 group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-[#0f0117] rounded-[10px] flex items-center justify-center">
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#3b82f6] to-[#a855f7] font-black text-xl">C</span>
                  </div>
                </div>
                <span className="font-bold text-xl tracking-tight text-white group-hover:text-[#06b6d4] transition-colors">
                  CampusGPT
                </span>
              </Link>
              <Link href="/" className="hidden lg:flex text-xs text-muted-foreground hover:text-white items-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back Home
              </Link>
            </div>

            <div className="space-y-3 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 text-[#06b6d4] text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" /> Instant Student Onboarding
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] via-[#06b6d4] to-[#a855f7]">15,000+ Students</span> and Faculty
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Streamline your campus life with AI-driven timetable resolution, faculty contact recommendations, and smart study guides.
              </p>
            </div>

            {/* Checklist items */}
            <div className="space-y-3 pt-2">
              {[
                'Personalized AI Study & Exam Assistant',
                'Real-time Class Schedule & Room Locator',
                'Direct Faculty & Lab Assistant Messaging',
                '24/7 Academic Record & Document Queries'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs text-foreground/90 bg-[#2d2240]/40 p-3 rounded-xl border border-white/5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof Quote */}
          <div className="pt-6 border-t border-[#2d2240] mt-6">
            <div className="bg-[#0f0117]/60 p-4 rounded-2xl border border-white/5 space-y-2">
              <p className="text-xs text-muted-foreground italic">
                &ldquo;CampusGPT cut my daily course tracking time in half. Getting quick answers about room changes and assignment deadlines is so effortless.&rdquo;
              </p>
              <div className="flex items-center gap-2.5 pt-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#a855f7] flex items-center justify-center text-white font-bold text-xs">
                  S
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-white">Sophia Martinez</h5>
                  <p className="text-[10px] text-muted-foreground">Computer Science Senior</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
