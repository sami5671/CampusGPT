'use client'

import React, { createContext, useContext, useState } from 'react'

interface Message {
  id: string
  sender: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
}

interface ChatSessionContextType {
  activeConversationId: string | null
  setActiveConversationId: (id: string | null) => void
  refreshTrigger: number
  triggerSidebarRefresh: () => void
  selectedMessages: Message[] | null
  setSelectedMessages: (messages: Message[] | null) => void
}

const ChatSessionContext = createContext<ChatSessionContextType | undefined>(undefined)

export function ChatSessionProvider({ children }: { children: React.ReactNode }) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedMessages, setSelectedMessages] = useState<Message[] | null>(null)

  const triggerSidebarRefresh = () => setRefreshTrigger((prev) => prev + 1)

  return (
    <ChatSessionContext.Provider
      value={{
        activeConversationId,
        setActiveConversationId,
        refreshTrigger,
        triggerSidebarRefresh,
        selectedMessages,
        setSelectedMessages,
      }}
    >
      {children}
    </ChatSessionContext.Provider>
  )
}

export function useChatSession() {
  const context = useContext(ChatSessionContext)
  if (!context) {
    return {
      activeConversationId: null,
      setActiveConversationId: () => {},
      refreshTrigger: 0,
      triggerSidebarRefresh: () => {},
      selectedMessages: null,
      setSelectedMessages: () => {},
    }
  }
  return context
}
