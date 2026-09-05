'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StudentsPageRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/users')
  }, [router])

  return (
    <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
      Redirecting to User Management...
    </div>
  )
}
