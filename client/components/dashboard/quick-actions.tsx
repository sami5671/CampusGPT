'use client'

import { Calendar, Users, Map, Bell } from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      icon: Calendar,
      label: 'Class Schedule',
      description: 'View today&apos;s classes',
    },
    {
      icon: Users,
      label: 'Faculty Info',
      description: 'Contact professors',
    },
    {
      icon: Map,
      label: 'Campus Map',
      description: 'Navigate the campus',
    },
    {
      icon: Bell,
      label: 'Announcements',
      description: 'Latest updates',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.label}
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border/40 hover:border-primary/60 hover:bg-primary/5 transition"
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
