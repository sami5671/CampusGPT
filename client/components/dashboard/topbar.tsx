'use client'

import { Menu, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { handleAdminLogout } from '@/actions/auth-actions'

interface TopbarProps {
  onMenuClick: () => void
  user?: {
    fullName?: string
    email?: string
    role?: string
  } | null
}

export function Topbar({ onMenuClick, user }: TopbarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await handleAdminLogout()
    router.push('/login')
  }

  // Generate initials
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <div className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border/40 bg-card/50 backdrop-blur-sm">
      {/* Left: Menu and Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Campus AI Assistant</span>
        </div>
      </div>

      {/* Right: User Profile & Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-foreground">
            {user?.fullName || 'Campus User'}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {user?.role || 'Student'}
          </p>
        </div>
        
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3b82f6] via-[#06b6d4] to-[#a855f7] flex items-center justify-center text-white font-bold text-xs shadow-md shadow-[#3b82f6]/20">
          {initials}
        </div>

        <button
          onClick={handleLogout}
          title="Log Out"
          className="p-2 rounded-xl hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors ml-1"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
