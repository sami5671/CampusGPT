'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, MessageSquare, Trash2, Loader2, Pencil, Check, X, User as UserIcon, Home } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getAuthToken } from '@/lib/get-token'

interface ConversationSummary {
  id: string
  title: string
  createdAt?: string
  updatedAt?: string
}

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeConversationId?: string | null
  onSelectConversation?: (id: string) => void
  onNewChat?: () => void
  refreshTrigger?: number
}

export function Sidebar({
  open,
  onOpenChange,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  refreshTrigger = 0,
}: SidebarProps) {
  const { user, isAuthenticated } = useAuth()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const hasAutoSelectedRef = useRef(false)

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setConversations([])
      return
    }

    setIsLoading(true)
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
      const token = getAuthToken()

      const res = await fetch(`${baseUrl}/chat/conversations`, {
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const data = await res.json()
      if (data?.status && Array.isArray(data?.data)) {
        setConversations(data.data)
        if (data.data.length > 0 && !activeConversationId && !hasAutoSelectedRef.current && onSelectConversation) {
          hasAutoSelectedRef.current = true
          onSelectConversation(data.data[0].id)
        }
      }
    } catch (e) {
      console.warn('Failed to fetch chat history:', e)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user?.id, activeConversationId, onSelectConversation])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations, refreshTrigger])

  const handleStartRename = (e: React.MouseEvent, chat: ConversationSummary) => {
    e.stopPropagation()
    setEditingId(chat.id)
    setEditTitle(chat.title)
  }

  const handleSaveRename = async (e: React.FormEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    const trimmed = editTitle.trim()
    if (!trimmed) {
      setEditingId(null)
      return
    }

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
      const token = getAuthToken()

      await fetch(`${baseUrl}/chat/conversations/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title: trimmed }),
      })

      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c))
      )
    } catch (err) {
      console.error('Error renaming conversation:', err)
    } finally {
      setEditingId(null)
    }
  }

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
      const token = getAuthToken()

      await fetch(`${baseUrl}/chat/conversations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeConversationId === id && onNewChat) {
        onNewChat()
      }
    } catch (err) {
      console.error('Error deleting conversation:', err)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 flex flex-col bg-card border-r border-border/40 transition-all duration-300 md:relative md:translate-x-0 ${
          open ? 'translate-x-0 w-64' : '-translate-x-full md:w-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <Link href="/" className="flex items-center gap-2 flex-1">
            <img
              src="/bot-avatar.jpg"
              alt="CampusGPT Bot Logo"
              className="w-8 h-8 rounded-lg object-cover border border-primary/40 shadow-sm"
            />
            <span className="font-bold text-foreground text-sm md:text-base">CampusGPT</span>
          </Link>
          <button
            onClick={() => onOpenChange(false)}
            className="md:hidden p-1 hover:bg-muted rounded text-muted-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-border/40">
          <button
            onClick={() => onNewChat && onNewChat()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground py-2.5 px-4 rounded-lg font-medium shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between px-2 mb-3">
            <p className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">
              Chat History
            </p>
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </div>

          {!isAuthenticated ? (
            <div className="p-3 text-center rounded-lg bg-muted/30 border border-border/30">
              <p className="text-xs text-muted-foreground mb-2">
                Log in to save and access your past chat history across sessions.
              </p>
            </div>
          ) : conversations.length === 0 && !isLoading ? (
            <div className="p-3 text-center rounded-lg bg-muted/20 border border-border/20">
              <p className="text-xs text-muted-foreground">No saved chats yet. Start a new question!</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {conversations.map((chat) => {
                const isActive = activeConversationId === chat.id
                const isEditing = editingId === chat.id

                if (isEditing) {
                  return (
                    <form
                      key={chat.id}
                      onSubmit={(e) => handleSaveRename(e, chat.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 p-1.5 rounded-lg bg-primary/10 border border-primary/50"
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        className="w-full text-xs bg-transparent text-foreground outline-none px-1 font-medium"
                      />
                      <button
                        type="submit"
                        className="p-1 hover:bg-primary/20 text-emerald-400 rounded transition"
                        title="Save title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 hover:bg-muted text-muted-foreground rounded transition"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )
                }

                return (
                  <div
                    key={chat.id}
                    onClick={() => onSelectConversation && onSelectConversation(chat.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition group ${
                      isActive
                        ? 'bg-primary/15 border border-primary/40 text-primary font-medium'
                        : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-xs truncate">{chat.title}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => handleStartRename(e, chat)}
                        className="p-1 hover:text-primary transition"
                        title="Rename chat"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteConversation(e, chat.id)}
                        className="p-1 hover:text-rose-400 transition"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 p-3 space-y-1 text-xs">
          <Link
            href="/student/profile"
            className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground px-2.5 py-2 rounded-lg hover:bg-primary/10 transition group"
          >
            <UserIcon className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="font-medium group-hover:text-primary transition">Edit Profile</span>
          </Link>
          <Link
            href="/"
            className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground px-2.5 py-2 rounded-lg hover:bg-muted/50 transition"
          >
            <Home className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>Back to Home</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
