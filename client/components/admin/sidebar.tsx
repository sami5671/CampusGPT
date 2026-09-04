'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, Building2, FileText, LogOut, Loader2, KeyRound } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
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

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Faculty', href: '/admin/faculty', icon: Users },
    { label: 'Office Directory', href: '/admin/offices', icon: Building2 },
    { label: 'Application Templates', href: '/admin/templates', icon: FileText },
    { label: 'Classes', href: '/admin/classes', icon: BookOpen },
    { label: 'Students', href: '/admin/students', icon: Users },
    { label: 'Profile & Password', href: '/admin/profile', icon: KeyRound },
  ]

  return (
    <div className="w-64 bg-card/80 backdrop-blur-sm border-r border-border/40 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border/40">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-foreground">CampusGPT Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-foreground border border-primary/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Actions & Logout */}
      <div className="p-4 border-t border-border/40 space-y-1.5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-card/80 transition"
        >
          ← Student Dashboard
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-card/80 transition"
        >
          ← Home Page
        </Link>

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition font-semibold text-left mt-2"
        >
          {loggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4 text-rose-400" />
          )}
          <span>Log Out Admin</span>
        </button>
      </div>
    </div>
  )
}
