'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'
import { getCurrentUser } from '@/actions/auth-actions'
import { Loader2 } from 'lucide-react'

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function verifyStudentSession() {
      try {
        const res = await getCurrentUser()
        if (res.status && res.user) {
          setUser(res.user)
          setLoading(false)
        } else {
          // Unauthenticated -> redirect to login
          router.push('/login')
        }
      } catch (error) {
        router.push('/login')
      }
    }

    verifyStudentSession()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f0117] text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
          <p className="text-sm font-medium text-muted-foreground">Verifying Student Portal Session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <Topbar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          user={user}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
