'use client'

import { getCurrentUser } from '@/actions/auth-actions'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminTopbar } from '@/components/admin/topbar'
import { Button } from '@/components/ui/button'
import { Loader2, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await getCurrentUser()
        if (res.status && res.user && res.user.role === 'admin') {
          setIsAuthorized(true)
          setCurrentUser(res.user)
        } else {
          setIsAuthorized(false)
        }
      } catch (error) {
        setIsAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAuth()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f0117] text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
          <p className="text-sm font-medium text-muted-foreground">Verifying Administrator Privileges...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f0117] text-white p-4">
        <div className="max-w-md w-full bg-[#1a1226] border border-[#2d2240] rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-destructive/15 border border-destructive/30 text-destructive flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight">Access Denied</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You do not have administrative permissions to view this portal. Only authorized administrators can access the admin dashboard.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Link href="/dashboard">
              <Button variant="outline" className="border-[#2d2240] text-xs">
                Go to Student Dashboard
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-[#3b82f6] to-[#a855f7] text-xs text-white border-0">
                Log In as Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
