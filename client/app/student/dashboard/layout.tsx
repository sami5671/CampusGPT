'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'
import { getCurrentUser } from '@/actions/auth-actions'
import { Loader2 } from 'lucide-react'
import { ChatSessionProvider, useChatSession } from '@/lib/chat-session-context'

function StudentDashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const {
    activeConversationId,
    setActiveConversationId,
    refreshTrigger,
    setSelectedMessages,
    triggerSidebarRefresh,
  } = useChatSession()

  useEffect(() => {
    async function verifyStudentSession() {
      try {
        const res = await getCurrentUser()
        if (res.status && res.user) {
          setUser(res.user)
          setLoading(false)
        } else {
          router.push('/login')
        }
      } catch (error) {
        router.push('/login')
      }
    }

    verifyStudentSession()
  }, [router])

  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id)
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
      let token = ''
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|; )admin_token=([^;]*)/)
        if (match) token = match[1]
      }

      const res = await fetch(`${baseUrl}/chat/conversations/${id}`, {
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const data = await res.json()
      if (data?.status && data?.data?.messages) {
        const parsedMsgs = data.data.messages.map((m: any, idx: number) => ({
          id: `${id}-${idx}`,
          sender: m.sender,
          content: m.content,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
          sources: m.sources || [],
        }))
        setSelectedMessages(parsedMsgs)
      }
    } catch (e) {
      console.error('Error fetching conversation detail:', e)
    }
  }

  const handleNewChat = () => {
    setActiveConversationId(null)
    setSelectedMessages(null)
  }

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
      <Sidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        refreshTrigger={refreshTrigger}
      />

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

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatSessionProvider>
      <StudentDashboardContent>{children}</StudentDashboardContent>
    </ChatSessionProvider>
  )
}
