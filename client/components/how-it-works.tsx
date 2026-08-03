'use client'

import { ArrowDown } from 'lucide-react'

const steps = [
  {
    number: '1',
    title: 'Ask Your Question',
    description: 'Type any question about your university in natural language.',
  },
  {
    number: '2',
    title: 'AI Searches Knowledge Base',
    description: 'Our AI instantly searches through comprehensive university data.',
  },
  {
    number: '3',
    title: 'Get Accurate Answers',
    description: 'Receive detailed, relevant answers in seconds.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">How It Works</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps to get all the information you need.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, idx) => (
            <div key={idx}>
              <div className="flex gap-8 items-start">
                {/* Step circle */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-primary/30">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-lg">{step.description}</p>
                </div>
              </div>

              {/* Arrow */}
              {idx < steps.length - 1 && (
                <div className="flex justify-center py-4">
                  <div className="animate-bounce">
                    <ArrowDown className="w-6 h-6 text-accent" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
    </section>
  )
}
