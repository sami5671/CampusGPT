'use client'

import { MessageSquare, Users, MapPin, BookOpen, Bell, FileText } from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: 'AI Chatbot',
    description: 'Ask university-related questions in natural language and get instant, accurate answers.',
  },
  {
    icon: Users,
    title: 'Faculty Directory',
    description: 'Find teacher email, office room, phone number and department information easily.',
  },
  {
    icon: MapPin,
    title: 'Campus Navigation',
    description: 'Find any office, classroom, laboratory or building location instantly.',
  },
  {
    icon: BookOpen,
    title: 'Academic Information',
    description: 'Search routines, exam schedules and academic calendars with ease.',
  },
  {
    icon: Bell,
    title: 'Notice Search',
    description: 'Find important notices using natural language queries.',
  },
  {
    icon: FileText,
    title: 'Application Templates',
    description: 'Download official university application formats and documents.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">Powerful Features</span>
            <br />
            <span className="text-foreground">For Every Student Need</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed to make university life easier and more connected.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="group relative p-6 rounded-2xl bg-card/50 border border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Content */}
                <div className="relative space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
