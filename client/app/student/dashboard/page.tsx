'use client'

import { useState, useEffect } from 'react'
import { ChatInterface } from '@/components/dashboard/chat-interface'
import { RightSidebar } from '@/components/dashboard/right-sidebar'
import { useChatSession } from '@/lib/chat-session-context'

interface Message {
  id: string
  sender: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
}

const defaultWelcomeMessage: Message = {
  id: '1',
  sender: 'assistant',
  content: "Hi! 👋 I'm CampusGPT, your AI campus assistant. How can I help you today?",
  timestamp: new Date(Date.now() - 3600000),
}

export default function StudentDashboardPage() {
  const [messages, setMessages] = useState<Message[]>([defaultWelcomeMessage])
  const [isLoading, setIsLoading] = useState(false)
  const {
    activeConversationId,
    setActiveConversationId,
    selectedMessages,
    triggerSidebarRefresh,
  } = useChatSession()

  useEffect(() => {
    if (selectedMessages) {
      setMessages(selectedMessages)
    } else {
      setMessages([defaultWelcomeMessage])
    }
  }, [selectedMessages])

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
      let token = ''
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|; )admin_token=([^;]*)/)
        if (match) token = match[1]
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }

      const bodyPayload = {
        message: content,
        conversation_id: activeConversationId || undefined,
      }

      let response: Response | null = null

      try {
        response = await fetch(`${baseUrl}/chat/query`, {
          method: 'POST',
          credentials: 'include',
          headers,
          body: JSON.stringify(bodyPayload),
        })
      } catch (err) {
        if (baseUrl !== 'http://localhost:8000') {
          response = await fetch('http://localhost:8000/chat/query', {
            method: 'POST',
            credentials: 'include',
            headers,
            body: JSON.stringify(bodyPayload),
          })
        } else {
          throw err
        }
      }

      if (!response.ok && baseUrl !== 'http://localhost:8000') {
        response = await fetch('http://localhost:8000/chat/query', {
          method: 'POST',
          credentials: 'include',
          headers,
          body: JSON.stringify(bodyPayload),
        })
      }

      const data = await response.json()

      if (data?.status && data?.data?.answer) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          content: data.data.answer,
          timestamp: new Date(),
          sources: data.data.sources || [],
        }
        setMessages((prev) => [...prev, assistantMessage])

        if (data.data.conversation_id) {
          setActiveConversationId(data.data.conversation_id)
          triggerSidebarRefresh()
        }
      } else {
        const fallbackMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          content: data?.message || 'Unable to connect to Campus AI Assistant. Please ensure the backend FastAPI server is running.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, fallbackMsg])
      }
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: 'Error connecting to Campus AI service. Please verify that the FastAPI backend server is running at http://localhost:8000.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatInterface messages={messages} isLoading={isLoading} onSendMessage={handleSendMessage} />
      </div>

      {/* Right Sidebar */}
      <RightSidebar onSelectSuggestion={handleSendMessage} />
    </div>
  )
}
