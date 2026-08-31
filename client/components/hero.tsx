'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Bot, 
  ChevronRight, 
  Download, 
  ExternalLink, 
  FileText, 
  MapPin, 
  PlayCircle 
} from 'lucide-react'

interface MessageItem {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
  cardType?: 'map' | 'class' | 'faculty' | 'template'
  cardData?: any
}

const PRESET_CONVERSATIONS: MessageItem[] = [
  {
    id: '1',
    sender: 'user',
    text: 'Where is the Accounts & Registration Office located?',
    timestamp: '10:42 AM',
  },
  {
    id: '2',
    sender: 'assistant',
    text: 'The Accounts & Registration Office is located in Academic Building 1 on the 2nd Floor, Room 204.',
    timestamp: '10:42 AM',
    cardType: 'map',
    cardData: {
      name: 'Registration & Accounts Office',
      building: 'Academic Building 1',
      floor: '2nd Floor',
      room: 'Room 204',
      phone: '+880 1712-345678',
      hours: '09:00 AM - 05:00 PM (Sat - Wed)',
      mapUrl: 'https://maps.google.com/?q=Registration+Office',
    },
  },
  {
    id: '3',
    sender: 'user',
    text: 'Which class is running right now in CSE department?',
    timestamp: '10:43 AM',
  },
  {
    id: '4',
    sender: 'assistant',
    text: 'CSE-301 Data Structures & Algorithms is currently running in Academic Building 2, Room 301.',
    timestamp: '10:43 AM',
    cardType: 'class',
    cardData: {
      courseCode: 'CSE-301',
      courseTitle: 'Data Structures & Algorithms',
      instructor: 'Dr. Sarah Mitchell',
      room: 'Room 301 (Building 2)',
      time: '10:00 AM - 11:30 AM',
      days: 'Sat, Sun, Tue',
      status: 'running',
    },
  },
  {
    id: '5',
    sender: 'user',
    text: 'Can I get the Semester Freeze Application template?',
    timestamp: '10:44 AM',
  },
  {
    id: '6',
    sender: 'assistant',
    text: 'Here is the official Semester Freeze Application template. You can download and fill it out.',
    timestamp: '10:44 AM',
    cardType: 'template',
    cardData: {
      title: 'Semester Freeze Application',
      category: 'Academic Form',
      format: 'PDF / Image Format',
      downloadUrl: '/admin/templates',
    },
  },
  {
    id: '7',
    sender: 'user',
    text: 'Who is the Head of Computer Science Department?',
    timestamp: '10:45 AM',
  },
  {
    id: '8',
    sender: 'assistant',
    text: 'Dr. James Wilson is the Head of CSE Department. Here are his office room and contact details:',
    timestamp: '10:45 AM',
    cardType: 'faculty',
    cardData: {
      name: 'Dr. James Wilson',
      designation: 'Department Head & Professor',
      department: 'Computer Science & Engineering',
      officeRoom: 'Room 402, Building A',
      email: 'jwilson@university.edu',
      hours: '02:00 PM - 04:00 PM (Sun, Tue)',
    },
  },
]

export default function Hero() {
  const [messages, setMessages] = useState<MessageItem[]>([PRESET_CONVERSATIONS[0], PRESET_CONVERSATIONS[1]])
  const [isTyping, setIsTyping] = useState(false)
  const [nextIndex, setNextIndex] = useState(2)

  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, isTyping])

  // Simulated continuous live chatting stream loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (isTyping) return

      if (nextIndex < PRESET_CONVERSATIONS.length) {
        setIsTyping(true)
        setTimeout(() => {
          setMessages(prev => [...prev, PRESET_CONVERSATIONS[nextIndex], PRESET_CONVERSATIONS[nextIndex + 1]])
          setNextIndex(prev => prev + 2)
          setIsTyping(false)
        }, 1400)
      } else {
        // Reset loop smoothly
        setMessages([PRESET_CONVERSATIONS[0], PRESET_CONVERSATIONS[1]])
        setNextIndex(2)
      }
    }, 7000)

    return () => clearInterval(interval)
  }, [nextIndex, isTyping])

  const handleQuickPromptClick = (promptText: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: MessageItem = {
      id: Date.now().toString(),
      sender: 'user',
      text: promptText,
      timestamp: now,
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    setTimeout(() => {
      const matchIndex = PRESET_CONVERSATIONS.findIndex(
        m => m.sender === 'assistant' && (m.cardData?.name?.toLowerCase().includes(promptText.toLowerCase()) || m.text.toLowerCase().includes(promptText.toLowerCase()))
      )
      
      const assistantMsg = matchIndex !== -1 ? PRESET_CONVERSATIONS[matchIndex] : {
        id: (Date.now() + 1).toString(),
        sender: 'assistant' as const,
        text: `Here is the requested information for "${promptText}". All details are updated live in real time.`,
        timestamp: now,
        cardType: 'map' as const,
        cardData: {
          name: promptText,
          building: 'Main Administrative Complex',
          floor: 'Ground Floor',
          room: 'Room 101',
          hours: '09:00 AM - 05:00 PM',
          mapUrl: 'https://maps.google.com',
        }
      }

      setMessages(prev => [...prev, assistantMsg])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <section className="min-h-screen pt-24 pb-12 flex items-center justify-center relative overflow-hidden px-4">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/3 right-1/6 w-[450px] h-[450px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Hero Copy & CTA */}
          <div className="lg:col-span-6 space-y-8 mt-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                <span className="gradient-text">Instant Answers for</span>
                <br />
                <span className="text-foreground">Campus Life & Academics</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                Ask anything about your university: faculty contacts, live running classes, office maps, announcements, and application templates—all powered by intelligent real-time AI.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 justify-center lg:justify-start">
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-95 text-white font-bold text-base px-8 py-6 rounded-2xl shadow-xl shadow-primary/25 transition-all flex items-center gap-2 group">
                  <span>Start Chatting Now</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button variant="outline" className="border-border/60 hover:bg-card/80 text-foreground font-semibold px-8 py-6 text-base rounded-2xl backdrop-blur-sm">
                  Admin Portal
                </Button>
              </Link>
            </div>

            {/* Quick Interactive Prompt Chips */}
            <div className="pt-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Try Asking Campus AI:</p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {[
                  '📍 Registration Office Map',
                  '📚 Running Class Now?',
                  '👨‍🏫 Contact CSE Head',
                  '📄 Semester Freeze Template',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickPromptClick(prompt.replace(/^[^\s]+\s/, ''))}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-card/60 border border-border/40 hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all duration-200 backdrop-blur-md shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Live Streaming AI Chat Window */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl bg-card/40 border border-border/50 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl shadow-primary/10 overflow-hidden max-w-lg mx-auto lg:max-w-none">
              
              {/* Top Header of Simulated Live AI Window */}
              <div className="flex items-center justify-between pb-4 border-b border-border/30 mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="/bot-avatar.jpg"
                      alt="CampusGPT Bot Avatar"
                      className="w-10 h-10 rounded-2xl object-cover border border-primary/40 shadow-md"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-card animate-pulse"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <span>CampusGPT Assistant</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        LIVE
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground">Connected to University Portal</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                </div>
              </div>

              {/* Scrollable Live Chat Feed */}
              <div
                ref={chatScrollRef}
                className="h-[430px] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-300`}
                  >
                    {/* Message Bubble */}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-br-xs font-medium'
                          : 'bg-muted/60 text-foreground border border-border/40 rounded-bl-xs'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* 1. Shared Interactive Google Map Card */}
                      {msg.cardType === 'map' && msg.cardData && (
                        <div className="mt-3 p-3 rounded-xl bg-card border border-border/40 space-y-2 text-foreground text-xs shadow-md">
                          <div className="flex items-center gap-2 font-bold text-primary">
                            <MapPin className="w-4 h-4 text-rose-400" />
                            <span>{msg.cardData.name}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
                            <div>🏢 {msg.cardData.building}</div>
                            <div>🚪 {msg.cardData.room}</div>
                            <div>🕒 {msg.cardData.hours}</div>
                            <div>📞 {msg.cardData.phone}</div>
                          </div>
                          <a
                            href={msg.cardData.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-[11px] font-semibold transition"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>View on Google Maps</span>
                            <ExternalLink className="w-3 h-3 ml-auto" />
                          </a>
                        </div>
                      )}

                      {/* 2. Shared Live Running Class Schedule Card */}
                      {msg.cardType === 'class' && msg.cardData && (
                        <div className="mt-3 p-3 rounded-xl bg-card border border-border/40 space-y-2 text-foreground text-xs shadow-md">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold px-2 py-0.5 rounded bg-primary/15 text-primary text-[11px] border border-primary/30">
                              {msg.cardData.courseCode}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
                              <PlayCircle className="w-3 h-3" /> Running Now
                            </span>
                          </div>
                          <p className="font-bold text-sm text-foreground">{msg.cardData.courseTitle}</p>
                          <div className="text-[11px] text-muted-foreground space-y-1">
                            <div>👨‍🏫 Instructor: <strong className="text-foreground">{msg.cardData.instructor}</strong></div>
                            <div>📍 Location: <strong className="text-foreground">{msg.cardData.room}</strong></div>
                            <div>🕒 Time (BST): <strong className="text-foreground">{msg.cardData.time}</strong></div>
                          </div>
                        </div>
                      )}

                      {/* 3. Shared Faculty Contact Card */}
                      {msg.cardType === 'faculty' && msg.cardData && (
                        <div className="mt-3 p-3 rounded-xl bg-card border border-border/40 space-y-2 text-foreground text-xs shadow-md">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                              JW
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-xs">{msg.cardData.name}</p>
                              <p className="text-[10px] text-muted-foreground">{msg.cardData.designation}</p>
                            </div>
                          </div>
                          <div className="text-[11px] text-muted-foreground space-y-1 border-t border-border/30 pt-2">
                            <div>🏢 Office: <strong className="text-foreground">{msg.cardData.officeRoom}</strong></div>
                            <div>✉️ Email: <strong className="text-primary">{msg.cardData.email}</strong></div>
                            <div>🕒 Office Hours: <strong className="text-foreground">{msg.cardData.hours}</strong></div>
                          </div>
                        </div>
                      )}

                      {/* 4. Shared Application Template Card */}
                      {msg.cardType === 'template' && msg.cardData && (
                        <div className="mt-3 p-3 rounded-xl bg-card border border-border/40 space-y-2 text-foreground text-xs shadow-md">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-accent" />
                            <span className="font-bold text-foreground">{msg.cardData.title}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{msg.cardData.category} • Official University Format</p>
                          <Link
                            href={msg.cardData.downloadUrl}
                            className="inline-flex items-center gap-1.5 w-full justify-center px-3 py-1.5 rounded-lg bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 text-[11px] font-semibold transition mt-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Template File</span>
                          </Link>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {/* Animated Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 bg-muted/40 border border-border/40 rounded-2xl px-4 py-2.5 text-xs text-muted-foreground w-fit animate-pulse">
                    <Bot className="w-4 h-4 text-primary animate-spin" />
                    <span>CampusGPT is processing your query...</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
