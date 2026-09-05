'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck, 
  User,
  ArrowRight,
  School
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { handleUserLogin, getCurrentUser } from '@/actions/auth-actions'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { setSessionUser } = useAuth()
  const [role, setRole] = useState<'student' | 'admin'>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function checkExistingSession() {
      const res = await getCurrentUser()
      if (res.status && res.user) {
        setSessionUser(res.user, res.token)
        const dest = res.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'
        router.push(dest)
      }
    }
    checkExistingSession()
  }, [router, setSessionUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    
    if (!email || !password) {
      setErrorMsg('Please fill in all required fields.')
      return
    }

    setIsLoading(true)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('role', role)

    const res = await handleUserLogin(formData)
    setIsLoading(false)

    if (!res.status) {
      setErrorMsg(res.error || 'User is not registered! Please create an account first.')
      return
    }

    if (res.user) {
      setSessionUser(res.user, res.token)
    }

    const redirectPath = res.user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'
    setSuccessMsg(`Successfully authenticated as ${res.user?.role || 'student'}! Redirecting to student portal...`)
    setTimeout(() => {
      router.push(redirectPath)
    }, 800)
  }

  const handleQuickDemo = (demoRole: 'student' | 'admin') => {
    setRole(demoRole)
    setErrorMsg('')
    if (demoRole === 'student') {
      setEmail('student@gmail.com')
      setPassword('campus123!@#')
    } else {
      setEmail('admin@gmail.com')
      setPassword('campus123!@#')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0117] text-foreground flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#3b82f6]/30 via-[#06b6d4]/20 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#a855f7]/30 via-[#3b82f6]/20 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 blur-[150px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" 
      />

      <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Brand Showcase Panel */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#1a1226]/90 to-[#120a1d]/90 backdrop-blur-xl border border-[#2d2240] rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Top Brand Tag */}
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
              <Link href="/" className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Link>
            </div>

            <div className="space-y-3 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#a855f7]/30 bg-[#a855f7]/10 text-[#a855f7] text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Campus Portal
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                Empowering your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] via-[#06b6d4] to-[#a855f7]">academic journey</span>
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Access your personalized AI tutor, class schedules, campus maps, and administrative services instantly.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 bg-[#2d2240]/40 p-3.5 rounded-2xl border border-white/5">
                <div className="p-2 rounded-xl bg-[#3b82f6]/20 text-[#3b82f6] shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Smart Course Assistance</h4>
                  <p className="text-[11px] text-muted-foreground">Instant answers to assignments, syllabus & grade queries.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#2d2240]/40 p-3.5 rounded-2xl border border-white/5">
                <div className="p-2 rounded-xl bg-[#06b6d4]/20 text-[#06b6d4] shrink-0 mt-0.5">
                  <School className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Campus Directory & Events</h4>
                  <p className="text-[11px] text-muted-foreground">Locate classrooms, lab timings, and faculty office hours.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#2d2240]/40 p-3.5 rounded-2xl border border-white/5">
                <div className="p-2 rounded-xl bg-[#a855f7]/20 text-[#a855f7] shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Secure University SSO</h4>
                  <p className="text-[11px] text-muted-foreground">Protected with enterprise-grade encrypted authentication.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Quick Demo Login Presets */}
          <div className="pt-6 border-t border-[#2d2240] mt-6">
            <p className="text-[11px] text-muted-foreground mb-2.5 font-medium flex items-center justify-between">
              <span>Try quick demo credentials:</span>
              <span className="text-[10px] text-[#06b6d4]">Click to auto-fill</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button 
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="px-2.5 py-1 rounded-lg bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 border border-[#3b82f6]/30 text-[#3b82f6] text-[11px] transition-all flex items-center gap-1.5"
              >
                <User className="w-3 h-3" /> Student Demo
              </button>

              <button 
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="px-2.5 py-1 rounded-lg bg-[#a855f7]/10 hover:bg-[#a855f7]/20 border border-[#a855f7]/30 text-[#a855f7] text-[11px] transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3 h-3" /> Admin Demo
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="lg:col-span-7 bg-gradient-to-b from-[#1a1226] to-[#140d21] border border-[#2d2240] rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col justify-center relative">
          {/* Subtle Top Glow line */}
          <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-50" />
          
          <div className="space-y-6 max-w-md mx-auto w-full">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Log In
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Enter your campus credentials to access your dashboard
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="p-1 rounded-xl bg-[#0f0117] border border-[#2d2240] grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  role === 'student'
                    ? 'bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-white shadow-md'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Student
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  role === 'admin'
                    ? 'bg-gradient-to-r from-[#a855f7] to-[#3b82f6] text-white shadow-md'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Admin
              </button>
            </div>

            {/* Notification Messages */}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex justify-between">
                  <span>Campus Email / Student ID</span>
                  <span className="text-[10px] text-muted-foreground/80">e.g. user@campus.edu</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-[#0f0117]/80 border-[#2d2240] focus:border-[#3b82f6] focus:ring-[#3b82f6]/30 text-white h-11 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-muted-foreground">
                    Password
                  </label>
                  <a 
                    href="#forgot" 
                    onClick={(e) => { e.preventDefault(); setErrorMsg('Password reset link sent to your campus email.'); }}
                    className="text-xs text-[#06b6d4] hover:text-[#3b82f6] transition-colors"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 bg-[#0f0117]/80 border-[#2d2240] focus:border-[#06b6d4] focus:ring-[#06b6d4]/30 text-white h-11 rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#2d2240] bg-[#0f0117] text-[#3b82f6] focus:ring-[#3b82f6]/40 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">
                    Keep me signed in on this device
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-2 bg-gradient-to-r from-[#3b82f6] via-[#06b6d4] to-[#a855f7] hover:opacity-95 text-white font-semibold rounded-xl border-0 shadow-lg shadow-[#3b82f6]/25 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Social Auth Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2d2240]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#140d21] px-3 text-muted-foreground">
                  Or sign in with SSO
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setEmail('google.student@campus.edu'); setPassword('googleAuth123!'); }}
                className="flex items-center justify-center gap-2 h-10 rounded-xl bg-[#0f0117] border border-[#2d2240] hover:border-[#3b82f6]/50 hover:bg-[#1a1226] text-xs text-foreground font-medium transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 12s.6 2.6 1.6 4.6l3.7-2.8z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"/>
                </svg>
                <span>Google Campus</span>
              </button>

              <button
                type="button"
                onClick={() => { setEmail('github.student@campus.edu'); setPassword('githubAuth123!'); }}
                className="flex items-center justify-center gap-2 h-10 rounded-xl bg-[#0f0117] border border-[#2d2240] hover:border-[#a855f7]/50 hover:bg-[#1a1226] text-xs text-foreground font-medium transition-all"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>GitHub SSO</span>
              </button>
            </div>

            {/* Bottom Register Prompt */}
            <p className="text-center text-xs text-muted-foreground pt-2">
              Don&apos;t have a campus account?{' '}
              <Link 
                href="/register" 
                className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:underline"
              >
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
