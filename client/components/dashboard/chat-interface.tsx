'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { QuickActions } from './quick-actions'

interface Message {
  id: string
  sender: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => void
}

export function ChatInterface({ messages, onSendMessage }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isComposing, setIsComposing] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (input.trim()) {
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
              <div className="text-4xl mb-4">🎓</div>
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
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-foreground rounded-br-none'
                  : 'bg-card border border-border/40 text-foreground rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions - Show only on first message */}
      {messages.length === 1 && <QuickActions />}

      {/* Input Area */}
      <div className="flex gap-3">
        <div className="flex-1 flex gap-2 bg-card border border-border/40 rounded-lg p-2 focus-within:border-primary/60 transition">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="Ask anything about your university..."
            className="flex-1 bg-transparent text-foreground placeholder-muted-foreground outline-none resize-none max-h-24 text-sm"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-foreground rounded-md transition flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
