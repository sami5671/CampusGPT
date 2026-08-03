'use client'

import { Sparkles } from 'lucide-react'

export function RightSidebar() {
  const suggestions = [
    'What are the library hours?',
    'How do I register for courses?',
    'Tell me about the computer labs',
    'When is the next campus event?',
  ]

  const contextCards = [
    {
      title: 'Current Semester',
      content: 'Spring 2026',
      icon: '📅',
    },
    {
      title: 'Credits Enrolled',
      content: '15 Credits',
      icon: '📚',
    },
    {
      title: 'Current GPA',
      content: '3.85',
      icon: '⭐',
    },
    {
      title: 'Attendance',
      content: '94%',
      icon: '✓',
    },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-l border-border/40 p-4 gap-6 overflow-y-auto">
      {/* Suggestions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Suggestions</h3>
        </div>
        <div className="space-y-2">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              className="w-full text-left text-sm p-3 rounded-lg bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition line-clamp-2"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Context Cards */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Your Status</h3>
        <div className="space-y-3">
          {contextCards.map((card, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-border/40"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
                <span className="text-lg">{card.icon}</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{card.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto p-3 rounded-lg bg-muted/30 border border-border/40">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Ask me about specific classes, faculty members, or campus facilities for detailed information.
        </p>
      </div>
    </aside>
  )
}
