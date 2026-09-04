'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, LogOut, ShieldCheck, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'

export function AdminTopbar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Failed to log out:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  const adminName = user?.name || user?.fullName || 'Administrator'
  const adminEmail = user?.email || 'admin@university.edu'

  return (
    <div className="h-16 border-b border-border/40 bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search admin records, classes, faculty..."
            className="pl-10 bg-muted/50 border-border/40 text-foreground placeholder:text-muted-foreground focus:border-primary/60 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="flex items-center gap-4 ml-auto">
        <Link
          href="/admin/profile"
          className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer"
          title="Go to Admin Profile & Password Settings"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              {adminName}
            </p>
            <p className="text-[11px] text-muted-foreground">{adminEmail}</p>
          </div>

          {/* Profile Avatar Badge */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-white font-bold text-xs shadow-md shadow-primary/20">
            {adminName.charAt(0).toUpperCase()}
          </div>
        </Link>

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title="Log Out Administrator Session"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all text-xs font-semibold"
        >
          {loggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Log Out</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
