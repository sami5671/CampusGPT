'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth-actions'
import { Loader2 } from 'lucide-react'

export default function RootDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    async function redirectRoleDashboard() {
      try {
        const res = await getCurrentUser()
        if (res.status && res.user) {
          if (res.user.role === 'admin') {
            router.push('/admin/dashboard')
          } else {
            router.push('/student/dashboard')
          }
        } else {
          router.push('/login')
        }
      } catch (error) {
        router.push('/login')
      }
    }

    redirectRoleDashboard()
  }, [router])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0f0117] text-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
        <p className="text-sm font-medium text-muted-foreground">Redirecting to your portal...</p>
      </div>
    </div>
  )
}
