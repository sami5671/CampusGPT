'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, MessageSquare, X, Send, Loader2, Sparkles, RefreshCw } from 'lucide-react'
import { FormattedMessageContent } from './dashboard/formatted-message-content'
import { getAuthToken } from '@/lib/get-token'

interface Message {
  id: string
  sender: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      content: "Hi! 👋 I'm CampusGPT, your AI campus assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])

  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isLoading])

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || input).trim()
    if (!textToSend || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: textToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!queryText) setInput('')
    setIsLoading(true)

    try {
      const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const baseUrl = rawBaseUrl.replace(/\/+$/, '')
      const token = getAuthToken()

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }

      const bodyPayload = {
        message: textToSend,
        conversation_id: conversationId || undefined,
      }

      const response = await fetch(`${baseUrl}/chat/query`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(bodyPayload),
      })

      const data = await response.json()

      if (response.ok && data?.status && data?.data?.answer) {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          content: data.data.answer,
          timestamp: new Date(),
          sources: data.data.sources || [],
        }
        setMessages((prev) => [...prev, assistantMsg])

        if (data.data.conversation_id) {
          setConversationId(data.data.conversation_id)
        }
      } else {
        const fallbackMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          content: data?.message || 'Unable to connect to Campus AI Assistant. Please verify that the backend server is running.',
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendMessage()
    }
  }


  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[350px] sm:w-[400px] h-[520px] mb-4 bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 transition-all">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary/90 to-accent/90 text-foreground flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-white/30 shadow-inner">
                <img src="/bot-avatar.jpg" alt="CampusGPT Bot" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-primary rounded-full"></span>
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-none text-white">CampusGPT Assistant</h3>
                <p className="text-[11px] text-white/80 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300 inline" /> AI-Powered Engine
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-card/30 to-background/50 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start items-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <img
                    src="/bot-avatar.jpg"
                    alt="Bot"
                    className="w-7 h-7 rounded-full object-cover border border-primary/30 flex-shrink-0 mt-1 shadow-sm"
                  />
                )}
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-br-xs shadow-sm font-medium'
                      : 'bg-muted/80 backdrop-blur-md border border-border/50 text-foreground rounded-bl-xs shadow-sm'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <FormattedMessageContent content={msg.content} />
                  )}

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/20 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-[10px] uppercase text-muted-foreground/80">Sources:</span>
                      {msg.sources.map((s, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium text-[10px]">
                          🎓 {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="block text-[10px] mt-1 opacity-60 text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start items-center gap-2">
                <img
                  src="/bot-avatar.jpg"
                  alt="Bot"
                  className="w-7 h-7 rounded-full object-cover border border-primary/30 animate-pulse"
                />
                <div className="px-3.5 py-2.5 rounded-2xl bg-muted/80 border border-border/50 text-foreground rounded-bl-xs flex items-center gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-muted-foreground">Retrieving campus database context...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-card border-t border-border/50 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Campus AI..."
              disabled={isLoading}
              className="flex-1 bg-muted/40 border border-border/40 focus:border-primary/60 rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none transition"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-40 text-primary-foreground rounded-xl transition flex-shrink-0 shadow-sm"
              aria-label="Send Message"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-card border-2 border-primary/60 shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden"
        aria-label="Toggle Assistant Chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground transition-transform duration-300 group-hover:rotate-90" />
        ) : (
          <div className="relative w-full h-full p-0.5">
            <img
              src="/bot-avatar.jpg"
              alt="Bot Assistant"
              className="w-full h-full rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-background rounded-full shadow-sm animate-pulse"></span>
          </div>
        )}
      </button>
    </div>
  )
}
