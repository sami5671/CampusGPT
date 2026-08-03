'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/dashboard/chat-interface'
import { RightSidebar } from '@/components/dashboard/right-sidebar'

interface Message {
  id: string
  sender: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function StudentDashboardPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      content: 'Hello! I&apos;m CampusGPT, your AI-powered university assistant. How can I help you today? You can ask me about class schedules, faculty information, campus navigation, or anything related to university life.',
      timestamp: new Date(Date.now() - 3600000),
    },
  ])

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: getAssistantResponse(content),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    }, 800)
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  )
}

function getAssistantResponse(query: string): string {
  const responses: Record<string, string> = {
    'class': 'Your class schedule for tomorrow:\n\n📚 Data Structures (10:00 AM - 11:30 AM) - Room 301, Building A\n💻 Web Development (2:00 PM - 3:30 PM) - Lab 5, Building B',
    'faculty': 'Here are faculty members you can contact:\n\n👨‍🏫 Dr. James Wilson - Department of Computer Science (jwilson@university.edu)\n👩‍🏫 Prof. Sarah Chen - Mathematics (schen@university.edu)',
    'campus': 'Popular campus locations:\n\n📍 Main Library - Building C, Floor 3\n📍 Student Center - Central Plaza\n📍 Cafeteria - Ground Floor, Building A',
    'announcement': 'Latest announcements:\n\n📢 New course registration opens on March 15th\n📢 Campus maintenance scheduled for weekends\n📢 Spring fest registration closed',
  }

  for (const [key, value] of Object.entries(responses)) {
    if (query.toLowerCase().includes(key)) {
      return value
    }
  }

  return 'That&apos;s a great question! I&apos;m here to help with information about your university. You can ask me about classes, faculty, campus navigation, or announcements.'
}
