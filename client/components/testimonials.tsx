'use client'

import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Alex Johnson',
    department: 'Computer Science',
    review: 'CampusGPT saved me so much time! Instead of searching through multiple portals, I get instant answers to all my academic questions.',
    avatar: '👨‍🎓',
  },
  {
    name: 'Maria Garcia',
    department: 'Engineering',
    review: 'The AI is incredibly accurate with campus information. It helped me find the correct department office on my first day.',
    avatar: '👩‍🎓',
  },
  {
    name: 'David Chen',
    department: 'Business Administration',
    review: 'Available 24/7, always helpful. CampusGPT is like having a personal university assistant in your pocket.',
    avatar: '👩‍⚕️',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 px-4 bg-muted/20">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">Student Stories</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what students are saying about CampusGPT.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="group relative p-8 rounded-2xl bg-card/50 border border-border/40 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              {/* Content */}
              <div className="relative space-y-4">
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>

                {/* Review */}
                <p className="text-foreground leading-relaxed italic">{`"${testimonial.review}"`}</p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.department}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background elements */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10"></div>
    </section>
  )
}
