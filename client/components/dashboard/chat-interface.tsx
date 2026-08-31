'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { QuickActions } from './quick-actions'
import { FormattedMessageContent } from './formatted-message-content'

interface Message {
  id: string
  sender: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
}

interface ChatInterfaceProps {
  messages: Message[]
  isLoading?: boolean
  onSendMessage: (content: string) => void
}

export function ChatInterface({ messages, isLoading = false, onSendMessage }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isComposing, setIsComposing] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input)
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full p-4 md:p-6 gap-4">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 rounded-lg bg-gradient-to-b from-card/20 to-transparent p-4">
        {messages.length === 1 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <img
                src="/bot-avatar.jpg"
                alt="CampusGPT Bot"
                className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-primary/60 shadow-xl object-cover"
              />
              <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to CampusGPT</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Ask me anything about your university. From class schedules to faculty information, I&apos;m here to help!
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start items-start'}`}
          >
            {message.sender === 'assistant' && (
              <img
                src="/bot-avatar.jpg"
                alt="CampusGPT Assistant"
                className="w-8 h-8 rounded-full object-cover border border-primary/40 flex-shrink-0 mt-1 shadow-md"
              />
            )}
            <div
              className={`max-w-xs md:max-w-xl lg:max-w-2xl px-4 py-3.5 rounded-2xl shadow-sm ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground rounded-br-xs font-medium'
                  : 'bg-card/90 border border-border/50 backdrop-blur-md text-foreground rounded-bl-xs'
              }`}
            >
              {message.sender === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              ) : (
                <FormattedMessageContent content={message.content} />
              )}

              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-border/30 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Sources:</span>
                  {message.sources.map((source, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/25 shadow-xs"
                    >
                      🎓 {source}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start items-center gap-3">
            <img
              src="/bot-avatar.jpg"
              alt="Bot"
              className="w-8 h-8 rounded-full object-cover border border-primary/40 animate-pulse"
            />
            <div className="max-w-xs md:max-w-md px-4 py-3 rounded-lg bg-card border border-border/40 text-foreground rounded-bl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Searching campus database...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions - Show only on first message */}
      {messages.length === 1 && <QuickActions onSelectAction={onSendMessage} />}

      {/* Input Area */}
      <div className="flex gap-3">
        <div className="flex-1 flex gap-2 bg-card border border-border/40 rounded-lg p-2 focus-within:border-primary/60 transition">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="Ask anything about your university (e.g. Who is Dr. James Wilson?)..."
            className="flex-1 bg-transparent text-foreground placeholder-muted-foreground outline-none resize-none max-h-24 text-sm"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-foreground rounded-md transition flex-shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
