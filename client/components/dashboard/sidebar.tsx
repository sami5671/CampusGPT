'use client'

import Link from 'next/link'
import { ChevronLeft, Plus } from 'lucide-react'

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const chatHistories = [
    { id: '1', title: 'Class Schedule Question', date: 'Today' },
    { id: '2', title: 'Faculty Information', date: 'Yesterday' },
    { id: '3', title: 'Campus Tour Route', date: '2 days ago' },
    { id: '4', title: 'Exam Preparation Tips', date: '1 week ago' },
    { id: '5', title: 'Course Registration Help', date: '2 weeks ago' },
  ]

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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-foreground text-sm md:text-base">CampusGPT</span>
          </Link>
          <button
            onClick={() => onOpenChange(false)}
            className="md:hidden p-1 hover:bg-muted rounded"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-border/40">
          <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-foreground-inverted py-2 px-4 rounded-lg font-medium transition">
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3 px-2">CHAT HISTORY</p>
          <div className="space-y-2">
            {chatHistories.map((chat) => (
              <button
                key={chat.id}
                className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition group"
              >
                <p className="text-sm text-foreground group-hover:text-primary transition truncate">
                  {chat.title}
                </p>
                <p className="text-xs text-muted-foreground">{chat.date}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 p-4 space-y-2">
          <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground px-2 py-2 rounded hover:bg-muted/50 transition">
            Settings
          </button>
          <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground px-2 py-2 rounded hover:bg-muted/50 transition">
            Help & Support
          </button>
          <Link
            href="/"
            className="w-full text-left text-sm text-muted-foreground hover:text-foreground px-2 py-2 rounded hover:bg-muted/50 transition block"
          >
            Back to Home
          </Link>
        </div>
      </aside>
    </>
  )
}
