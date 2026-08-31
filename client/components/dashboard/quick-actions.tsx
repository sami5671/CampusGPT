'use client'

import { Calendar, Users, Map, Bell } from 'lucide-react'

interface QuickActionsProps {
  onSelectAction?: (query: string) => void
}

export function QuickActions({ onSelectAction }: QuickActionsProps) {
  const actions = [
    {
      icon: Calendar,
      label: 'Class Schedule',
      description: 'View today&apos;s classes',
      query: 'What is my class schedule?',
    },
    {
      icon: Users,
      label: 'Faculty Info',
      description: 'Contact professors',
      query: 'Show me the faculty information and professors.',
    },
    {
      icon: Map,
      label: 'Campus Map',
      description: 'Navigate the campus',
      query: 'Where are the main campus buildings and offices located?',
    },
    {
      icon: Bell,
      label: 'Announcements',
      description: 'Latest updates',
      query: 'What are the latest campus announcements?',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.label}
            onClick={() => onSelectAction && onSelectAction(action.query)}
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border/40 hover:border-primary/60 hover:bg-primary/5 transition text-left"
          >
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-foreground text-center">{action.label}</span>
            <span className="text-xs text-muted-foreground text-center">{action.description}</span>
          </button>
        )
      })}
    </div>
  )
}
