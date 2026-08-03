'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown 
} from 'lucide-react'

export default function Navbar() {
  let user: any = null
  let isAuthenticated = false
  let logout = async () => {}

  try {
    const auth = useAuth()
    user = auth.user
    isAuthenticated = auth.isAuthenticated
    logout = auth.logout
  } catch (e) {
    // Gracefully handle if context is unmounted
  }

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const dashboardHref = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-xl text-foreground">CampusGPT</span>
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition text-sm">Home</Link>
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition text-sm">Features</Link>
              <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition text-sm">How it Works</Link>
              <Link href="#faq" className="text-muted-foreground hover:text-foreground transition text-sm">FAQ</Link>
              <Link href="#contact" className="text-muted-foreground hover:text-foreground transition text-sm">Contact</Link>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 items-center">
            {mounted && isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* Dashboard Button */}
                <Link href={dashboardHref}>
                  <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white gap-2 text-xs sm:text-sm font-semibold shadow-md shadow-primary/20">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>

                {/* User Dropdown / Profile Badge */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-foreground leading-none group-hover:text-primary transition-colors">
                        {user.name || user.email.split('@')[0]}
                      </p>
                      <span className="text-[10px] text-muted-foreground capitalize font-medium flex items-center gap-1 mt-0.5">
                        {user.role === 'admin' ? (
                          <span className="text-amber-400 font-bold flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> Admin
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                            <UserCheck className="w-2.5 h-2.5" /> Student
                          </span>
                        )}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-card border border-border/40 shadow-2xl p-1.5 space-y-1 animate-in fade-in duration-150 z-50">
                      <div className="px-3 py-2 border-b border-border/30">
                        <p className="text-xs font-bold text-foreground truncate">{user.name || user.email}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                      </div>
                      
                      <Link
                        href={dashboardHref}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted/50 transition font-medium"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                        <span>Go to Dashboard</span>
                      </Link>

                      <button
                        onClick={async () => {
                          setDropdownOpen(false)
                          await logout()
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition font-medium text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="border-border/60 hover:bg-card/80 text-xs sm:text-sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-white border-0 text-xs sm:text-sm font-medium shadow-md shadow-primary/20">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
